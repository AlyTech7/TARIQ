"use client";

import { Wilaya } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import {
  WILAYA_INFO,
  WILAYA_LABELS,
  WILAYA_ORDER,
  WILAYA_QUOTAS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MapPin, Users, Layers, Building2 } from "lucide-react";

interface WilayaPickerProps {
  value: Wilaya | null;
  onChange: (wilaya: Wilaya) => void;
  disabled?: boolean;
}

export function WilayaPicker({ value, onChange, disabled }: WilayaPickerProps) {
  const locale = useLocale();
  const t = useTranslations("wilayaPicker");
  const lang = locale as "ar" | "es" | "fr";

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-main/70">{t("hint")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WILAYA_ORDER.map((code) => {
          const info = WILAYA_INFO[code];
          const label = WILAYA_LABELS[code][lang];
          const selected = value === code;

          return (
            <button
              key={code}
              type="button"
              disabled={disabled}
              onClick={() => onChange(code)}
              className={cn(
                "tariq-card-hover group relative overflow-hidden rounded-xl border-2 border-sand/40 bg-white p-4 text-start transition-all",
                selected && "wilaya-selected border-polisario",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {info.adminCenter && (
                <span className="absolute end-3 top-3 rounded-full bg-sun/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sun">
                  RASD
                </span>
              )}

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-polisario/10 text-polisario transition-colors group-hover:bg-polisario group-hover:text-white">
                <MapPin className="h-5 w-5" />
              </div>

              <h3 className="font-bold text-text-main">{label}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-main/60">
                {info.desc[lang]}
              </p>

              <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-sand/30 pt-3 text-[11px] text-text-main/55">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{info.approxPop}</span>
                </div>
                {info.dairas > 0 && (
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>
                      {info.dairas} {t("dairas")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>
                    {WILAYA_QUOTAS[code]} {t("ticketsDay")}
                  </span>
                </div>
              </dl>

              {selected && (
                <div className="absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r from-polisario to-polisario-light" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
