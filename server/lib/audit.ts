import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  userId?: string;
  adminId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditParams) {
  return prisma.auditLog.create({ data: params });
}

export async function createAuditLogInTx(
  tx: Prisma.TransactionClient,
  params: AuditParams,
) {
  return tx.auditLog.create({ data: params });
}
