"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TicketStatusBadge } from "@/components/ticket/TicketStatusBadge";
import { DESTINATION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  User,
  Loader2,
} from "lucide-react";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const id = params.id as string;

  const { data: tickets, refetch, isLoading } =
    trpc.tickets.adminList.useQuery({});
  const ticket = tickets?.find((t) => t.id === id);

  const completeMutation = trpc.tickets.markCompleted.useMutation({
    onSuccess: () => refetch(),
  });
  const noShowMutation = trpc.tickets.markNoShow.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-polisario" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="tariq-admin-glass p-10 text-center">
        <p className="text-text-main/55">Ticket no encontrado</p>
        <Link href={`/${locale}/admin/tickets`}>
          <Button variant="outline" className="mt-4">
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <Link
        href={`/${locale}/admin/tickets`}
        className="inline-flex items-center gap-1 text-sm text-polisario hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a tickets
      </Link>

      <AdminPageHeader
        title={ticket.ticketCode}
        subtitle={`Reserva de ${ticket.passengerName}`}
        actions={<TicketStatusBadge status={ticket.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tariq-admin-glass space-y-4 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main/45">
            Datos del pasajero
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-polisario" />
              <div>
                <p className="text-xs text-text-main/45">Pasajero</p>
                <p className="font-medium">{ticket.passengerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-polisario" />
              <div>
                <p className="text-xs text-text-main/45">Titular cuenta</p>
                <p className="font-medium">{ticket.user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-polisario" />
              <div>
                <p className="text-xs text-text-main/45">Destino</p>
                <p className="font-medium">
                  {(() => {
                    const dest = DESTINATION_LABELS[ticket.destination];
                    return dest?.[lang === "fr" ? "es" : lang] ?? ticket.destination;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-polisario" />
              <div>
                <p className="text-xs text-text-main/45">Fecha de viaje</p>
                <p className="font-medium">
                  {formatDate(ticket.travelDate, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="tariq-admin-glass p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-main/45">
            Carga declarada
          </h3>
          {ticket.cargoItems.length > 0 ? (
            <ul className="space-y-2">
              {ticket.cargoItems.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-sand/15 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{c.category}</span>
                  <span className="text-text-main/55">
                    {c.quantity} {c.unit}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-main/45">Sin carga declarada</p>
          )}

          {ticket.status === "VERIFIED" && (
            <div className="mt-6 flex gap-3 border-t border-sand/25 pt-6">
              <Button
                className="flex-1 gap-2 bg-polisario"
                disabled={completeMutation.isPending}
                onClick={() => completeMutation.mutate({ id })}
              >
                <CheckCircle2 className="h-4 w-4" />
                Completado
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                disabled={noShowMutation.isPending}
                onClick={() => noShowMutation.mutate({ id })}
              >
                <XCircle className="h-4 w-4" />
                No-show
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
