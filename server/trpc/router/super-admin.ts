import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { EmergencyType } from "@prisma/client";
import {
  createTRPCRouter,
  superAdminProcedure,
  publicProcedure,
} from "../init";

export const superAdminRouter = createTRPCRouter({
  globalStats: superAdminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quotas = await ctx.db.dailyQuota.findMany({
      where: { date: today },
    });

    const totalUsed = quotas.reduce((sum, q) => sum + q.usedSlots, 0);
    const totalSlots = quotas.reduce((sum, q) => sum + q.totalSlots, 0);

    const recentAudit = await ctx.db.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { fullName: true } },
      },
    });

    return { quotas, totalUsed, totalSlots, recentAudit, date: today };
  }),

  getEmergency: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.emergencyState.findFirst();
  }),

  activateEmergency: superAdminProcedure
    .input(
      z.object({
        type: z.nativeEnum(EmergencyType),
        messageAr: z.string().min(1),
        messageEs: z.string().min(1),
        messageFr: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const state = await ctx.db.emergencyState.findFirst();
      if (!state) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.emergencyState.update({
          where: { id: state.id },
          data: {
            isActive: true,
            type: input.type,
            messageAr: input.messageAr,
            messageEs: input.messageEs,
            messageFr: input.messageFr,
            activatedBy: ctx.userId,
            activatedAt: new Date(),
            resolvedAt: null,
          },
        });

        await tx.auditLog.create({
          data: {
            adminId: ctx.userId,
            action: "EMERGENCY_ACTIVATED",
            entityType: "EmergencyState",
            entityId: state.id,
            metadata: { type: input.type },
          },
        });

        return updated;
      });
    }),

  resolveEmergency: superAdminProcedure.mutation(async ({ ctx }) => {
    const state = await ctx.db.emergencyState.findFirst();
    if (!state) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.db.$transaction(async (tx) => {
      const updated = await tx.emergencyState.update({
        where: { id: state.id },
        data: {
          isActive: false,
          type: "NONE",
          resolvedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: ctx.userId,
          action: "EMERGENCY_RESOLVED",
          entityType: "EmergencyState",
          entityId: state.id,
        },
      });

      return updated;
    });
  }),

  auditLog: superAdminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.auditLog.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { fullName: true } },
        },
      });
    }),
});
