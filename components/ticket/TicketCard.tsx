"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { DESTINATION_LABELS, WILAYA_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { TicketStatus } from "@prisma/client";

interface TicketCardProps {
  id: string;
  ticketCode: string;
  status: TicketStatus;
  travelDate: Date;
  destination: string;
  wilayaOrigin: string;
}

export function TicketCard({
  id,
  ticketCode,
  status,
  travelDate,
  destination,
  wilayaOrigin,
}: TicketCardProps) {
  const locale = useLocale();
  const destLabel =
    locale === "ar"
      ? DESTINATION_LABELS[destination]?.ar
      : DESTINATION_LABELS[destination]?.es;
  const wilayaLabel =
    WILAYA_LABELS[wilayaOrigin as keyof typeof WILAYA_LABELS]?.[
      locale as "ar" | "es" | "fr"
    ];

  return (
    <Card className="tariq-card-hover overflow-hidden border-sand/40">
      <CardHeader className="flex flex-row items-center justify-between bg-sand/10 pb-2">
        <TicketStatusBadge status={status} />
        <span className="font-mono text-xs font-bold text-polisario">
          {ticketCode}
        </span>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm font-medium text-text-main">
          {wilayaLabel} → {destLabel}
        </p>
        <p className="text-sm text-text-main/60">
          {formatDate(travelDate, locale)}
        </p>
        <Link
          href={`/${locale}/mis-tickets/${id}`}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-polisario/10 text-sm font-medium text-polisario transition-colors hover:bg-polisario hover:text-white"
        >
          Ver detalle
        </Link>
      </CardContent>
    </Card>
  );
}
