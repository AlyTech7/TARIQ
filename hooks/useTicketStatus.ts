"use client";

import { trpc } from "@/lib/trpc/client";

export function useTicketStatus(ticketId: string, intervalMs = 15000) {
  return trpc.tickets.byId.useQuery(
    { id: ticketId },
    { refetchInterval: intervalMs, enabled: !!ticketId },
  );
}
