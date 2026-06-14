import { Wilaya, DocumentType } from "@prisma/client";

export const WILAYA_QUOTAS: Record<Wilaya, number> = {
  AAIUN: 50,
  AUSERD: 40,
  RABOUNI: 30,
  DAKHLA: 40,
  SMARA: 20,
  BOUJEDUR: 20,
};

export const TOTAL_DAILY_TICKETS = 200;

export const WILAYA_LABELS: Record<
  Wilaya,
  { ar: string; es: string; fr: string }
> = {
  AAIUN: { ar: "العيون", es: "El Aaiún", fr: "Laâyoune" },
  AUSERD: { ar: "أوسرد", es: "Auserd", fr: "Aousserd" },
  RABOUNI: { ar: "الرابوني", es: "Rabouni", fr: "Rabouni" },
  DAKHLA: { ar: "الداخلة", es: "Dakhla", fr: "Dakhla" },
  SMARA: { ar: "السمارة", es: "Smara", fr: "Smara" },
  BOUJEDUR: { ar: "بوجدور", es: "Boujedur", fr: "Boujdour" },
};

/** Datos contextuales de los campamentos (Tindouf, Argelia) — fuente: UNHCR / SADR */
export const WILAYA_INFO: Record<
  Wilaya,
  {
    quota: number;
    dairas: number;
    approxPop: string;
    distanceAr: string;
    adminCenter?: boolean;
    desc: { ar: string; es: string; fr: string };
  }
> = {
  AAIUN: {
    quota: 50,
    dairas: 6,
    approxPop: "~35.000",
    distanceAr: "ar",
    desc: {
      ar: "أكبر مخيمات تندوف. سُمّي على العيون المحتلة.",
      es: "Uno de los campamentos más poblados. Nombrado por Laâyoune ocupada.",
      fr: "L'un des camps les plus peuplés. Nommé d'après Laâyoune occupée.",
    },
  },
  AUSERD: {
    quota: 40,
    dairas: 6,
    approxPop: "~26.000",
    distanceAr: "ar",
    desc: {
      ar: "مخيم أوسرد — 6 دائرات إدارية.",
      es: "Campamento Auserd — 6 dairas administrativas.",
      fr: "Camp d'Aousserd — 6 dairas administratives.",
    },
  },
  RABOUNI: {
    quota: 30,
    dairas: 0,
    approxPop: "Administrativo",
    distanceAr: "ar",
    adminCenter: true,
    desc: {
      ar: "مركز إدارة الجمهورية العربية الصحراوية الديمقراطية والمنظمات الدولية.",
      es: "Sede del gobierno de la RASD y sede de ONG internacionales.",
      fr: "Siège du gouvernement de la RASD et des ONG internationales.",
    },
  },
  DAKHLA: {
    quota: 40,
    dairas: 7,
    approxPop: "~20.000",
    distanceAr: "170 km",
    desc: {
      ar: "أبعد المخيمات عن تندوف (~170 كم). 7 دائرات.",
      es: "El campamento más alejado de Tindouf (~170 km). 7 dairas.",
      fr: "Le camp le plus éloigné de Tindouf (~170 km). 7 dairas.",
    },
  },
  SMARA: {
    quota: 20,
    dairas: 7,
    approxPop: "~25.000",
    distanceAr: "ar",
    desc: {
      ar: "مخيم السمارة — 7 دائرات ومركز صحي.",
      es: "Campamento Smara — 7 dairas y hospital.",
      fr: "Camp de Smara — 7 dairas et hôpital.",
    },
  },
  BOUJEDUR: {
    quota: 20,
    dairas: 3,
    approxPop: "~8.000",
    distanceAr: "ar",
    desc: {
      ar: "مخيم بوجدور (الدائرة الأخيرة). 3 دائرات.",
      es: "Campamento Boujdour — la wilaya más reciente. 3 dairas.",
      fr: "Camp de Boujdour — wilaya la plus récente. 3 dairas.",
    },
  },
};

export const WILAYA_ORDER: Wilaya[] = [
  "AAIUN",
  "AUSERD",
  "RABOUNI",
  "DAKHLA",
  "SMARA",
  "BOUJEDUR",
];

/** Documentos aceptados para acreditar pertenencia a una wilaya */
export const WILAYA_DOCUMENT_TYPES: DocumentType[] = [
  "CENSUS_CERTIFICATE",
  "FAMILY_CARD",
  "RASD_ID",
  "POLISARIO_LETTER",
  "UNHCR_DOCUMENT",
];

export const DOCUMENT_TYPE_INFO: Record<
  DocumentType,
  {
    recommended?: boolean;
    desc: { ar: string; es: string; fr: string };
  }
> = {
  CENSUS_CERTIFICATE: {
    recommended: true,
    desc: {
      ar: "شهادة التعداد / الإقامة الصادرة عن دائرة أو حي المخيم",
      es: "Certificado de empadronamiento emitido por la daira o barrio del campamento",
      fr: "Certificat de recensement délivré par la daira ou le quartier",
    },
  },
  FAMILY_CARD: {
    recommended: true,
    desc: {
      ar: "بطاقة العائلة الصحراوية (RASD)",
      es: "Tarjeta familiar de la RASD",
      fr: "Carte familiale RASD",
    },
  },
  RASD_ID: {
    desc: {
      ar: "بطاقة الهوية الوطنية الصحراوية",
      es: "Documento nacional de identidad RASD",
      fr: "Carte d'identité nationale RASD",
    },
  },
  POLISARIO_LETTER: {
    desc: {
      ar: "رسالة تأييد من الف fronte Polisario / الإدارة المحلية",
      es: "Carta aval del Frente Polisario o administración local",
      fr: "Lettre d'aval du Front Polisario ou administration locale",
    },
  },
  UNHCR_DOCUMENT: {
    desc: {
      ar: "وثيقة ACNUR (للحالات الخاصة)",
      es: "Documento ACNUR (casos especiales)",
      fr: "Document HCR (cas particuliers)",
    },
  },
};

export const DESTINATION_LABELS: Record<string, { ar: string; es: string }> = {
  TIFARITI: { ar: "تيفاريتي", es: "Tifariti" },
  BIR_LEHLU: { ar: "بئر لهلو", es: "Bir Lehlú" },
  AGUENIT: { ar: "أقوينيت", es: "Agüenit" },
  MEHARIZ: { ar: "مهيريز", es: "Mehariz" },
  ZUG: { ar: "الزوق", es: "Zug" },
  MIJEK: { ar: "ميجك", es: "Miyek" },
  BIR_TIGUISIT: { ar: "بئر تيقيسيت", es: "Bir Tiguisit" },
  DOUGAJ: { ar: "دوقج", es: "Dougaj" },
};

export const CARGO_LIMITS = {
  FUEL_DIESEL: {
    freeLimit: 50,
    unit: "litros",
    requiresAuthAbove: 50,
    legalBasis: "Arrêté DGD Algérie — Zone terrestre Sud (Tindouf)",
  },
  FUEL_GASOLINE: {
    freeLimit: 90,
    unit: "litros",
    requiresAuthAbove: 90,
    legalBasis: "Arrêté DGD Algérie — Zone terrestre Sud (Tindouf)",
  },
  LIVESTOCK_CAMEL: { freeLimit: 0, requiresAuthAbove: 0, requiresVet: true },
  LIVESTOCK_GOAT: { freeLimit: 0, requiresAuthAbove: 0, requiresVet: true },
  LIVESTOCK_BOVINE: { freeLimit: 0, requiresAuthAbove: 0, requiresVet: true },
  CONSTRUCTION: { freeLimit: 0, requiresAuthAbove: 0 },
  MEDICAL_OFFICIAL: {
    freeLimit: 0,
    requiresAuthAbove: 0,
    requiresMinistryAuth: true,
  },
  DATES_PALM: { freeLimit: 0, requiresAuthAbove: 0 },
  TIRES_NEW: { freeLimit: 0, requiresAuthAbove: 0 },
} as const;

export const MIN_ADVANCE_DAYS = 2;
export const FREE_CANCEL_HOURS = 24;
export const MAX_LATE_CANCELLATIONS = 3;
export const WAITLIST_CONFIRM_HOURS = 2;
export const QUOTA_GENERATION_HOUR = 23;
export const TICKET_CODE_PREFIX = "TRQ";

export const ACCEPTED_DOC_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_DOC_SIZE_MB = 10;
