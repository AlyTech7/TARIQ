import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { DestinationZone, CargoCategory } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  publicProcedure,
} from "../init";
import { reserveTicketAtomic } from "@/server/lib/quota-lock";
import { addNotificationJob, addPDFJob } from "@/server/jobs/queue";
import { checkRateLimit } from "../middleware/rateLimit";
import { enforceWilayaAccess } from "../middleware/auth";
import { reserveTicketSchema } from "@/lib/validations/ticket.schema";
import { MAX_LATE_CANCELLATIONS } from "@/lib/constants";

export const ticketsRouter = createTRPCRouter({
  reserve: protectedProcedure
    .input(reserveTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const rateCheck = await checkRateLimit(ctx.userId);
      if (!rateCheck.success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "RATE_LIMIT_EXCEEDED",
        });
      }

      const ticket = await reserveTicketAtomic({
        userId: ctx.userId,
        wilaya: ctx.user.wilaya,
        travelDate: input.travelDate,
        destination: input.destination as DestinationZone,
        passengerName: input.passengerName,
        passengerPhone: input.passengerPhone,
        cargoItems: input.cargoItems.map((item) => ({
          ...item,
          category: item.category as CargoCategory,
        })),
        notes: input.notes,
      });

      await addNotificationJob({
        type: "TICKET_CREATED",
        userId: ctx.userId,
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        travelDate: input.travelDate,
      });

      await addPDFJob({ type: "TICKET", ticketId: ticket.id });

      return ticket;
    }),

  myTickets: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.db.ticket.findMany({
        where: { userId: ctx.userId },
        include: {
          cargoItems: true,
          quota: { select: { date: true, wilaya: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined;
      if (tickets.length > input.limit) {
        nextCursor = tickets.pop()!.id;
      }

      return { tickets, nextCursor };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: {
          cargoItems: true,
          user: { select: { fullName: true, arabicName: true } },
        },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
      return ticket;
    }),

  activeTicket: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.ticket.findFirst({
      where: {
        userId: ctx.userId,
        status: { in: ["PENDING_VERIFICATION", "VERIFIED"] },
      },
      include: { cargoItems: true },
    });
  }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
          status: { in: ["PENDING_VERIFICATION", "VERIFIED"] },
        },
      });
      if (!ticket)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TICKET_NOT_FOUND_OR_NOT_CANCELLABLE",
        });

      const now = new Date();
      const travelDateTime = new Date(ticket.travelDate);
      const hoursUntilTravel =
        (travelDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isLateCancellation = hoursUntilTravel < 24;

      await ctx.db.$transaction(async (tx) => {
        await tx.ticket.update({
          where: { id: input.id },
          data: {
            status: isLateCancellation
              ? "CANCELLED_LATE"
              : "CANCELLED_BY_USER",
            cancelledAt: now,
            notes: input.reason,
          },
        });

        await tx.dailyQuota.update({
          where: { id: ticket.quotaId },
          data: { usedSlots: { decrement: 1 } },
        });

        if (isLateCancellation) {
          const updatedUser = await tx.user.update({
            where: { id: ctx.userId },
            data: { lateCancellations: { increment: 1 } },
          });

          if (updatedUser.lateCancellations >= MAX_LATE_CANCELLATIONS) {
            const suspendUntil = new Date();
            suspendUntil.setDate(suspendUntil.getDate() + 14);
            await tx.user.update({
              where: { id: ctx.userId },
              data: {
                isSuspended: true,
                suspendedUntil: suspendUntil,
                suspensionReason: "MAX_LATE_CANCELLATIONS_REACHED",
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            userId: ctx.userId,
            action: isLateCancellation
              ? "TICKET_CANCELLED_LATE"
              : "TICKET_CANCELLED",
            entityType: "Ticket",
            entityId: input.id,
            metadata: { reason: input.reason, hoursUntilTravel },
          },
        });
      });

      await addNotificationJob({
        type: "PROCESS_WAITLIST",
        wilaya: ticket.wilayaOrigin,
        travelDate: ticket.travelDate,
        quotaId: ticket.quotaId,
      });

      return { success: true, isLateCancellation };
    }),

  markCompleted: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: { id: input.id },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.user.role === "WILAYA_ADMIN") {
        enforceWilayaAccess(ctx.user.managedWilaya, ticket.wilayaOrigin);
      }

      const updated = await ctx.db.$transaction(async (tx) => {
        const result = await tx.ticket.update({
          where: { id: input.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        await tx.auditLog.create({
          data: {
            adminId: ctx.userId,
            action: "TICKET_COMPLETED",
            entityType: "Ticket",
            entityId: input.id,
          },
        });
        return result;
      });

      return updated;
    }),

  markNoShow: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: { id: input.id },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.user.role === "WILAYA_ADMIN") {
        enforceWilayaAccess(ctx.user.managedWilaya, ticket.wilayaOrigin);
      }

      const updated = await ctx.db.$transaction(async (tx) => {
        const result = await tx.ticket.update({
          where: { id: input.id },
          data: { status: "NO_SHOW" },
        });
        await tx.auditLog.create({
          data: {
            adminId: ctx.userId,
            action: "TICKET_NO_SHOW",
            entityType: "Ticket",
            entityId: input.id,
          },
        });
        return result;
      });

      return updated;
    }),

  adminList: adminProcedure
    .input(
      z.object({
        date: z.coerce.date().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const date = input.date ?? new Date();
      date.setHours(0, 0, 0, 0);

      const wilayaFilter =
        ctx.user.role === "WILAYA_ADMIN" && ctx.user.managedWilaya
          ? { wilayaOrigin: ctx.user.managedWilaya }
          : {};

      return ctx.db.ticket.findMany({
        where: {
          travelDate: date,
          ...wilayaFilter,
          ...(input.status ? { status: input.status as never } : {}),
        },
        include: {
          user: {
            select: { fullName: true, arabicName: true, phone: true },
          },
          cargoItems: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }),
});

export const publicTicketsRouter = createTRPCRouter({
  availability: publicProcedure
    .input(z.object({ date: z.coerce.date() }))
    .query(async ({ ctx, input }) => {
      const quotas = await ctx.db.dailyQuota.findMany({
        where: { date: input.date },
        select: { wilaya: true, totalSlots: true, usedSlots: true },
      });

      return quotas.map((q) => ({
        wilaya: q.wilaya,
        total: q.totalSlots,
        used: q.usedSlots,
        available: q.totalSlots - q.usedSlots,
        percentFull: Math.round((q.usedSlots / q.totalSlots) * 100),
      }));
    }),

  verifyQR: publicProcedure
    .input(z.object({ qrToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: { qrToken: input.qrToken },
        include: {
          user: { select: { fullName: true, arabicName: true } },
          cargoItems: true,
        },
      });

      if (!ticket) return { valid: false as const, reason: "QR_NOT_FOUND" };
      if (ticket.status !== "VERIFIED")
        return {
          valid: false as const,
          reason: "TICKET_NOT_VERIFIED",
          status: ticket.status,
        };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const travelDate = new Date(ticket.travelDate);
      travelDate.setHours(0, 0, 0, 0);

      if (travelDate.getTime() !== today.getTime()) {
        return {
          valid: false as const,
          reason: "WRONG_DATE",
          travelDate: ticket.travelDate,
        };
      }

      return {
        valid: true as const,
        ticket: {
          code: ticket.ticketCode,
          passengerName: ticket.passengerName,
          arabicName: ticket.user.arabicName,
          wilayaOrigin: ticket.wilayaOrigin,
          destination: ticket.destination,
          travelDate: ticket.travelDate,
          cargoSummary: ticket.cargoItems.map((c) => ({
            category: c.category,
            quantity: c.quantity,
            unit: c.unit,
          })),
        },
      };
    }),
});
