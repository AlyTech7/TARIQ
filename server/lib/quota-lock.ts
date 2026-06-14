import { prisma } from "@/server/db";
import {
  type Wilaya,
  type DestinationZone,
  type CargoCategory,
} from "@prisma/client";
import { generateTicketCode } from "./ticket-code";
import {
  validateCargoItems,
  isCargoValid,
  type CargoItemInput,
} from "./cargo-rules";
import { TRPCError } from "@trpc/server";

interface ReserveTicketInput {
  userId: string;
  wilaya: Wilaya;
  travelDate: Date;
  destination: DestinationZone;
  passengerName: string;
  passengerPhone?: string;
  cargoItems: CargoItemInput[];
  notes?: string;
  fromWaitlistId?: string;
}

export async function reserveTicketAtomic(input: ReserveTicketInput) {
  const cargoValidation = validateCargoItems(input.cargoItems);

  if (!isCargoValid(cargoValidation)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "CARGO_VALIDATION_FAILED",
    });
  }

  return await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          verificationStatus: true,
          wilaya: true,
          isSuspended: true,
          suspendedUntil: true,
        },
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "USER_NOT_FOUND" });
      if (user.verificationStatus !== "APPROVED") {
        throw new TRPCError({ code: "FORBIDDEN", message: "USER_NOT_VERIFIED" });
      }
      if (
        user.isSuspended &&
        user.suspendedUntil &&
        user.suspendedUntil > new Date()
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "USER_SUSPENDED" });
      }
      if (user.wilaya !== input.wilaya) {
        throw new TRPCError({ code: "FORBIDDEN", message: "WRONG_WILAYA" });
      }

      const existingTicket = await tx.ticket.findFirst({
        where: {
          userId: input.userId,
          status: { in: ["PENDING_VERIFICATION", "VERIFIED"] },
        },
      });
      if (existingTicket) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "ALREADY_HAS_ACTIVE_TICKET",
        });
      }

      const quotas = await tx.$queryRaw<
        Array<{
          id: string;
          wilaya: string;
          date: Date;
          totalSlots: number;
          usedSlots: number;
        }>
      >`
        SELECT id, wilaya, date, "totalSlots", "usedSlots"
        FROM "DailyQuota"
        WHERE wilaya = ${input.wilaya}::"Wilaya"
        AND date = ${input.travelDate}::date
        FOR UPDATE
      `;

      if (quotas.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "QUOTA_NOT_FOUND_FOR_DATE",
        });
      }

      const quota = quotas[0]!;
      if (quota.usedSlots >= quota.totalSlots) {
        throw new TRPCError({ code: "CONFLICT", message: "QUOTA_FULL" });
      }

      await tx.$executeRaw`
        UPDATE "DailyQuota"
        SET "usedSlots" = "usedSlots" + 1
        WHERE id = ${quota.id}
      `;

      const initialStatus =
        user.verificationStatus === "APPROVED"
          ? "VERIFIED"
          : "PENDING_VERIFICATION";

      const ticketCode = await generateTicketCode(
        tx,
        input.wilaya,
        input.travelDate,
      );

      const ticket = await tx.ticket.create({
        data: {
          ticketCode,
          userId: input.userId,
          quotaId: quota.id,
          travelDate: input.travelDate,
          wilayaOrigin: input.wilaya,
          destination: input.destination,
          passengerName: input.passengerName,
          passengerPhone: input.passengerPhone,
          status: initialStatus,
          notes: input.notes,
          fromWaitlist: !!input.fromWaitlistId,
          waitlistId: input.fromWaitlistId,
          cargoItems: {
            create: cargoValidation.map((item) => ({
              category: item.category as CargoCategory,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              estimatedKg: item.estimatedKg,
              exceedsLimit: item.exceedsLimit,
              requiresAuth: item.requiresAuth,
              authDocUrl: item.authDocUrl,
              authDocKey: item.authDocKey,
            })),
          },
        },
        include: {
          cargoItems: true,
          user: {
            select: {
              fullName: true,
              arabicName: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: input.userId,
          action: "TICKET_CREATED",
          entityType: "Ticket",
          entityId: ticket.id,
          metadata: {
            ticketCode,
            wilaya: input.wilaya,
            destination: input.destination,
            travelDate: input.travelDate,
            cargoCount: input.cargoItems.length,
          },
        },
      });

      return ticket;
    },
    {
      timeout: 10000,
      isolationLevel: "Serializable",
    },
  );
}
