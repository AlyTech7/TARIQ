"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { PortalNav } from "@/components/shared/PortalNav";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WILAYA_LABELS } from "@/lib/constants";

const BYPASS_PATHS = ["/onboarding", "/sign-in", "/sign-up"];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("verification");

  const { data: status, isLoading } = trpc.users.onboardingStatus.useQuery();

  const isBypass = BYPASS_PATHS.some((p) => pathname.includes(p));

  useEffect(() => {
    if (isLoading || isBypass || !status) return;
    if (status.needsOnboarding && status.verificationStatus !== "PENDING") {
      router.replace(`/${locale}/onboarding`);
    }
  }, [status, isLoading, isBypass, locale, router]);

  const lang = locale as "ar" | "es" | "fr";
  const showBanner =
    !isBypass &&
    status &&
    status.verificationStatus !== "APPROVED" &&
    !pathname.includes("/onboarding");

  return (
    <div className="tariq-desert-bg flex min-h-screen flex-col">
      <PortalNav />
      {showBanner && (
        <div
          className={
            status.verificationStatus === "REJECTED"
              ? "border-b border-alert/30 bg-alert/10 px-4 py-3"
              : status.verificationStatus === "PENDING"
                ? "border-b border-sun/30 bg-sun/10 px-4 py-3"
                : "border-b border-polisario/20 bg-polisario/8 px-4 py-3"
          }
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={
                  status.verificationStatus === "REJECTED"
                    ? "mt-0.5 h-4 w-4 shrink-0 text-alert"
                    : "mt-0.5 h-4 w-4 shrink-0 text-sun"
                }
              />
              <div>
                <p className="text-sm font-medium text-text-main">
                  {status.verificationStatus === "REJECTED"
                    ? t("rejected")
                    : status.verificationStatus === "PENDING"
                      ? t("pending")
                      : t("required")}
                </p>
                {status.rejectionNote && (
                  <p className="text-xs text-text-main/60">
                    {status.rejectionNote}
                  </p>
                )}
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link href={`/${locale}/onboarding`}>
                {t("complete")} <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-sand/30 py-4 text-center text-xs text-text-main/45">
        TARIQ · {status?.wilaya && WILAYA_LABELS[status.wilaya as keyof typeof WILAYA_LABELS]?.[lang]} · RASD
      </footer>
    </div>
  );
}
