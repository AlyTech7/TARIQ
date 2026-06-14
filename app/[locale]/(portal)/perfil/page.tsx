"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { WilayaPicker } from "@/components/onboarding/WilayaPicker";
import { DocumentTypeSelector } from "@/components/onboarding/DocumentTypeSelector";
import { FileUploader } from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WILAYA_LABELS } from "@/lib/constants";
import { performDocumentUpload } from "@/lib/upload-document";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { DocumentType, Wilaya } from "@prisma/client";
import { useState, useEffect } from "react";

export default function PerfilPage() {
  const t = useTranslations("profile");
  const tOnboard = useTranslations("onboarding");
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";

  const { data: user, refetch } = trpc.users.me.useQuery();
  const { data: status, refetch: refetchStatus } =
    trpc.users.onboardingStatus.useQuery();

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => refetch(),
  });
  const setWilaya = trpc.users.setWilaya.useMutation({
    onSuccess: () => {
      refetch();
      refetchStatus();
    },
  });
  const getUploadUrl = trpc.users.getUploadUrl.useMutation();
  const submitDocument = trpc.users.submitDocument.useMutation({
    onSuccess: () => {
      refetch();
      refetchStatus();
    },
  });

  const [fullName, setFullName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [phone, setPhone] = useState("");
  const [editWilaya, setEditWilaya] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(
    "CENSUS_CERTIFICATE",
  );
  const [documentKey, setDocumentKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setArabicName(user.arabicName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const canChangeWilaya = status?.verificationStatus !== "APPROVED";

  async function handleUpload(file: File): Promise<string | null> {
    const key = await performDocumentUpload(file, (input) =>
      getUploadUrl.mutateAsync(input),
    );
    setDocumentKey(key);
    return key;
  }
  function handleResubmit() {
    if (!user || !documentKey) return;
    submitDocument.mutate({
      documentType,
      documentKey,
      wilaya: user.wilaya,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-main">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-main/60">{t("subtitle")}</p>
      </div>

      {/* Estado verificación */}
      <section className="tariq-glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div
            className={
              status?.canReserve
                ? "flex h-12 w-12 items-center justify-center rounded-xl bg-polisario/15 text-polisario"
                : status?.verificationStatus === "PENDING"
                  ? "flex h-12 w-12 items-center justify-center rounded-xl bg-sun/15 text-sun"
                  : "flex h-12 w-12 items-center justify-center rounded-xl bg-alert/15 text-alert"
            }
          >
            {status?.canReserve ? (
              <ShieldCheck className="h-6 w-6" />
            ) : status?.verificationStatus === "PENDING" ? (
              <Clock className="h-6 w-6" />
            ) : (
              <ShieldAlert className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="font-bold text-text-main">
              {status?.canReserve
                ? t("verified")
                : status?.verificationStatus === "PENDING"
                  ? t("pending")
                  : t("notVerified")}
            </p>
            {user?.wilaya && (
              <p className="mt-1 flex items-center gap-1 text-sm text-polisario">
                <MapPin className="h-3.5 w-3.5" />
                {WILAYA_LABELS[user.wilaya][lang]}
              </p>
            )}
            {status?.rejectionNote && (
              <p className="mt-2 rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">
                {status.rejectionNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Wilaya */}
      {canChangeWilaya && (
        <section className="tariq-glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-text-main">{t("wilayaSection")}</h2>
            {!editWilaya && (
              <Button variant="outline" size="sm" onClick={() => setEditWilaya(true)}>
                {t("changeWilaya")}
              </Button>
            )}
          </div>
          {editWilaya ? (
            <div className="space-y-4">
              <WilayaPicker
                value={selectedWilaya ?? (user?.wilaya as Wilaya)}
                onChange={setSelectedWilaya}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const w = selectedWilaya ?? user?.wilaya;
                    if (w) setWilaya.mutate({ wilaya: w });
                    setEditWilaya(false);
                  }}
                >
                  {t("saveWilaya")}
                </Button>
                <Button variant="outline" onClick={() => setEditWilaya(false)}>
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-main/70">{t("wilayaHint")}</p>
          )}
        </section>
      )}

      {/* Datos personales */}
      <section className="tariq-glass rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-text-main">
          <User className="h-5 w-5 text-polisario" />
          {t("personalData")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{tOnboard("fullName")}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{tOnboard("arabicName")}</Label>
            <Input
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{tOnboard("phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => updateProfile.mutate({ fullName, arabicName, phone })}
          disabled={updateProfile.isPending}
        >
          {t("save")}
        </Button>
      </section>

      {/* Re-subir documento */}
      {status?.verificationStatus === "REJECTED" && (
        <section className="tariq-glass rounded-2xl border border-alert/20 p-6">
          <h2 className="mb-4 font-bold text-alert">{t("resubmitDoc")}</h2>
          <DocumentTypeSelector
            value={documentType}
            onChange={setDocumentType}
          />
          <div className="mt-4">
            <FileUploader onUpload={handleUpload} />
          </div>
          <Button
            className="mt-4"
            onClick={handleResubmit}
            disabled={!documentKey || submitDocument.isPending}
          >
            {t("submitDoc")}
          </Button>
        </section>
      )}

      {!status?.canReserve && status?.verificationStatus !== "PENDING" && (
        <Button asChild className="w-full" size="lg">
          <Link href={`/${locale}/onboarding`}>{t("startOnboarding")}</Link>
        </Button>
      )}
    </div>
  );
}
