"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { TicketStatusBadge } from "@/components/ticket/TicketStatusBadge";
import { DESTINATION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function AdminTicketsPage() {
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const { data: tickets, isLoading } = trpc.tickets.adminList.useQuery({});

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-polisario border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <AdminPageHeader
        badge="Operaciones"
        title="Tickets"
        subtitle={`${tickets?.length ?? 0} reservas registradas en tu wilaya`}
      />

      <AdminDataTable
        data={tickets ?? []}
        keyFn={(t) => t.id}
        emptyMessage="No hay tickets en tu wilaya"
        onRowClick={(t) =>
          window.location.assign(`/${locale}/admin/tickets/${t.id}`)
        }
        columns={[
          {
            key: "code",
            header: "Código",
            cell: (t) => (
              <span className="ticket-code text-xs">{t.ticketCode}</span>
            ),
          },
          {
            key: "passenger",
            header: "Pasajero",
            cell: (t) => (
              <div>
                <p className="font-medium">{t.passengerName}</p>
                <p className="text-xs text-text-main/45">{t.user.fullName}</p>
              </div>
            ),
          },
          {
            key: "destination",
            header: "Destino",
              cell: (t) => {
                const dest = DESTINATION_LABELS[t.destination];
                return dest?.[lang === "fr" ? "es" : lang] ?? t.destination;
              },
          },
          {
            key: "date",
            header: "Fecha",
            cell: (t) => (
              <span className="text-text-main/60">
                {formatDate(t.travelDate, locale)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Estado",
            cell: (t) => <TicketStatusBadge status={t.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "text-end",
            cell: (t) => (
              <Link
                href={`/${locale}/admin/tickets/${t.id}`}
                className="text-sm font-medium text-polisario hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Ver →
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
