"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

interface BookingStepperProps {
  currentStep: 1 | 2 | 3;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const t = useTranslations("booking");
  const steps = [
    { num: 1, label: t("step1") },
    { num: 2, label: t("step2") },
    { num: 3, label: t("step3") },
  ] as const;

  return (
    <div className="flex items-center justify-between gap-1 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-sand/30">
      {steps.map((step, i) => (
        <div key={step.num} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all",
              currentStep === step.num && "tariq-step-active text-white",
              currentStep > step.num && "tariq-step-done text-white",
              currentStep < step.num && "tariq-step-pending",
            )}
          >
            {currentStep > step.num ? (
              <Check className="h-4 w-4" />
            ) : (
              step.num
            )}
          </div>
          <span
            className={cn(
              "hidden truncate text-xs font-medium sm:block",
              currentStep >= step.num ? "text-text-main" : "text-text-main/40",
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-0.5 hidden h-0.5 flex-1 sm:block",
                currentStep > step.num ? "bg-polisario" : "bg-sand/40",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
