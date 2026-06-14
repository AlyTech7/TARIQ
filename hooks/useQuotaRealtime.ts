"use client";

import { trpc } from "@/lib/trpc/client";
import { useEffect } from "react";

export function useQuotaRealtime(date: Date, intervalMs = 30000) {
  const query = trpc.public.availability.useQuery(
    { date },
    { refetchInterval: intervalMs },
  );

  useEffect(() => {
    query.refetch();
  }, [date, query]);

  return query;
}
