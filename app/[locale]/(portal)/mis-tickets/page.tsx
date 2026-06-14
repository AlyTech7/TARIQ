"use client";

import { useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { TicketCard } from "@/components/ticket/TicketCard";

export default function MisTicketsPage() {
  const locale = useLocale();
  const { data, isLoading } = trpc.tickets.myTickets.useQuery({ limit: 20 });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis tickets</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {data?.tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            id={ticket.id}
            ticketCode={ticket.ticketCode}
            status={ticket.status}
            travelDate={ticket.travelDate}
            destination={ticket.destination}
            wilayaOrigin={ticket.wilayaOrigin}
          />
        ))}
      </div>
      {data?.tickets.length === 0 && (
        <p className="text-center text-text-main/60">No tienes tickets aún.</p>
      )}
    </div>
  );
}
