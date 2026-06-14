"use client";

import { DocumentType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import {
  DOCUMENT_TYPE_INFO,
  WILAYA_DOCUMENT_TYPES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShieldCheck, Star } from "lucide-react";

interface DocumentTypeSelectorProps {
  value: DocumentType | null;
  onChange: (type: DocumentType) => void;
}

export function DocumentTypeSelector({
  value,
  onChange,
}: DocumentTypeSelectorProps) {
  const locale = useLocale();
  const t = useTranslations("documents");
  const lang = locale as "ar" | "es" | "fr";

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-main/70">{t("selectHint")}</p>
      <div className="space-y-2">
        {WILAYA_DOCUMENT_TYPES.map((type) => {
          const info = DOCUMENT_TYPE_INFO[type];
          const selected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "tariq-card-hover flex w-full items-start gap-3 rounded-xl border-2 p-4 text-start transition-all",
                selected
                  ? "border-polisario bg-polisario/5"
                  : "border-sand/40 bg-white",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  selected
                    ? "bg-polisario text-white"
                    : "bg-sand/30 text-text-main/60",
                )}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-main">
                    {t(`types.${type}`)}
                  </span>
                  {info.recommended && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-sun/15 px-2 py-0.5 text-[10px] font-bold text-sun">
                      <Star className="h-2.5 w-2.5" />
                      {t("recommended")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-text-main/60">
                  {info.desc[lang]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
