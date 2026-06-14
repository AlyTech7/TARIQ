import type { User } from "@prisma/client";
import { prisma } from "@/server/db";
import type { CompleteOnboardingInput } from "@/lib/validations/user.schema";
import { isDatabaseConnectionError, resolveUser } from "./resolve-user";

export type OnboardingErrorCode =
  | "UNAUTHORIZED"
  | "DATABASE_UNAVAILABLE"
  | "USER_NOT_SYNCED"
  | "ALREADY_VERIFIED"
  | "INVALID_INPUT";

export class OnboardingError extends Error {
  constructor(
    public code: OnboardingErrorCode,
    public status: number,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "OnboardingError";
  }
}

export async function completeOnboardingForUser(
  clerkId: string,
  input: CompleteOnboardingInput,
): Promise<User> {
  let user: User | null;

  try {
    user = await resolveUser(clerkId);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      throw new OnboardingError(
        "DATABASE_UNAVAILABLE",
        503,
        "PostgreSQL no está disponible. Ejecuta: docker compose up -d && npm run db:push",
      );
    }
    throw err;
  }

  if (!user) {
    throw new OnboardingError(
      "USER_NOT_SYNCED",
      503,
      "No se pudo sincronizar tu cuenta con la base de datos.",
    );
  }

  if (user.verificationStatus === "APPROVED") {
    throw new OnboardingError("ALREADY_VERIFIED", 403);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
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

  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ONBOARDING_SUBMITTED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          wilaya: input.wilaya,
          documentType: input.documentType,
        },
      },
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      throw new OnboardingError("DATABASE_UNAVAILABLE", 503);
    }
    console.error("[onboarding-complete] audit log failed", err);
  }

  return updated;
}
