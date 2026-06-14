"use client";

import { cn, getQuotaBgColor } from "@/lib/utils";
import { WILAYA_LABELS } from "@/lib/constants";
import type { Wilaya } from "@prisma/client";

interface QuotaGaugeProps {
  wilaya: string;
  available: number;
  total: number;
  percentFull: number;
  locale?: string;
}

export function QuotaGauge({
  wilaya,
  available,
  total,
  percentFull,
  locale = "ar",
}: QuotaGaugeProps) {
  const label =
    WILAYA_LABELS[wilaya as Wilaya]?.[locale as "ar" | "es" | "fr"] ?? wilaya;
  const usedPercent = Math.min(100, percentFull);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>
          {available}/{total}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-sand/30">
        <div
          className={cn("h-full transition-all", getQuotaBgColor(percentFull))}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
    </div>
  );
}
