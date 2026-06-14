"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { TicketStatus } from "@prisma/client";

const STATUS_VARIANT: Record<
  TicketStatus,
  "pending" | "verified" | "destructive" | "cancelled" | "secondary"
> = {
  PENDING_VERIFICATION: "pending",
  VERIFIED: "verified",
  REJECTED: "destructive",
  CANCELLED_BY_USER: "cancelled",
  CANCELLED_LATE: "cancelled",
  COMPLETED: "verified",
  NO_SHOW: "destructive",
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const t = useTranslations("ticket.status");

  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {t(status)}
    </Badge>
  );
}
