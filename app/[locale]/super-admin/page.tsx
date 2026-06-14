"use client";

import { trpc } from "@/lib/trpc/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { WilayaQuotaGrid } from "@/components/admin/WilayaQuotaGrid";
import { cn } from "@/lib/utils";
import { superGlass } from "@/components/admin/super-theme";
import { TOTAL_DAILY_TICKETS } from "@/lib/constants";
import {
  Globe,
  Ticket,
  TrendingUp,
  Activity,
  Shield,
  Users,
} from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  ONBOARDING_SUBMITTED: "Onboarding enviado",
  USER_VERIFIED: "Usuario verificado",
  USER_REJECTED: "Usuario rechazado",
  TICKET_RESERVED: "Ticket reservado",
  TICKET_CANCELLED: "Ticket cancelado",
  EMERGENCY_ACTIVATED: "Emergencia activada",
  EMERGENCY_RESOLVED: "Emergencia resuelta",
};

export default function SuperAdminPage() {
  const { data: stats, isLoading } = trpc.superAdmin.globalStats.useQuery();

  const available = (stats?.totalSlots ?? 0) - (stats?.totalUsed ?? 0);
  const globalPct = stats?.totalSlots
    ? Math.round((stats.totalUsed / stats.totalSlots) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-polisario border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Command center hero */}
      <section className="relative overflow-hidden rounded-2xl border border-polisario/20 bg-gradient-to-br from-night via-[#1a1410] to-polisario/30 p-6 sm:p-8">
        <div className="tariq-shimmer pointer-events-none absolute inset-0" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sun" />
            <p className="text-xs font-bold uppercase tracking-widest text-sun">
              Centro de comando RASD
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Vista Global · Tindouf → Zona Liberada
          </h1>
          <p className="mt-2 max-w-lg text-sm text-neutral-300">
            Monitorización en tiempo real de las 6 wilayas y {TOTAL_DAILY_TICKETS}{" "}
            tickets diarios del sistema TARIQ.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Ocupación global</span>
                <span className="font-bold text-white">{globalPct}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-polisario to-sun transition-all duration-1000"
                  style={{ width: `${globalPct}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-polisario/40 bg-polisario/20 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-sun">{available}</p>
              <p className="text-[10px] uppercase text-neutral-400">Libres</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          variant="dark"
          label="Capacidad diaria"
          value={TOTAL_DAILY_TICKETS}
          sub="Tickets totales / día"
          icon={Ticket}
        />
        <AdminStatCard
          variant="dark"
          label="Usados hoy"
          value={stats?.totalUsed ?? 0}
          sub={`${globalPct}% del total`}
          icon={TrendingUp}
          trend={{
            value: globalPct >= 90 ? "Cuota crítica" : "Operación normal",
            positive: globalPct < 90,
          }}
        />
        <AdminStatCard
          variant="dark"
          label="Disponibles"
          value={available}
          sub="Plazas restantes"
          icon={Users}
        />
        <AdminStatCard
          variant="dark"
          label="Wilayas activas"
          value={stats?.quotas.length ?? 6}
          sub="Campamentos monitoreados"
          icon={Shield}
        />
      </div>

      {/* Wilaya grid */}
      <div>
        <AdminPageHeader
          dark
          badge="Cuotas"
          title="Estado por wilaya"
          subtitle="Ocupación en tiempo real de cada campamento en Tindouf"
        />
        <WilayaQuotaGrid
          quotas={stats?.quotas ?? []}
          dark
        />
      </div>

      {/* Activity feed */}
      <div>
        <AdminPageHeader
          dark
          badge="Auditoría"
          title="Actividad reciente"
          subtitle="Últimas acciones registradas en el sistema"
        />
        <div className={cn(superGlass, "divide-y divide-polisario/15")}>
          {stats?.recentAudit.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-polisario/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-polisario/25">
                <Activity className="h-4 w-4 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {ACTION_LABELS[log.action] ?? log.action}
                </p>
                <p className="text-xs text-neutral-400">
                  {log.admin?.fullName ?? "Sistema"} · {log.entityType}
                </p>
              </div>
              <time className="shrink-0 text-xs text-neutral-500">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
          {(!stats?.recentAudit || stats.recentAudit.length === 0) && (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">
              Sin actividad reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
