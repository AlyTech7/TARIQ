import { z } from "zod";
import { Wilaya } from "@prisma/client";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
  superAdminProcedure,
} from "../init";

export const quotasRouter = createTRPCRouter({
  byDate: publicProcedure
    .input(z.object({ date: z.coerce.date() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.dailyQuota.findMany({
        where: { date: input.date },
        orderBy: { wilaya: "asc" },
      });
    }),

  wilayaToday: publicProcedure
    .input(z.object({ wilaya: z.nativeEnum(Wilaya) }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const quota = await ctx.db.dailyQuota.findUnique({
        where: { wilaya_date: { wilaya: input.wilaya, date: today } },
      });

      if (!quota) return null;

      return {
        ...quota,
        available: quota.totalSlots - quota.usedSlots,
        percentFull: Math.round((quota.usedSlots / quota.totalSlots) * 100),
      };
    }),

  adminDashboard: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const wilaya =
      ctx.user.role === "WILAYA_ADMIN" && ctx.user.managedWilaya
        ? ctx.user.managedWilaya
        : undefined;

    if (!wilaya && ctx.user.role === "WILAYA_ADMIN") {
      return null;
    }

    const quota = wilaya
      ? await ctx.db.dailyQuota.findUnique({
          where: { wilaya_date: { wilaya, date: today } },
        })
      : null;

    const statusCounts = await ctx.db.ticket.groupBy({
      by: ["status"],
      where: {
        travelDate: today,
        ...(wilaya ? { wilayaOrigin: wilaya } : {}),
      },
      _count: true,
    });

    return { quota, statusCounts, date: today };
  }),

  updateConfig: superAdminProcedure
    .input(
      z.object({
        wilaya: z.nativeEnum(Wilaya),
        daily: z.number().min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const config = await tx.quotaConfig.upsert({
          where: { wilaya: input.wilaya },
          update: { daily: input.daily },
          create: { wilaya: input.wilaya, daily: input.daily },
        });

        await tx.auditLog.create({
          data: {
            adminId: ctx.userId,
            action: "QUOTA_MODIFIED",
            entityType: "QuotaConfig",
            entityId: config.id,
            metadata: { wilaya: input.wilaya, daily: input.daily },
          },
        });

        return config;
      });
    }),

  getConfigs: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.db.quotaConfig.findMany({ orderBy: { wilaya: "asc" } });
  }),
});
