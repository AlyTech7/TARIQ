"use client";

import { trpc } from "@/lib/trpc/client";
import { QuotaGauge } from "./QuotaGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface AvailabilityBoardProps {
  date: Date;
  locale?: string;
}

export function AvailabilityBoard({ date, locale = "ar" }: AvailabilityBoardProps) {
  const t = useTranslations("booking");
  const { data, isLoading } = trpc.public.availability.useQuery({ date });

  if (isLoading) {
    return <p className="text-sm text-text-main/60">{t("loading")}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("availability")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.map((q) => (
          <QuotaGauge
            key={q.wilaya}
            wilaya={q.wilaya}
            available={q.available}
            total={q.total}
            percentFull={q.percentFull}
            locale={locale}
          />
        ))}
      </CardContent>
    </Card>
  );
}
