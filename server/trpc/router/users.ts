import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { VerificationStatus, Wilaya } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "../init";
import {
  updateProfileSchema,
  uploadDocumentSchema,
  completeOnboardingSchema,
  setWilayaSchema,
} from "@/lib/validations/user.schema";
import {
  getSignedDownloadUrl,
  createUploadTarget,
  generateDocumentKey,
} from "@/server/lib/r2";
import { enforceWilayaAccess } from "../middleware/auth";
import { sendVerificationEmail } from "@/server/lib/resend";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  onboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const u = ctx.user;
    return {
      wilayaSelected: !!u.wilaya,
      wilaya: u.wilaya,
      documentSubmitted: !!u.documentKey,
      documentType: u.documentType,
      verificationStatus: u.verificationStatus,
      canReserve: u.verificationStatus === "APPROVED",
      needsOnboarding:
        u.verificationStatus !== "APPROVED" &&
        (!u.documentKey || u.verificationStatus === "REJECTED"),
      rejectionNote: u.documentNote,
    };
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: input,
      });
    }),

  setWilaya: protectedProcedure
    .input(setWilayaSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.verificationStatus === "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "CANNOT_CHANGE_WILAYA_AFTER_APPROVAL",
        });
      }

      const wilayaChanged = ctx.user.wilaya !== input.wilaya;

      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          wilaya: input.wilaya,
          ...(wilayaChanged
            ? {
                verificationStatus: "PENDING" as VerificationStatus,
                documentKey: null,
                documentType: null,
                documentNote: null,
                verifiedAt: null,
                verifiedById: null,
              }
            : {}),
        },
      });
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        purpose: z.enum(["identity", "cargo"]).default("identity"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const key = generateDocumentKey(
        ctx.userId,
        `${input.purpose}-${input.filename}`,
      );
      const target = await createUploadTarget(key, input.contentType);
      return {
        url: target.url,
        key: target.key,
        mode: target.mode,
        method: target.method,
      };
    }),

  submitDocument: protectedProcedure
    .input(uploadDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.wilaya !== ctx.user.wilaya) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "DOCUMENT_WILAYA_MISMATCH",
        });
      }

      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          documentType: input.documentType,
          documentKey: input.documentKey,
          verificationStatus: "PENDING",
          documentNote: null,
        },
      });
    }),

  completeOnboarding: protectedProcedure
    .input(completeOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.verificationStatus === "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ALREADY_VERIFIED",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          wilaya: input.wilaya,
          documentType: input.documentType,
          documentKey: input.documentKey,
          verificationStatus: "PENDING",
          documentNote: null,
          verifiedAt: null,
          verifiedById: null,
          ...(input.fullName ? { fullName: input.fullName } : {}),
          ...(input.arabicName ? { arabicName: input.arabicName } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
        },
      });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.userId,
          action: "ONBOARDING_SUBMITTED",
          entityType: "User",
          entityId: ctx.userId,
          metadata: {
            wilaya: input.wilaya,
            documentType: input.documentType,
          },
        },
      });

      return user;
    }),

  getDocumentUrl: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { documentKey: true, wilaya: true },
      });
      if (!user?.documentKey)
        throw new TRPCError({ code: "NOT_FOUND", message: "NO_DOCUMENT" });

      if (ctx.user.role === "WILAYA_ADMIN") {
        enforceWilayaAccess(ctx.user.managedWilaya, user.wilaya);
      }

      const url = await getSignedDownloadUrl(user.documentKey);
      return { url };
    }),

  pendingVerification: adminProcedure.query(async ({ ctx }) => {
    const wilayaFilter =
      ctx.user.role === "WILAYA_ADMIN" && ctx.user.managedWilaya
        ? { wilaya: ctx.user.managedWilaya }
        : {};

    return ctx.db.user.findMany({
      where: {
        verificationStatus: "PENDING",
        documentKey: { not: null },
        ...wilayaFilter,
      },
      orderBy: { updatedAt: "asc" },
    });
  }),

  verifyUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        approved: z.boolean(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.user.role === "WILAYA_ADMIN") {
        enforceWilayaAccess(ctx.user.managedWilaya, user.wilaya);
      }

      const status: VerificationStatus = input.approved
        ? "APPROVED"
        : "REJECTED";

      const updated = await ctx.db.$transaction(async (tx) => {
        const result = await tx.user.update({
          where: { id: input.userId },
          data: {
            verificationStatus: status,
            documentNote: input.note,
            verifiedById: ctx.userId,
            verifiedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            userId: input.userId,
            adminId: ctx.userId,
            action: input.approved ? "USER_VERIFIED" : "USER_REJECTED",
            entityType: "User",
            entityId: input.userId,
            metadata: { note: input.note, wilaya: user.wilaya },
          },
        });

        return result;
      });

      if (user.email) {
        await sendVerificationEmail(user.email, input.approved, input.note);
      }

      return updated;
    }),
});
