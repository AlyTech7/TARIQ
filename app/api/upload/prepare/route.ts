import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateDocumentKey, isR2Configured, createUploadTarget } from "@/server/lib/r2";

/** Prepara subida de documento — solo requiere sesión Clerk (no PostgreSQL) */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = generateDocumentKey(clerkId, `identity-${Date.now()}.bin`);

  if (isR2Configured()) {
    try {
      const target = await createUploadTarget(key, "application/octet-stream");
      return NextResponse.json(target);
    } catch {
      return NextResponse.json({ error: "R2 unavailable" }, { status: 500 });
    }
  }

  return NextResponse.json({
    mode: "local",
    url: "/api/upload/document",
    key,
    method: "POST",
  });
}
