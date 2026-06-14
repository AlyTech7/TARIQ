"use client";

import { useLocale } from "next-intl";

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return <div dir={dir}>{children}</div>;
}
