"use client";

import { cn, getQuotaBgColor } from "@/lib/utils";
import { superPanel } from "@/components/admin/super-theme";
import { WILAYA_INFO, WILAYA_LABELS, WILAYA_ORDER } from "@/lib/constants";
import type { Wilaya } from "@prisma/client";

type QuotaRow = {
  wilaya: Wilaya;
  totalSlots: number;
  usedSlots: number;
};

type WilayaQuotaGridProps = {
  quotas: QuotaRow[];
  locale?: string;
  dark?: boolean;
};

export function WilayaQuotaGrid({
  quotas,
  locale = "es",
  dark = false,
}: WilayaQuotaGridProps) {
  const lang = locale as "ar" | "es" | "fr";
  const quotaMap = Object.fromEntries(quotas.map((q) => [q.wilaya, q]));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {WILAYA_ORDER.map((wilaya) => {
        const q = quotaMap[wilaya];
        const total = q?.totalSlots ?? WILAYA_INFO[wilaya].quota;
        const used = q?.usedSlots ?? 0;
        const available = total - used;
        const pct = total > 0 ? Math.round((used / total) * 100) : 0;
        const info = WILAYA_INFO[wilaya];
        const label = WILAYA_LABELS[wilaya][lang];

        return (
          <div
            key={wilaya}
            className={cn(
              "group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5",
              dark ? superPanel : "tariq-stat-card",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    dark ? "text-neutral-500" : "text-text-main/50",
                  )}
                >
                  {wilaya}
                  {info.adminCenter && (
                    <span className="ms-2 text-sun">★ RASD</span>
                  )}
                </p>
                <h3
                  className={cn(
                    "mt-0.5 text-lg font-bold",
                    dark ? "text-white" : "text-text-main",
                  )}
                >
                  {label}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    dark ? "text-neutral-400" : "text-text-main/55",
                  )}
                >
                  {info.approxPop} · {info.dairas > 0 ? `${info.dairas} dairas` : "Admin"}
                </p>
              </div>
              <div className="relative h-14 w-14 shrink-0">
                <div
                  className="tariq-wilaya-ring absolute inset-0 rounded-full"
                  style={{ "--pct": `${pct}%` } as React.CSSProperties}
                />
                <div
                  className={cn(
                    "absolute inset-1.5 flex items-center justify-center rounded-full text-xs font-bold",
                    dark ? "bg-[#0d0a08] text-white" : "bg-white text-text-main",
                  )}
                >
                  {pct}%
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span className={dark ? "text-neutral-400" : "text-text-main/55"}>
                  {available} libres
                </span>
                <span className={dark ? "text-neutral-300" : "text-text-main/55"}>
                  {used}/{total}
                </span>
              </div>
              <div
                className={cn(
                  "mt-1.5 h-2 overflow-hidden rounded-full",
                  dark ? "bg-white/15" : "bg-sand/25",
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    getQuotaBgColor(pct),
                  )}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
