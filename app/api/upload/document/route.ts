import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  saveLocalDocument,
  readLocalDocument,
  isR2Configured,
} from "@/server/lib/r2";
import { ACCEPTED_DOC_MIME, MAX_DOC_SIZE_MB } from "@/lib/constants";

export async function POST(req: NextRequest) {
  if (isR2Configured()) {
    return NextResponse.json(
      { error: "Use presigned R2 URL in production" },
      { status: 400 },
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;

    if (!file || !key) {
      return NextResponse.json({ error: "Missing file or key" }, { status: 400 });
    }

    if (!key.startsWith(`documents/`)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const mime = file.type || guessMime(file.name);
    if (
      !ACCEPTED_DOC_MIME.includes(mime as (typeof ACCEPTED_DOC_MIME)[number])
    ) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveLocalDocument(key, buffer, mime);

    return NextResponse.json({ success: true, key });
  } catch (err) {
    console.error("[upload/document]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await readLocalDocument(key);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(doc.buffer), {
    headers: {
      "Content-Type": doc.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

function guessMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}
