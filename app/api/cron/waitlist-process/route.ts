import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { WAITLIST_CONFIRM_HOURS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await prisma.waitlistEntry.findMany({
    where: {
      confirmed: false,
      expired: false,
      expiresAt: { lt: new Date() },
    },
  });

  for (const entry of expired) {
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { expired: true },
    });
  }

  const pendingSlots = await prisma.dailyQuota.findMany({
    where: {
      date: { gte: new Date() },
    },
  });

  let processed = 0;

  for (const quota of pendingSlots) {
    if (quota.usedSlots >= quota.totalSlots) continue;

    const nextInLine = await prisma.waitlistEntry.findFirst({
      where: {
        wilaya: quota.wilaya,
        travelDate: quota.date,
        confirmed: false,
        expired: false,
        notifiedAt: null,
      },
      orderBy: { position: "asc" },
    });

    if (!nextInLine) continue;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + WAITLIST_CONFIRM_HOURS);

    await prisma.waitlistEntry.update({
      where: { id: nextInLine.id },
      data: { notifiedAt: new Date(), expiresAt },
    });

    await prisma.systemNotification.create({
      data: {
        userId: nextInLine.userId,
        type: "WAITLIST_SLOT",
        titleAr: "مقعد متاح!",
        titleEs: "¡Plaza disponible!",
        bodyAr: "يوجد مقعد متاح لك. أكد خلال ساعتين.",
        bodyEs: "Hay una plaza disponible. Confirma en 2 horas.",
      },
    });

    processed++;
  }

  return NextResponse.json({
    success: true,
    expired: expired.length,
    notified: processed,
  });
}
