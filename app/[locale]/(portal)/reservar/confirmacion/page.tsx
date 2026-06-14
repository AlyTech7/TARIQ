"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { DESTINATION_LABELS, WILAYA_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { CargoCategory } from "@prisma/client";

function ConfirmacionContent() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const travelDate = searchParams.get("travelDate") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const passengerName = searchParams.get("passengerName") ?? "";
  const passengerPhone = searchParams.get("passengerPhone") ?? undefined;
  const cargoRaw = searchParams.get("cargo") ?? "[]";

  let cargoItems: Array<{
    category: CargoCategory;
    description?: string;
    quantity: number;
    unit: string;
  }> = [];
  try {
    cargoItems = JSON.parse(cargoRaw);
  } catch {
    cargoItems = [];
  }

  const [confirmed, setConfirmed] = useState(false);

  const reserveMutation = trpc.tickets.reserve.useMutation({
    onSuccess: (ticket) => {
      router.push(`/${locale}/mis-tickets/${ticket.id}`);
    },
  });

  const { data: user } = trpc.users.me.useQuery();

  if (!travelDate || !destination || !passengerName) {
    router.replace(`/${locale}/reservar`);
    return null;
  }

  const destLabel =
    locale === "ar"
      ? DESTINATION_LABELS[destination]?.ar
      : DESTINATION_LABELS[destination]?.es;

  function handleConfirm() {
    reserveMutation.mutate({
      travelDate: new Date(travelDate),
      destination: destination as never,
      passengerName,
      passengerPhone,
      cargoItems,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <BookingStepper currentStep={3} />

      <Card>
        <CardHeader>
          <CardTitle>{t("step3")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-main/60">{t("travelDate")}</dt>
              <dd>{formatDate(travelDate, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-main/60">{t("destination")}</dt>
              <dd>{destLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-main/60">Wilaya</dt>
              <dd>
                {user?.wilaya
                  ? WILAYA_LABELS[user.wilaya][locale as "ar" | "es" | "fr"]
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-main/60">{t("passengerName")}</dt>
              <dd>{passengerName}</dd>
            </div>
            {passengerPhone && (
              <div className="flex justify-between">
                <dt className="text-text-main/60">{t("passengerPhone")}</dt>
                <dd>{passengerPhone}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-main/60">{t("cargo")}</dt>
              <dd>{cargoItems.length} ítems</dd>
            </div>
          </dl>

          <label className="flex items-start gap-3 rounded-md border border-sand/40 p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">{t("confirmCheckbox")}</span>
          </label>

          {reserveMutation.error && (
            <p className="text-sm text-alert">
              {reserveMutation.error.message}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              ← {t("step2")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!confirmed || reserveMutation.isPending}
              className="flex-1"
            >
              {reserveMutation.isPending ? "..." : t("confirmReserve")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
