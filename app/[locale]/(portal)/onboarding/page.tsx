"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Wilaya, DocumentType } from "@prisma/client";
import { WilayaPicker } from "@/components/onboarding/WilayaPicker";
import { DocumentTypeSelector } from "@/components/onboarding/DocumentTypeSelector";
import { FileUploader } from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { performDocumentUpload } from "@/lib/upload-document";
import { WILAYA_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const lang = locale as "ar" | "es" | "fr";

  const { data: status } = trpc.users.onboardingStatus.useQuery();
  const { data: user } = trpc.users.me.useQuery();
  const completeOnboarding = trpc.users.completeOnboarding.useMutation({
    onSuccess: () => router.push(`/${locale}/dashboard`),
  });

  const [step, setStep] = useState<Step>(1);
  const [wilaya, setWilaya] = useState<Wilaya | null>(
    (user?.wilaya as Wilaya) ?? null,
  );
  const [documentType, setDocumentType] = useState<DocumentType | null>(
    user?.documentType ?? "CENSUS_CERTIFICATE",
  );
  const [documentKey, setDocumentKey] = useState<string | null>(
    user?.documentKey ?? null,
  );
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [arabicName, setArabicName] = useState(user?.arabicName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  useEffect(() => {
    if (status?.verificationStatus === "APPROVED") {
      router.replace(`/${locale}/dashboard`);
    }
  }, [status, locale, router]);

  if (status?.verificationStatus === "APPROVED") {
    return null;
  }

  if (status?.verificationStatus === "PENDING" && status.documentSubmitted) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up py-8">
        <div className="rounded-2xl border border-sun/40 bg-gradient-to-br from-sun/10 to-sand/20 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sun/20 text-sun">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-text-main">{t("pendingTitle")}</h1>
          <p className="mt-2 text-sm text-text-main/70">{t("pendingDesc")}</p>
          {wilaya && (
            <p className="mt-4 font-medium text-polisario">
              {WILAYA_LABELS[wilaya][lang]}
            </p>
          )}
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            {t("goDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  async function handleUpload(file: File): Promise<string | null> {
    const key = await performDocumentUpload(file);
    setDocumentKey(key);
    return key;
  }

  function handleSubmit() {
    if (!wilaya || !documentType || !documentKey) return;
    completeOnboarding.mutate({
      wilaya,
      documentType,
      documentKey,
      fullName: fullName || undefined,
      arabicName: arabicName || undefined,
      phone: phone || undefined,
    });
  }

  const steps = [
    { num: 1 as Step, label: t("stepWilaya") },
    { num: 2 as Step, label: t("stepDocument") },
    { num: 3 as Step, label: t("stepUpload") },
  ];

  return (
    <div className="mx-auto max-w-3xl animate-fade-up pb-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-polisario">
          TARIQ · طريق
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text-main sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-main/65">
          {t("subtitle")}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                step === s.num && "tariq-step-active text-white",
                step > s.num && "tariq-step-done",
                step < s.num && "tariq-step-pending",
              )}
            >
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                step >= s.num ? "text-text-main" : "text-text-main/40",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 w-8 sm:w-12",
                  step > s.num ? "bg-polisario" : "bg-sand/50",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="tariq-glass rounded-2xl p-6 shadow-lg sm:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <WilayaPicker value={wilaya} onChange={setWilaya} />
            <div className="flex justify-end">
              <Button
                disabled={!wilaya}
                onClick={() => setStep(2)}
                className="gap-2"
              >
                {t("next")} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            {wilaya && (
              <div className="rounded-lg bg-polisario/8 px-4 py-3 text-sm">
                <span className="text-text-main/60">{t("selectedWilaya")}: </span>
                <strong className="text-polisario">
                  {WILAYA_LABELS[wilaya][lang]}
                </strong>
              </div>
            )}
            <DocumentTypeSelector
              value={documentType}
              onChange={setDocumentType}
            />
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> {t("back")}
              </Button>
              <Button
                disabled={!documentType}
                onClick={() => setStep(3)}
                className="gap-2"
              >
                {t("next")} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("fullName")}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("arabicName")}</Label>
                <Input
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("phone")}</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("uploadCert")}</Label>
              <p className="text-xs text-text-main/55">{t("uploadCertHint")}</p>
              <FileUploader onUpload={handleUpload} />
            </div>

            {completeOnboarding.error && (
              <p className="text-sm text-alert">
                {completeOnboarding.error.message}
              </p>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> {t("back")}
              </Button>
              <Button
                disabled={
                  !documentKey ||
                  !wilaya ||
                  !documentType ||
                  completeOnboarding.isPending
                }
                onClick={handleSubmit}
              >
                {completeOnboarding.isPending ? t("submitting") : t("submit")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
