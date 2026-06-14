import { TRPCError } from "@trpc/server";
import type { UserRole } from "@prisma/client";

export function enforceRole(
  userRole: UserRole,
  allowedRoles: UserRole[],
): void {
  if (!allowedRoles.includes(userRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_ROLE" });
  }
}

export function enforceWilayaAccess(
  managedWilaya: string | null | undefined,
  ticketWilaya: string,
): void {
  if (managedWilaya && managedWilaya !== ticketWilaya) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "WILAYA_ACCESS_DENIED",
    });
  }
}
