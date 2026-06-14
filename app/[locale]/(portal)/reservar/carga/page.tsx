"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CargoCategory } from "@prisma/client";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { RestrictionAlert } from "@/components/booking/RestrictionAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import type { CargoItemValidated } from "@/server/lib/cargo-rules";

interface CargoFormItem {
  category: CargoCategory;
  description: string;
  quantity: number;
  unit: string;
}

const CATEGORIES = Object.values(CargoCategory);

function CargaContent() {
  const t = useTranslations("booking");
  const tCargo = useTranslations("cargo");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const travelDate = searchParams.get("travelDate") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const passengerName = searchParams.get("passengerName") ?? "";
  const passengerPhone = searchParams.get("passengerPhone") ?? "";

  const [items, setItems] = useState<CargoFormItem[]>([]);
  const [validated, setValidated] = useState<CargoItemValidated[]>([]);

  const validateMutation = trpc.cargo.validate.useMutation({
    onSuccess: (data) => setValidated(data.items),
  });

  function addItem() {
    setItems([
      ...items,
      {
        category: "PERSONAL_EFFECTS",
        description: "",
        quantity: 1,
        unit: "unidades",
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<CargoFormItem>) {
    const next = [...items];
    next[index] = { ...next[index]!, ...patch };
    setItems(next);
    validateMutation.mutate({ items: next });
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    if (next.length > 0) validateMutation.mutate({ items: next });
    else setValidated([]);
  }

  const hasErrors = validated.some((v) =>
    v.alerts.some((a) => a.level === "error"),
  );

  function handleNext() {
    const params = new URLSearchParams({
      travelDate,
      destination,
      passengerName,
      ...(passengerPhone ? { passengerPhone } : {}),
      cargo: JSON.stringify(items),
    });
    router.push(`/${locale}/reservar/confirmacion?${params.toString()}`);
  }

  if (!travelDate || !destination || !passengerName) {
    router.replace(`/${locale}/reservar`);
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <BookingStepper currentStep={2} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("step2")}</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            + {t("addCargoItem")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-text-main/60">{t("noCargo")}</p>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-sand/40 p-4"
            >
              <div className="space-y-2">
                <Label>{t("cargo")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-sand/60 px-3 text-sm"
                  value={item.category}
                  onChange={(e) =>
                    updateItem(index, {
                      category: e.target.value as CargoCategory,
                    })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {tCargo(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{tCargo("quantity")}</Label>
                  <Input
                    type="number"
                    min={0.1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, {
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tCargo("unit")}</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(index, { unit: e.target.value })
                    }
                  />
                </div>
              </div>
              {(item.category === "OTHER" ||
                item.category === "MEDICAL_OFFICIAL") && (
                <div className="space-y-2">
                  <Label>{tCargo("description")}</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                  />
                </div>
              )}
              {validated[index] && (
                <RestrictionAlert alerts={validated[index]!.alerts} />
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeItem(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              ← {t("step1")}
            </Button>
            <Button
              onClick={handleNext}
              disabled={hasErrors}
              className="flex-1"
            >
              {t("step3")} →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CargaPage() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <CargaContent />
    </Suspense>
  );
}
