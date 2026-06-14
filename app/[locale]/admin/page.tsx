"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { QuotaGauge } from "@/components/booking/QuotaGauge";
import { TicketStatusBadge } from "@/components/ticket/TicketStatusBadge";
import { WILAYA_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  UserCheck,
  Bus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { Wilaya } from "@prisma/client";

export default function AdminDashboardPage() {
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const { data: dashboard, isLoading } = trpc.quotas.adminDashboard.useQuery();
  const { data: tickets } = trpc.tickets.adminList.useQuery({});
  const { data: pending } = trpc.users.pendingVerification.useQuery();
  const { data: user } = trpc.users.me.useQuery();

  const wilaya = (user?.managedWilaya ?? user?.wilaya) as Wilaya | undefined;
  const wilayaName = wilaya ? WILAYA_LABELS[wilaya][lang] : "Wilaya";

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-polisario border-t-transparent" />
      </div>
    );
  }

  const quota = dashboard?.quota;
  const usedPct = quota
    ? Math.round((quota.usedSlots / quota.totalSlots) * 100)
    : 0;

  return (
    <div className="animate-fade-up space-y-8">
      {/* Hero */}
      <section className="tariq-hero-gradient overflow-hidden rounded-2xl p-6 text-white shadow-2xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sand/70">
              Centro de mando · {wilayaName}
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Panel de administración
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Gestiona verificaciones, tickets y manifiesto del día para tu
              campamento en Tindouf.
            </p>
          </div>
          {(pending?.length ?? 0) > 0 && (
            <Link href={`/${locale}/admin/usuarios`}>
              <Button className="gap-2 bg-sun text-night hover:bg-sun/90">
                <UserCheck className="h-4 w-4" />
                {pending!.length} pendiente{pending!.length !== 1 ? "s" : ""}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Cuota hoy"
          value={quota ? `${quota.totalSlots - quota.usedSlots}` : "—"}
          sub={quota ? `de ${quota.totalSlots} tickets` : undefined}
          icon={Ticket}
          trend={
            quota
              ? { value: `${usedPct}% ocupado`, positive: usedPct < 80 }
              : undefined
          }
        />
        <AdminStatCard
          label="Tickets activos"
          value={tickets?.length ?? 0}
          sub="Reservas del día"
          icon={Bus}
        />
        <AdminStatCard
          label="Verificación"
          value={pending?.length ?? 0}
          sub="Usuarios en cola"
          icon={UserCheck}
          variant={pending && pending.length > 0 ? "accent" : "light"}
        />
        <AdminStatCard
          label="Estados"
          value={dashboard?.statusCounts?.length ?? 0}
          sub="Tipos de ticket hoy"
          icon={TrendingUp}
        />
      </div>

      {/* Quota + status breakdown */}
      <div className="grid gap-6 lg:grid-cols-5">
        {quota && (
          <div className="tariq-admin-glass p-6 lg:col-span-2">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-main/50">
              Cuota en tiempo real
            </h2>
            <QuotaGauge
              wilaya={quota.wilaya}
              available={quota.totalSlots - quota.usedSlots}
              total={quota.totalSlots}
              percentFull={usedPct}
              locale={locale}
            />
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-polisario/8 p-3">
                <p className="text-2xl font-bold text-polisario">
                  {quota.usedSlots}
                </p>
                <p className="text-[10px] uppercase text-text-main/45">Usados</p>
              </div>
              <div className="rounded-xl bg-sand/20 p-3">
                <p className="text-2xl font-bold text-text-main">
                  {quota.totalSlots - quota.usedSlots}
                </p>
                <p className="text-[10px] uppercase text-text-main/45">Libres</p>
              </div>
              <div className="rounded-xl bg-sun/15 p-3">
                <p className="text-2xl font-bold text-sun">{usedPct}%</p>
                <p className="text-[10px] uppercase text-text-main/45">Ocupación</p>
              </div>
            </div>
          </div>
        )}

        {dashboard?.statusCounts && dashboard.statusCounts.length > 0 && (
          <div className="tariq-admin-glass p-6 lg:col-span-3">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-main/50">
              Desglose por estado
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dashboard.statusCounts.map((s) => (
                <div
                  key={s.status}
                  className="rounded-xl border border-sand/25 bg-white/50 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-text-main">
                    {s._count}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-text-main/45">
                    {s.status.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tickets table */}
      <div>
        <AdminPageHeader
          title="Tickets del día"
          subtitle="Listado de reservas activas en tu wilaya"
          actions={
            <Link href={`/${locale}/admin/tickets`}>
              <Button variant="outline" size="sm" className="gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          }
        />
        <AdminDataTable
          data={tickets?.slice(0, 8) ?? []}
          keyFn={(t) => t.id}
          emptyMessage="No hay tickets registrados hoy"
          columns={[
            {
              key: "code",
              header: "Código",
              cell: (t) => (
                <span className="font-mono text-sm font-semibold text-polisario">
                  {t.ticketCode}
                </span>
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
                >
                  Detalle →
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
