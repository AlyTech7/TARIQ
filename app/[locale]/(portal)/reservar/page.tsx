"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { DestinationPicker } from "@/components/booking/DestinationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { MIN_ADVANCE_DAYS, WILAYA_LABELS, WILAYA_INFO } from "@/lib/constants";
import { MapPin, ShieldAlert, ChevronRight } from "lucide-react";
import type { Wilaya } from "@prisma/client";

export default function ReservarPage() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const router = useRouter();
  const lang = locale as "ar" | "es" | "fr";

  const { data: status } = trpc.users.onboardingStatus.useQuery();
  const { data: user } = trpc.users.me.useQuery();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + MIN_ADVANCE_DAYS);
  const minDateStr = minDate.toISOString().split("T")[0];

  const [travelDate, setTravelDate] = useState(minDateStr);
  const [destination, setDestination] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");

  useEffect(() => {
    if (user?.fullName && !passengerName) setPassengerName(user.fullName);
    if (user?.phone && !passengerPhone) setPassengerPhone(user.phone ?? "");
  }, [user, passengerName, passengerPhone]);

  if (status && !status.canReserve) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sun/15 text-sun">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-text-main">{t("mustVerify")}</h1>
        <p className="mt-2 text-sm text-text-main/65">{t("originHint")}</p>
        <Button asChild className="mt-6">
          <Link href={`/${locale}/onboarding`}>{t("step1")}</Link>
        </Button>
      </div>
    );
  }

  const wilaya = user?.wilaya as Wilaya | undefined;
  const wilayaInfo = wilaya ? WILAYA_INFO[wilaya] : null;

  const { data: availability } = trpc.public.availability.useQuery(
    { date: new Date(travelDate) },
    { enabled: !!travelDate },
  );

  const myWilayaQuota = availability?.find((q) => q.wilaya === wilaya);
  const canProceed =
    travelDate && destination && passengerName.trim().length >= 2;

  function handleNext() {
    if (!canProceed) return;
    const params = new URLSearchParams({
      travelDate,
      destination,
      passengerName,
      ...(passengerPhone ? { passengerPhone } : {}),
    });
    router.push(`/${locale}/reservar/carga?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
          {t("title")}
        </h1>
        {wilaya && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-polisario/25 bg-polisario/5 px-4 py-3">
            <MapPin className="h-5 w-5 shrink-0 text-polisario" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-polisario/80">
                {t("originWilaya")}
              </p>
              <p className="font-bold text-text-main">
                {WILAYA_LABELS[wilaya][lang]}
              </p>
              {wilayaInfo && (
                <p className="text-xs text-text-main/55">
                  {wilayaInfo.desc[lang]}
                </p>
              )}
            </div>
            {myWilayaQuota && (
              <div className="ms-auto text-end">
                <p className="text-2xl font-bold text-polisario">
                  {myWilayaQuota.available}
                </p>
                <p className="text-[10px] text-text-main/50">
                  / {myWilayaQuota.total} {t("availability")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BookingStepper currentStep={1} />

      <div className="tariq-glass space-y-6 rounded-2xl p-6 sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="travelDate">{t("travelDate")}</Label>
          <Input
            id="travelDate"
            type="date"
            min={minDateStr}
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>{t("destination")}</Label>
          <DestinationPicker value={destination} onChange={setDestination} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="passengerName">{t("passengerName")}</Label>
            <Input
              id="passengerName"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passengerPhone">{t("passengerPhone")}</Label>
            <Input
              id="passengerPhone"
              type="tel"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="h-11 w-full gap-2"
          size="lg"
        >
          {t("step2")} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
