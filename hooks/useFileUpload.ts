"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const getUploadUrl = trpc.users.getUploadUrl.useMutation();

  async function upload(file: File): Promise<string | null> {
    setError(null);
    setProgress(0);
    try {
      const { url, key } = await getUploadUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
      });

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setProgress(100);
      return key;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      return null;
    }
  }

  return { upload, progress, error, isUploading: getUploadUrl.isPending };
}
