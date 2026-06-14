"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
function buildVerifyUrl(qrToken: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/verificar/${qrToken}`;
}

interface TicketQRProps {
  qrToken: string;
  ticketCode: string;
  size?: number;
}

export function TicketQR({ qrToken, ticketCode, size = 256 }: TicketQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = buildVerifyUrl(qrToken);
    QRCode.toDataURL(url, { width: size, margin: 2 }).then(setDataUrl);
  }, [qrToken, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded bg-sand/30"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR ${ticketCode}`} width={size} height={size} />
      <p className="font-mono text-lg font-bold text-polisario">{ticketCode}</p>
    </div>
  );
}
