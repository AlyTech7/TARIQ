import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ar, es, fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const localeMap = { ar, es, fr };
  return format(d, "PPP", {
    locale: localeMap[locale as keyof typeof localeMap] ?? ar,
  });
}

export function formatArabicDate(date: Date | string): string {
  return formatDate(date, "ar");
}

export function getQuotaColor(percentFull: number): string {
  if (percentFull >= 90) return "text-red-600";
  if (percentFull >= 70) return "text-yellow-600";
  return "text-green-600";
}

export function getQuotaBgColor(percentFull: number): string {
  if (percentFull >= 90) return "bg-red-500";
  if (percentFull >= 70) return "bg-yellow-500";
  return "bg-polisario";
}
