"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Ticket, User, MapPin, ShieldAlert, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/reservar", key: "reserve", icon: Ticket, requiresVerified: true },
  { href: "/mis-tickets", key: "myTickets", icon: Ticket },
  { href: "/perfil", key: "profile", icon: User },
  { href: "/curso-hacking", key: "cursoHacking", icon: ShieldCheck },
] as const;

export function PortalNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] ?? "ar";

  const { data: status } = trpc.users.onboardingStatus.useQuery();

  return (
    <header className="sticky top-0 z-50 tariq-glass border-b border-sand/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href={`/${locale}/dashboard`}
          className="group flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-polisario text-sm font-bold text-white shadow-md shadow-polisario/25">
            ط
          </div>
          <div className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight text-polisario">
              TARIQ
            </span>
            <span className="block text-[10px] text-text-main/50">طريق</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const href = `/${locale}${item.href}`;
            const active = pathname.startsWith(href);
            const locked =
              "requiresVerified" in item &&
              item.requiresVerified &&
              status &&
              !status.canReserve;
            const Icon = item.icon;

            if (locked) {
              return (
                <Link
                  key={item.key}
                  href={`/${locale}/onboarding`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-main/40 hover:bg-sand/20"
                  title={t("verifyFirst")}
                >
                  <ShieldAlert className="h-4 w-4" />
                  {t(item.key)}
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-polisario text-white shadow-sm shadow-polisario/20"
                    : "text-text-main/70 hover:bg-sand/25 hover:text-text-main",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {status?.wilaya && (
            <span className="hidden items-center gap-1 rounded-full bg-sand/40 px-2.5 py-1 text-xs font-medium text-text-main/70 lg:flex">
              <MapPin className="h-3 w-3 text-polisario" />
              {status.wilaya}
            </span>
          )}
          <LanguageSwitcher />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
