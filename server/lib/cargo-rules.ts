import { CargoCategory } from "@prisma/client";
import { CARGO_LIMITS } from "@/lib/constants";

export interface CargoItemInput {
  category: CargoCategory;
  description?: string;
  quantity: number;
  unit: string;
  estimatedKg?: number;
  authDocUrl?: string;
  authDocKey?: string;
}

export interface CargoItemValidated extends CargoItemInput {
  exceedsLimit: boolean;
  requiresAuth: boolean;
  alerts: CargoAlert[];
}

export interface CargoAlert {
  level: "warning" | "error" | "info";
  code: string;
  messageAr: string;
  messageEs: string;
  requiresDocument: boolean;
}

export function validateCargoItems(
  items: CargoItemInput[],
): CargoItemValidated[] {
  return items.map((item) => {
    const alerts: CargoAlert[] = [];
    let exceedsLimit = false;
    let requiresAuth = false;

    switch (item.category) {
      case "FUEL_DIESEL":
        if (item.quantity > CARGO_LIMITS.FUEL_DIESEL.freeLimit) {
          exceedsLimit = true;
          requiresAuth = true;
          alerts.push({
            level: "warning",
            code: "FUEL_DIESEL_OVER_LIMIT",
            messageAr: `الكمية المنقولة (${item.quantity}L) تتجاوز الحد المسموح (50L) دون تصريح. يجب إرفاق وثيقة التصريح الجمركي.`,
            messageEs: `La cantidad (${item.quantity}L) supera el límite libre de 50L de gasóleo. Se requiere autorización de circulación de aduanas argelinas.`,
            requiresDocument: true,
          });
        }
        break;

      case "FUEL_GASOLINE":
        if (item.quantity > CARGO_LIMITS.FUEL_GASOLINE.freeLimit) {
          exceedsLimit = true;
          requiresAuth = true;
          alerts.push({
            level: "warning",
            code: "FUEL_GASOLINE_OVER_LIMIT",
            messageAr: `الكمية (${item.quantity}L) تتجاوز الحد المسموح (90L) دون تصريح.`,
            messageEs: `La cantidad (${item.quantity}L) supera el límite libre de 90L de gasolina. Se requiere autorización.`,
            requiresDocument: true,
          });
        }
        break;

      case "LIVESTOCK_CAMEL":
      case "LIVESTOCK_GOAT":
      case "LIVESTOCK_BOVINE":
        requiresAuth = true;
        alerts.push({
          level: "info",
          code: "LIVESTOCK_VET_REQUIRED",
          messageAr:
            "نقل الحيوانات الحية يستلزم شهادة بيطرية من وزارة الفلاحة الجزائرية.",
          messageEs:
            "El transporte de ganado requiere certificado veterinario del Ministerio de Agricultura argelino.",
          requiresDocument: true,
        });
        break;

      case "CONSTRUCTION":
        requiresAuth = true;
        alerts.push({
          level: "info",
          code: "CONSTRUCTION_AUTH_REQUIRED",
          messageAr:
            "مواد البناء (إسمنت، حديد) تستلزم تصريح بالتنقل من الجمارك.",
          messageEs:
            "Los materiales de construcción (cemento, hierro) requieren autorización de circulación aduanera.",
          requiresDocument: true,
        });
        break;

      case "MEDICAL_OFFICIAL":
        requiresAuth = true;
        if (!item.description) {
          alerts.push({
            level: "error",
            code: "MEDICAL_DESCRIPTION_REQUIRED",
            messageAr: "يجب وصف المستلزمات الطبية بالتفصيل.",
            messageEs: "Debe describir detalladamente el material médico.",
            requiresDocument: false,
          });
        }
        alerts.push({
          level: "warning",
          code: "MEDICAL_MINISTRY_AUTH",
          messageAr:
            "المستلزمات الطبية تستلزم تصريح من وزارة الصحة الجزائرية.",
          messageEs:
            "El material médico oficial requiere autorización del Ministerio de Salud argelino.",
          requiresDocument: true,
        });
        break;

      case "DATES_PALM":
      case "TIRES_NEW":
        requiresAuth = true;
        alerts.push({
          level: "info",
          code: "GENERIC_AUTH_REQUIRED",
          messageAr: "هذا النوع من البضاعة يستلزم تصريح بالتنقل.",
          messageEs:
            "Este tipo de mercancía requiere autorización de circulación.",
          requiresDocument: true,
        });
        break;

      case "OTHER":
        if (!item.description || item.description.trim().length < 10) {
          alerts.push({
            level: "error",
            code: "OTHER_DESCRIPTION_REQUIRED",
            messageAr:
              "يجب وصف البضاعة الأخرى بوضوح (10 حروف على الأقل).",
            messageEs:
              "Debe describir claramente la carga 'Otro' (mínimo 10 caracteres).",
            requiresDocument: false,
          });
        }
        break;
    }

    if (requiresAuth && !item.authDocUrl) {
      alerts.push({
        level: "error",
        code: "AUTH_DOCUMENT_MISSING",
        messageAr: "وثيقة التصريح مطلوبة ولم يتم إرفاقها بعد.",
        messageEs:
          "El documento de autorización es obligatorio pero aún no se ha subido.",
        requiresDocument: true,
      });
    }

    return { ...item, exceedsLimit, requiresAuth, alerts };
  });
}

export function isCargoValid(validated: CargoItemValidated[]): boolean {
  return validated.every((item) =>
    item.alerts.every((alert) => alert.level !== "error"),
  );
}
