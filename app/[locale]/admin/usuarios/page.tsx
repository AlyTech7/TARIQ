"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { WILAYA_LABELS, DOCUMENT_TYPE_INFO } from "@/lib/constants";
import { useLocale } from "next-intl";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  MapPin,
  Clock,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentType, Wilaya } from "@prisma/client";

export default function AdminUsuariosPage() {
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const { data: pending, refetch, isLoading } =
    trpc.users.pendingVerification.useQuery();
  const verifyMutation = trpc.users.verifyUser.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedId(null);
      setNote("");
    },
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data: docUrl, isLoading: docLoading } =
    trpc.users.getDocumentUrl.useQuery(
      { userId: selectedId! },
      { enabled: !!selectedId },
    );

  const selected = pending?.find((u) => u.id === selectedId);

  return (
    <div className="animate-fade-up">
      <AdminPageHeader
        badge="Verificación"
        title="Cola de verificación"
        subtitle="Revisa certificados de pertenencia y aprueba o rechaza solicitudes de campamento"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Queue */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-main/45">
              Pendientes
            </p>
            <span className="rounded-full bg-polisario/10 px-2.5 py-0.5 text-xs font-bold text-polisario">
              {pending?.length ?? 0}
            </span>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-polisario" />
            </div>
          )}

          {pending?.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedId(user.id)}
              className={cn(
                "tariq-stat-card w-full p-4 text-start transition-all",
                selectedId === user.id &&
                  "ring-2 ring-polisario shadow-lg shadow-polisario/10",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-polisario/10 text-polisario">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-main">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text-main/50">
                    <MapPin className="h-3 w-3" />
                    {WILAYA_LABELS[user.wilaya as Wilaya]?.[lang]}
                  </p>
                  {user.documentType && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-polisario/70">
                      <FileText className="h-3 w-3" />
                      {DOCUMENT_TYPE_INFO[user.documentType as DocumentType]
                        ?.desc[lang] ?? user.documentType}
                    </p>
                  )}
                </div>
                <Clock className="h-4 w-4 shrink-0 text-sand" />
              </div>
            </button>
          ))}

          {!isLoading && pending?.length === 0 && (
            <div className="tariq-admin-glass p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-polisario/40" />
              <p className="mt-3 font-medium text-text-main/60">
                Cola vacía
              </p>
              <p className="mt-1 text-xs text-text-main/40">
                No hay solicitudes pendientes de verificación
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="tariq-admin-glass overflow-hidden">
              <div className="border-b border-sand/25 bg-polisario/5 px-6 py-4">
                <h2 className="text-lg font-bold text-text-main">
                  {selected.fullName}
                </h2>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-main/55">
                  {selected.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {selected.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {WILAYA_LABELS[selected.wilaya as Wilaya]?.[lang]}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-main/45">
                  Documento de pertenencia
                </p>
                {docLoading ? (
                  <div className="flex h-80 items-center justify-center rounded-xl bg-sand/10">
                    <Loader2 className="h-6 w-6 animate-spin text-polisario" />
                  </div>
                ) : docUrl?.url ? (
                  <iframe
                    src={docUrl.url}
                    className="h-80 w-full rounded-xl border border-sand/30 bg-white"
                    title="Documento"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl bg-sand/10 text-sm text-text-main/45">
                    Documento no disponible
                  </div>
                )}

                <textarea
                  className="mt-4 w-full rounded-xl border border-sand/40 bg-white/60 p-3 text-sm outline-none focus:border-polisario focus:ring-2 focus:ring-polisario/20"
                  placeholder="Nota para el solicitante (opcional)..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="mt-4 flex gap-3">
                  <Button
                    className="flex-1 gap-2 bg-polisario hover:bg-polisario-light"
                    disabled={verifyMutation.isPending}
                    onClick={() =>
                      verifyMutation.mutate({
                        userId: selected.id,
                        approved: true,
                        note: note || undefined,
                      })
                    }
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    disabled={verifyMutation.isPending}
                    onClick={() =>
                      verifyMutation.mutate({
                        userId: selected.id,
                        approved: false,
                        note: note || undefined,
                      })
                    }
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="tariq-admin-glass flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center">
              <FileText className="h-12 w-12 text-sand/60" />
              <p className="mt-4 font-medium text-text-main/55">
                Selecciona un solicitante
              </p>
              <p className="mt-1 max-w-xs text-xs text-text-main/40">
                Haz clic en un usuario de la cola para revisar su certificado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
