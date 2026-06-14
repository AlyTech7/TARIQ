"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { WILAYA_LABELS, DESTINATION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

export default function VerificarQRPage() {
  const params = useParams();
  const token = params.token as string;
  const locale = useLocale();
  const t = useTranslations("verify");

  const { data, isLoading } = trpc.public.verifyQR.useQuery({ qrToken: token });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night p-4 text-white">
        <p className="text-xl">...</p>
      </div>
    );
  }

  const valid = data?.valid;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night p-6 text-white">
      <div
        className={`mb-8 rounded-full px-8 py-4 text-2xl font-bold ${
          valid ? "bg-green-600" : "bg-alert"
        }`}
      >
        {valid ? t("valid") : t("invalid")}
      </div>

      {valid && data.ticket && (
        <dl className="w-full max-w-md space-y-4 text-lg">
          <div className="flex justify-between border-b border-sand/20 pb-2">
            <dt className="text-sand">{t("passenger")}</dt>
            <dd className="font-semibold">{data.ticket.passengerName}</dd>
          </div>
          <div className="flex justify-between border-b border-sand/20 pb-2">
            <dt className="text-sand">{t("origin")}</dt>
            <dd>
              {WILAYA_LABELS[data.ticket.wilayaOrigin]?.[
                locale as "ar" | "es" | "fr"
              ]}
            </dd>
          </div>
          <div className="flex justify-between border-b border-sand/20 pb-2">
            <dt className="text-sand">{t("destination")}</dt>
            <dd>
              {locale === "ar"
                ? DESTINATION_LABELS[data.ticket.destination]?.ar
                : DESTINATION_LABELS[data.ticket.destination]?.es}
            </dd>
          </div>
          <div className="flex justify-between border-b border-sand/20 pb-2">
            <dt className="text-sand">{t("date")}</dt>
            <dd>{formatDate(data.ticket.travelDate, locale)}</dd>
          </div>
          <div className="pt-4 text-center">
            <p className="font-mono text-2xl text-polisario">{data.ticket.code}</p>
          </div>
          {data.ticket.cargoSummary.length > 0 && (
            <div>
              <p className="mb-2 text-sand">Carga:</p>
              <ul className="text-sm">
                {data.ticket.cargoSummary.map((c, i) => (
                  <li key={i}>
                    {c.category}: {c.quantity} {c.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </dl>
      )}

      {!valid && data && "reason" in data && (
        <p className="text-sand">{data.reason}</p>
      )}
    </div>
  );
}
