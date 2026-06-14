"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { validateDocumentFile } from "@/lib/validations/user.schema";
import { MAX_DOC_SIZE_MB } from "@/lib/constants";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploaderProps {
  onUpload: (file: File) => Promise<string | null>;
  accept?: string;
  disabled?: boolean;
  currentFileName?: string | null;
}

export function FileUploader({
  onUpload,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  disabled,
  currentFileName,
}: FileUploaderProps) {
  const t = useTranslations("upload");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(
    currentFileName ?? null,
  );

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateDocumentFile(file);
      if (validationError === "INVALID_MIME") {
        setError(t("invalidType"));
        return;
      }
      if (validationError === "FILE_TOO_LARGE") {
        setError(t("tooLarge", { max: MAX_DOC_SIZE_MB }));
        return;
      }

      setUploading(true);
      try {
        const key = await onUpload(file);
        if (key) setFileName(file.name);
        else setError(t("failed"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failed"));
      } finally {
        setUploading(false);
      }
    },
    [onUpload, t],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }

  function clearFile() {
    setFileName(null);
    setError(null);
  }

  if (fileName) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-polisario/30 bg-polisario/5 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-polisario/15 text-polisario">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text-main">{fileName}</p>
          <p className="text-xs text-polisario">{t("uploaded")}</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={clearFile}
            className="rounded-lg p-2 text-text-main/50 hover:bg-sand/30 hover:text-alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "tariq-upload-zone flex cursor-pointer flex-col items-center gap-3 px-6 py-10",
          dragging && "dragging",
          (disabled || uploading) && "cursor-not-allowed opacity-60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={handleChange}
        />
        {uploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-polisario" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand/40 text-polisario">
            <Upload className="h-7 w-7" />
          </div>
        )}
        <div className="text-center">
          <p className="font-medium text-text-main">{t("dropHere")}</p>
          <p className="mt-1 text-xs text-text-main/55">
            PDF, JPG, PNG · {t("maxSize", { max: MAX_DOC_SIZE_MB })}
          </p>
        </div>
      </label>
      {error && (
        <p className="text-sm text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
