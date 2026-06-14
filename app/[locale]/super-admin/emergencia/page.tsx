"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { superGlass } from "@/components/admin/super-theme";
import { cn } from "@/lib/utils";
import { EmergencyType } from "@prisma/client";
import {
  AlertTriangle,
  ShieldOff,
  Radio,
  Zap,
  CheckCircle2,
} from "lucide-react";

const EMERGENCY_TYPES: { value: EmergencyType; label: string; desc: string }[] =
  [
    { value: "FLOOD", label: "Inundación", desc: "Rutas inundadas o impracticables" },
    { value: "SANDSTORM", label: "Tormenta de arena", desc: "Visibilidad nula en el desierto" },
    { value: "CONFLICT", label: "Conflicto", desc: "Situación de seguridad en ruta" },
    { value: "HEALTH", label: "Salud pública", desc: "Emergencia sanitaria en campamentos" },
    { value: "OTHER", label: "Otro", desc: "Emergencia no categorizada" },
  ];

export default function EmergenciaPage() {
  const { data: emergency, refetch } = trpc.superAdmin.getEmergency.useQuery();
  const activate = trpc.superAdmin.activateEmergency.useMutation({
    onSuccess: () => refetch(),
  });
  const resolve = trpc.superAdmin.resolveEmergency.useMutation({
    onSuccess: () => refetch(),
  });

  const [type, setType] = useState<EmergencyType>("FLOOD");
  const [messageAr, setMessageAr] = useState("");
  const [messageEs, setMessageEs] = useState("");

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <AdminPageHeader
        dark
        badge="Protocolo crítico"
        title="Modo emergencia"
        subtitle="Activa alertas globales que bloquean reservas y notifican a todos los campamentos"
      />

      {emergency?.isActive ? (
        <div className="relative overflow-hidden rounded-2xl border border-alert/50 bg-gradient-to-br from-alert/25 to-[#1a1410] p-6">
          <div className="tariq-pulse-dot absolute end-4 top-4 h-3 w-3 rounded-full bg-alert" />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-alert/25">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">
                EMERGENCIA ACTIVA
              </h2>
              <p className="mt-1 text-xs uppercase tracking-wider text-neutral-400">
                Tipo: {emergency.type}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-xl bg-black/30 p-4">
            <p className="text-sm text-white" dir="rtl">
              {emergency.messageAr}
            </p>
            <p className="text-sm text-neutral-300">{emergency.messageEs}</p>
          </div>

          <Button
            variant="destructive"
            className="mt-6 w-full gap-2"
            onClick={() => resolve.mutate()}
            disabled={resolve.isPending}
          >
            <ShieldOff className="h-4 w-4" />
            Resolver emergencia
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={cn(superGlass, "p-6")}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">Sistema operativo</p>
                <p className="text-xs text-neutral-400">
                  No hay emergencias activas
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Tipo de emergencia
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EMERGENCY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "rounded-xl border p-3 text-start transition-all",
                    type === t.value
                      ? "border-sun/60 bg-sun/15"
                      : "border-polisario/25 bg-[#1a1410]/50 hover:border-polisario/40",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium",
                      type === t.value ? "text-sun" : "text-white",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={cn(superGlass, "space-y-4 p-6")}>
            <div className="space-y-2">
              <Label className="text-neutral-300">Mensaje (árabe)</Label>
              <Input
                value={messageAr}
                onChange={(e) => setMessageAr(e.target.value)}
                dir="rtl"
                placeholder="رسالة الطوارئ..."
                className="border-polisario/30 bg-[#0d0a08] text-white placeholder:text-neutral-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Mensaje (español)</Label>
              <Input
                value={messageEs}
                onChange={(e) => setMessageEs(e.target.value)}
                placeholder="Mensaje de emergencia..."
                className="border-polisario/30 bg-[#0d0a08] text-white placeholder:text-neutral-600"
              />
            </div>

            <Button
              variant="destructive"
              className="w-full gap-2 py-5 text-base"
              onClick={() => activate.mutate({ type, messageAr, messageEs })}
              disabled={!messageAr || !messageEs || activate.isPending}
            >
              <Zap className="h-5 w-5" />
              Activar modo emergencia
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-sun/30 bg-sun/10 p-4">
            <Radio className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
            <p className="text-xs text-neutral-300">
              Al activar la emergencia, se bloquean nuevas reservas en todo el
              sistema y se muestra un banner en el portal ciudadano. Solo un
              SUPER_ADMIN puede resolver la emergencia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
