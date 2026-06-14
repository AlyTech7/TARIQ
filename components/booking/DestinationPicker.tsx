"use client";

import { DESTINATION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface DestinationPickerProps {
  value: string | null;
  onChange: (destination: string) => void;
}

export function DestinationPicker({ value, onChange }: DestinationPickerProps) {
  const locale = useLocale();
  const destinations = Object.keys(DESTINATION_LABELS);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {destinations.map((dest) => {
        const label =
          locale === "ar"
            ? DESTINATION_LABELS[dest]?.ar
            : DESTINATION_LABELS[dest]?.es;
        const selected = value === dest;

        return (
          <button
            key={dest}
            type="button"
            onClick={() => onChange(dest)}
            className={cn(
              "rounded-lg border-2 p-4 text-center text-sm font-medium transition-colors",
              selected
                ? "border-polisario bg-polisario/10 text-polisario"
                : "border-sand/40 hover:border-polisario/50",
            )}
          >
            {label ?? dest}
          </button>
        );
      })}
    </div>
  );
}
