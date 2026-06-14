import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";

const BUCKET = process.env.R2_BUCKET_NAME ?? "tariq-documents";
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_ACCOUNT_ID !== "..." &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_ACCESS_KEY_ID !== "..." &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_SECRET_ACCESS_KEY !== "..."
  );
}

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export function generateDocumentKey(
  userId: string,
  filename: string,
): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `documents/${userId}/${Date.now()}-${safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`}`;
}

export type UploadTarget =
  | { mode: "r2"; url: string; key: string; method: "PUT" }
  | { mode: "local"; url: string; key: string; method: "POST" };

export async function createUploadTarget(
  key: string,
  contentType: string,
): Promise<UploadTarget> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (isR2Configured()) {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(getS3Client(), command, {
      expiresIn: 3600,
    });
    return { mode: "r2", url, key, method: "PUT" };
  }

  // Desarrollo local sin R2 — URL relativa al mismo origen
  return {
    mode: "local" as const,
    url: "/api/upload/document",
    key,
    method: "POST" as const,
  };
}

export async function saveLocalDocument(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  await writeFile(`${filePath}.meta.json`, JSON.stringify({ contentType }));
}

export async function readLocalDocument(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  try {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key);
    const buffer = await readFile(filePath);
    let contentType = "application/octet-stream";
    try {
      const meta = JSON.parse(
        await readFile(`${filePath}.meta.json`, "utf-8"),
      ) as { contentType?: string };
      contentType = meta.contentType ?? contentType;
    } catch {
      // sin meta
    }
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (isR2Configured()) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/upload/document?key=${encodeURIComponent(key)}`;
}

// Re-export for backwards compat
export { createUploadTarget as getUploadUrl };
