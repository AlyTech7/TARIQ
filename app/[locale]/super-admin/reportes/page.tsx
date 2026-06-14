"use client";

import { trpc } from "@/lib/trpc/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { WilayaQuotaGrid } from "@/components/admin/WilayaQuotaGrid";
import { superGlass } from "@/components/admin/super-theme";
import { cn } from "@/lib/utils";
import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_COLORS: Record<string, string> = {
  USER_VERIFIED: "text-green-400",
  USER_REJECTED: "text-red-400",
  TICKET_RESERVED: "text-green-300",
  EMERGENCY_ACTIVATED: "text-red-400",
  ONBOARDING_SUBMITTED: "text-sun",
};

export default function ReportesPage() {
  const { data: stats } = trpc.superAdmin.globalStats.useQuery();
  const { data: audit } = trpc.superAdmin.auditLog.useQuery({ limit: 100 });

  const totalUsed = stats?.totalUsed ?? 0;
  const totalSlots = stats?.totalSlots ?? 200;
  const globalPct = totalSlots > 0 ? Math.round((totalUsed / totalSlots) * 100) : 0;

  return (
    <div className="animate-fade-up space-y-8">
      <AdminPageHeader
        dark
        badge="Analytics"
        title="Reportes y auditoría"
        subtitle="Ocupación por wilaya y registro completo de acciones del sistema"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-polisario/40 text-neutral-200 hover:bg-polisario/20 hover:text-white"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      <div className={cn(superGlass, "p-6")}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              Ocupación global hoy
            </p>
            <p className="text-4xl font-bold text-white">{globalPct}%</p>
          </div>
          <div className="text-end">
            <p className="text-sm text-neutral-300">
              {totalUsed} / {totalSlots} tickets
            </p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-polisario via-green-500 to-sun transition-all duration-1000"
            style={{ width: `${globalPct}%` }}
          />
        </div>
      </div>

      <WilayaQuotaGrid quotas={stats?.quotas ?? []} dark />

      <div>
        <AdminPageHeader
          dark
          title="Registro de auditoría"
          subtitle={`${audit?.length ?? 0} eventos registrados`}
        />
        <div className={cn(superGlass, "max-h-[480px] overflow-y-auto")}>
          {audit?.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 border-b border-polisario/15 px-5 py-3 last:border-0 hover:bg-polisario/10"
            >
              <Activity
                className={cn(
                  "h-4 w-4 shrink-0",
                  ACTION_COLORS[log.action] ?? "text-neutral-400",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{log.action}</p>
                <p className="text-xs text-neutral-400">
                  {log.entityType} · #{log.entityId.slice(0, 8)}…
                </p>
              </div>
              <time className="shrink-0 text-xs text-neutral-500">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
          {(!audit || audit.length === 0) && (
            <p className="py-12 text-center text-sm text-neutral-400">
              Sin eventos registrados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
