type UploadTarget = {
  url: string;
  key: string;
  mode: "r2" | "local";
  method: "PUT" | "POST";
};

function resolveContentType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return map[ext ?? ""] ?? file.type;
}

async function prepareUpload(contentType: string): Promise<UploadTarget> {
  const res = await fetch("/api/upload/prepare", {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      res.status === 401
        ? "Sesión expirada — recarga la página"
        : `No se pudo preparar la subida (${res.status})`,
    );
  }

  const text = await res.text();
  let target: UploadTarget;
  try {
    target = JSON.parse(text) as UploadTarget;
  } catch {
    throw new Error("Error del servidor — recarga la página e inténtalo de nuevo");
  }
  return target;
}

async function uploadToTarget(
  file: File,
  target: UploadTarget,
  contentType: string,
): Promise<string> {
  if (target.mode === "local" && target.method === "POST") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", target.key);

    const res = await fetch(target.url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const err = JSON.parse(text) as { error?: string };
        throw new Error(err.error ?? `Error ${res.status}`);
      } catch (e) {
        if (e instanceof Error && !e.message.startsWith("Unexpected token")) {
          throw e;
        }
        throw new Error(`Error al subir (${res.status})`);
      }
    }
    return target.key;
  }

  const res = await fetch(target.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) throw new Error(`Error al subir (${res.status})`);
  return target.key;
}

export async function performDocumentUpload(
  file: File,
  getTarget?: (input: {
    filename: string;
    contentType: string;
    purpose: "identity" | "cargo";
  }) => Promise<UploadTarget>,
  purpose: "identity" | "cargo" = "identity",
): Promise<string> {
  const contentType = resolveContentType(file);

  try {
    const target = await prepareUpload(contentType);
    return await uploadToTarget(file, target, contentType);
  } catch (prepareErr) {
    if (!getTarget) throw prepareErr;
  }

  if (!getTarget) {
    throw new Error("No se pudo preparar la subida");
  }

  const target = await getTarget({
    filename: file.name,
    contentType,
    purpose,
  });
  return uploadToTarget(file, target, contentType);
}
