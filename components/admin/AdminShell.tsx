"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { WILAYA_LABELS } from "@/lib/constants";
import type { Wilaya } from "@prisma/client";
import {
  LayoutDashboard,
  UserCheck,
  Ticket,
  FileText,
  Clock,
  Globe,
  Map,
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

type ShellUser = {
  fullName: string;
  role: string;
  wilaya?: Wilaya;
  managedWilaya?: Wilaya | null;
};

type AdminShellProps = {
  locale: string;
  user: ShellUser;
  variant: "wilaya" | "super";
  children: React.ReactNode;
};

const WILAYA_NAV = [
  { href: "", label: "Centro de mando", icon: LayoutDashboard },
  { href: "/usuarios", label: "Verificación", icon: UserCheck, badge: true },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/manifiesto", label: "Manifiesto", icon: FileText },
  { href: "/lista-espera", label: "Lista de espera", icon: Clock },
] as const;

const SUPER_NAV = [
  { href: "", label: "Vista global", icon: Globe },
  { href: "/wilayas", label: "Wilayas", icon: Map },
  { href: "/emergencia", label: "Emergencia", icon: AlertTriangle },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
] as const;

export function AdminShell({
  locale,
  user,
  variant,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = variant === "wilaya" ? `/${locale}/admin` : `/${locale}/super-admin`;
  const navItems = variant === "wilaya" ? WILAYA_NAV : SUPER_NAV;
  const lang = locale as "ar" | "es" | "fr";

  const { data: pending } = trpc.users.pendingVerification.useQuery(undefined, {
    enabled: variant === "wilaya",
  });

  const wilayaLabel =
    user.managedWilaya ?? user.wilaya
      ? WILAYA_LABELS[(user.managedWilaya ?? user.wilaya)!]?.[lang]
      : null;

  function isActive(href: string) {
    const full = href ? `${base}${href}` : base;
    if (href === "") return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(full);
  }

  const sidebarContent = (
    <>
      <div className="border-b border-white/8 px-5 py-6">
        <Link href={`/${locale}/dashboard`} className="group flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg",
              variant === "super"
                ? "bg-gradient-to-br from-polisario to-sun shadow-sun/20"
                : "bg-gradient-to-br from-polisario to-polisario-light shadow-polisario/30",
            )}
          >
            ط
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">
              TARIQ {variant === "super" ? "RASD" : "Admin"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">
              {variant === "super" ? "Super Admin" : "Wilaya Admin"}
            </p>
          </div>
        </Link>
        {wilayaLabel && variant === "wilaya" && (
          <div className="mt-4 rounded-lg bg-polisario/15 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-sand/50">
              Campamento
            </p>
            <p className="text-sm font-semibold text-polisario-light">
              {wilayaLabel}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, ...rest }) => {
          const active = isActive(href);
          const showBadge =
            "badge" in rest &&
            rest.badge &&
            pending &&
            pending.length > 0;

          return (
            <Link
              key={href || "root"}
              href={href ? `${base}${href}` : base}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? variant === "super"
                    ? "border-s-[3px] border-sun bg-polisario/25 font-semibold text-sun"
                    : "tariq-nav-active"
                  : variant === "super"
                    ? "text-neutral-300 hover:bg-white/8 hover:text-white"
                    : "text-sand hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1.5 text-[10px] font-bold text-night">
                  {pending!.length}
                </span>
              )}
              {active && <ChevronRight className="h-3 w-3 opacity-50" />}
            </Link>
          );
        })}

        {user.role === "SUPER_ADMIN" && variant === "wilaya" && (
          <Link
            href={`/${locale}/super-admin`}
            className="mt-4 flex items-center gap-3 rounded-lg border border-sun/20 bg-sun/10 px-3 py-2.5 text-sm font-medium text-sun hover:bg-sun/15"
          >
            <Shield className="h-4 w-4" />
            Super Admin RASD
          </Link>
        )}

        {variant === "super" && (
          <Link
            href={`/${locale}/admin`}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Wilaya
          </Link>
        )}
      </nav>

      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.fullName}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">
              {user.role.replace("_", " ")}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/dashboard`}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al portal
        </Link>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-screen",
        variant === "super"
          ? "bg-night text-white tariq-super-bg"
          : "tariq-admin-bg text-text-main",
      )}
    >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 hidden w-64 flex-col lg:flex",
          variant === "super"
            ? "border-r border-polisario/25 bg-[#0a0806] tariq-super-sidebar"
            : "tariq-admin-sidebar",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col transition-transform lg:hidden",
          variant === "super"
            ? "border-r border-polisario/25 bg-[#0a0806] tariq-super-sidebar"
            : "tariq-admin-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute end-3 top-3 rounded-lg p-2 text-sand/60 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:ps-64">
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center gap-4 border-b px-4 py-3 backdrop-blur-xl lg:px-8",
            variant === "super"
              ? "border-polisario/20 bg-[#0a0806]/95 text-white"
              : "border-sand/30 bg-white/70",
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "rounded-lg p-2 lg:hidden",
              variant === "super"
                ? "hover:bg-white/10"
                : "hover:bg-sand/20",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-widest",
                variant === "super" ? "text-green-400" : "text-polisario/70",
              )}
            >
              {new Date().toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              variant === "super"
                ? "bg-polisario/30 text-green-300"
                : "bg-polisario/10 text-polisario",
            )}
          >
            <span className="tariq-pulse-dot h-2 w-2 rounded-full bg-green-400" />
            En línea
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
