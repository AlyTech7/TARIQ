"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { TicketQR } from "@/components/ticket/TicketQR";
import { DESTINATION_LABELS, WILAYA_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

export default function TicketQRPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations("ticket");

  const { data: ticket, isLoading } = trpc.tickets.byId.useQuery({ id });

  if (isLoading) return <div className="min-h-screen bg-night p-8 text-white">...</div>;
  if (!ticket) return <div className="min-h-screen bg-night p-8 text-white">No encontrado</div>;

  const destLabel =
    locale === "ar"
      ? DESTINATION_LABELS[ticket.destination]?.ar
      : DESTINATION_LABELS[ticket.destination]?.es;
  const wilayaLabel =
    WILAYA_LABELS[ticket.wilayaOrigin]?.[locale as "ar" | "es" | "fr"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night p-6 text-white">
      <TicketQR qrToken={ticket.qrToken} ticketCode={ticket.ticketCode} size={280} />
      <div className="mt-8 space-y-2 text-center">
        <p className="text-xl font-semibold">{ticket.passengerName}</p>
        <p className="text-sand">{formatDate(ticket.travelDate, locale)}</p>
        <p className="text-sand">
          {wilayaLabel} → {destLabel}
        </p>
        <p className="mt-6 text-sm text-sand/70">{t("checkpointHint")}</p>
      </div>
    </div>
  );
}
