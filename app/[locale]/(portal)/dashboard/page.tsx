"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { QuotaGauge } from "@/components/booking/QuotaGauge";
import { TicketStatusBadge } from "@/components/ticket/TicketStatusBadge";
import { WILAYA_LABELS, WILAYA_INFO } from "@/lib/constants";
import { MapPin, Ticket, ArrowRight, ShieldCheck } from "lucide-react";
import type { Wilaya } from "@prisma/client";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = trpc.users.me.useQuery(undefined, { retry: 1 });

  const { data: status } = trpc.users.onboardingStatus.useQuery();
  const { data: activeTicket } = trpc.tickets.activeTicket.useQuery(undefined, {
    enabled: !!user && status?.canReserve,
    retry: 1,
  });
  const { data: emergency } = trpc.superAdmin.getEmergency.useQuery(undefined, {
    retry: 1,
  });
  const { data: wilayaQuota } = trpc.quotas.wilayaToday.useQuery(
    { wilaya: user?.wilaya ?? "RABOUNI" },
    { enabled: !!user?.wilaya, retry: 1 },
  );

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-polisario border-t-transparent" />
      </div>
    );
  }

  if (userError?.data?.code === "PRECONDITION_FAILED") {
    return (
      <div className="tariq-glass mx-auto max-w-lg rounded-2xl p-8 text-center">
        <p className="font-medium text-alert">Base de datos no conectada</p>
        <p className="mt-2 text-sm text-text-main/60">
          Configura PostgreSQL y ejecuta npm run db:push
        </p>
      </div>
    );
  }

  const wilaya = user?.wilaya as Wilaya | undefined;
  const wilayaInfo = wilaya ? WILAYA_INFO[wilaya] : null;

  return (
    <div className="space-y-8 animate-fade-up">
      {emergency?.isActive && (
        <div className="emergency-banner rounded-xl">
          <p>{emergency.messageAr}</p>
          <p className="text-sm opacity-90">{emergency.messageEs}</p>
        </div>
      )}

      {/* Hero */}
      <section className="tariq-hero-gradient overflow-hidden rounded-2xl p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sand/80">
              TARIQ · طريق
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {user?.arabicName || user?.fullName || t("title")}
            </h1>
            {wilaya && (
              <p className="mt-2 flex items-center gap-2 text-sand/90">
                <MapPin className="h-4 w-4" />
                {WILAYA_LABELS[wilaya][lang]}
                {status?.canReserve && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                    <ShieldCheck className="h-3 w-3" /> OK
                  </span>
                )}
              </p>
            )}
          </div>
          {status?.canReserve && !activeTicket && !emergency?.isActive && (
            <Button
              asChild
              size="lg"
              className="bg-white text-polisario hover:bg-sand/90 shadow-lg"
            >
              <Link href={`/${locale}/reservar`} className="gap-2">
                <Ticket className="h-4 w-4" />
                {t("reserveNow")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {wilayaInfo && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
            {wilayaInfo.desc[lang]}
          </p>
        )}
      </section>

      {/* Ticket activo */}
      {activeTicket ? (
        <section className="tariq-glass tariq-card-hover rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-text-main">{t("activeTicket")}</h2>
            <TicketStatusBadge status={activeTicket.status} />
          </div>
          <p className="ticket-code mt-4 inline-block">{activeTicket.ticketCode}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/${locale}/mis-tickets/${activeTicket.id}`}>
                Ver detalle
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/mis-tickets/${activeTicket.id}/qr`}>QR</Link>
            </Button>
          </div>
        </section>
      ) : (
        !status?.canReserve && (
          <section className="rounded-2xl border-2 border-dashed border-sand/50 bg-white/60 p-8 text-center">
            <p className="text-text-main/70">{t("notVerified")}</p>
            <Button asChild className="mt-4">
              <Link href={`/${locale}/onboarding`}>{t("uploadDocument")}</Link>
            </Button>
          </section>
        )
      )}

      {/* Cuota wilaya */}
      {wilayaQuota && wilaya && (
        <section className="tariq-glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-main">
            <MapPin className="h-5 w-5 text-polisario" />
            {t("quotaToday")} — {WILAYA_LABELS[wilaya][lang]}
          </h2>
          <QuotaGauge
            wilaya={wilaya}
            available={wilayaQuota.available}
            total={wilayaQuota.totalSlots}
            percentFull={wilayaQuota.percentFull}
            locale={locale}
          />
        </section>
      )}
    </div>
  );
}
