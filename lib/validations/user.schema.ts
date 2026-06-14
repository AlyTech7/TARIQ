import { DocumentType, Wilaya } from "@prisma/client";
import { z } from "zod";
import { ACCEPTED_DOC_MIME, MAX_DOC_SIZE_MB } from "@/lib/constants";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  arabicName: z.string().max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
});

export const setWilayaSchema = z.object({
  wilaya: z.nativeEnum(Wilaya),
});

export const uploadDocumentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  documentKey: z.string().min(1),
  wilaya: z.nativeEnum(Wilaya),
});

export const completeOnboardingSchema = z.object({
  wilaya: z.nativeEnum(Wilaya),
  documentType: z.nativeEnum(DocumentType),
  documentKey: z.string().min(1),
  fullName: z.string().min(2).max(100).optional(),
  arabicName: z.string().max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
});

export const signUpMetadataSchema = z.object({
  wilaya: z.nativeEnum(Wilaya),
  fullName: z.string().min(2).max(100),
  arabicName: z.string().max(100).optional(),
});

export function validateDocumentFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extMime: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  const mime =
    file.type && file.type !== "application/octet-stream"
      ? file.type
      : (extMime[ext] ?? file.type);

  if (!ACCEPTED_DOC_MIME.includes(mime as (typeof ACCEPTED_DOC_MIME)[number])) {
    return "INVALID_MIME";
  }
  if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
    return "FILE_TOO_LARGE";
  }
  return null;
}

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
