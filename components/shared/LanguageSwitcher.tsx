"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex gap-1">
      {LOCALES.map((l) => (
        <Button
          key={l.code}
          variant={locale === l.code ? "default" : "ghost"}
          size="sm"
          onClick={() => switchLocale(l.code)}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
