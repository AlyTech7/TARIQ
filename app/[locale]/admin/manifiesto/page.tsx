"use client";

import { trpc } from "@/lib/trpc/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { DESTINATION_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { useLocale } from "next-intl";

export default function ManifiestoPage() {
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const { data: tickets, isLoading } = trpc.tickets.adminList.useQuery({
    status: "VERIFIED",
  });

  return (
    <div className="animate-fade-up">
      <AdminPageHeader
        badge="Transporte"
        title="Manifiesto del día"
        subtitle="Listado oficial de pasajeros verificados para el convoy a la Zona Liberada"
        actions={
          <Button
            className="gap-2 bg-polisario print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-4 print:hidden">
        <div className="tariq-stat-card p-4 text-center">
          <p className="text-3xl font-bold text-polisario">
            {tickets?.length ?? 0}
          </p>
          <p className="text-xs text-text-main/45">Pasajeros verificados</p>
        </div>
        <div className="tariq-stat-card p-4 text-center">
          <p className="text-3xl font-bold text-text-main">
            {new Date().toLocaleDateString(locale)}
          </p>
          <p className="text-xs text-text-main/45">Fecha del manifiesto</p>
        </div>
        <div className="tariq-stat-card p-4 text-center">
          <FileText className="mx-auto h-6 w-6 text-sun" />
          <p className="mt-1 text-xs text-text-main/45">Documento oficial RASD</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-polisario border-t-transparent" />
        </div>
      ) : (
        <AdminDataTable
          data={tickets ?? []}
          keyFn={(t) => t.id}
          emptyMessage="No hay tickets verificados para hoy"
          columns={[
            {
              key: "n",
              header: "#",
              cell: (_, i) => (
                <span className="text-text-main/40">{i + 1}</span>
              ),
            },
            {
              key: "code",
              header: "Código",
              cell: (t) => (
                <span className="font-mono font-semibold text-polisario">
                  {t.ticketCode}
                </span>
              ),
            },
            {
              key: "passenger",
              header: "Pasajero",
              cell: (t) => t.passengerName,
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
              key: "cargo",
              header: "Carga",
              cell: (t) =>
                t.cargoItems
                  .map((c) => `${c.category} (${c.quantity}${c.unit})`)
                  .join(", ") || "—",
            },
          ]}
        />
      )}
    </div>
  );
}
