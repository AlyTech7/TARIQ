"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { TicketStatusBadge } from "@/components/ticket/TicketStatusBadge";
import { TicketQR } from "@/components/ticket/TicketQR";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DESTINATION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("ticket");

  const { data: ticket, isLoading } = trpc.tickets.byId.useQuery({ id });
  const cancelMutation = trpc.tickets.cancel.useMutation({
    onSuccess: () => router.push(`/${locale}/mis-tickets`),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (!ticket) return <p>Ticket no encontrado</p>;

  const destLabel =
    locale === "ar"
      ? DESTINATION_LABELS[ticket.destination]?.ar
      : DESTINATION_LABELS[ticket.destination]?.es;

  const canCancel = ["PENDING_VERIFICATION", "VERIFIED"].includes(ticket.status);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Detalle del ticket
            <TicketStatusBadge status={ticket.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="ticket-code text-center">{ticket.ticketCode}</p>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-main/60">Pasajero</dt>
              <dd>{ticket.passengerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-main/60">Destino</dt>
              <dd>{destLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-main/60">Fecha</dt>
              <dd>{formatDate(ticket.travelDate, locale)}</dd>
            </div>
          </dl>

          {ticket.cargoItems.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Carga declarada</h3>
              <ul className="space-y-1 text-sm">
                {ticket.cargoItems.map((item) => (
                  <li key={item.id}>
                    {item.category}: {item.quantity} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/${locale}/mis-tickets/${id}/qr`}>
                {t("showQR")}
              </Link>
            </Button>
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm(t("cancelLateWarning"))) {
                    cancelMutation.mutate({ id });
                  }
                }}
                disabled={cancelMutation.isPending}
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <TicketQR qrToken={ticket.qrToken} ticketCode={ticket.ticketCode} />
      </div>
    </div>
  );
}
