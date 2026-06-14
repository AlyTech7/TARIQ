import { createHmac } from "crypto";

export function signQRData(data: string): string {
  const secret = process.env.QR_HMAC_SECRET;
  if (!secret) throw new Error("QR_HMAC_SECRET not configured");
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyQRSignature(data: string, signature: string): boolean {
  const expected = signQRData(data);
  return expected === signature;
}

export function buildVerifyUrl(qrToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/verificar/${qrToken}`;
}
