"use client";

import type { CargoAlert } from "@/server/lib/cargo-rules";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface RestrictionAlertProps {
  alerts: CargoAlert[];
}

export function RestrictionAlert({ alerts }: RestrictionAlertProps) {
  const locale = useLocale();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.code}
          className={cn(
            "rounded-md border p-3 text-sm",
            alert.level === "error" && "border-alert/50 bg-alert/10 text-alert",
            alert.level === "warning" &&
              "border-sun/50 bg-sun/10 text-text-main",
            alert.level === "info" &&
              "border-polisario/30 bg-polisario/5 text-text-main",
          )}
        >
          {locale === "ar" ? alert.messageAr : alert.messageEs}
        </div>
      ))}
    </div>
  );
}
