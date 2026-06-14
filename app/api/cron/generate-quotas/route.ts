import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2);
  targetDate.setHours(0, 0, 0, 0);

  const configs = await prisma.quotaConfig.findMany();

  const results = await Promise.allSettled(
    configs.map((config) =>
      prisma.dailyQuota.upsert({
        where: {
          wilaya_date: { wilaya: config.wilaya, date: targetDate },
        },
        update: {},
        create: {
          wilaya: config.wilaya,
          date: targetDate,
          totalSlots: config.daily,
          usedSlots: 0,
        },
      }),
    ),
  );

  const failures = results.filter((r) => r.status === "rejected");

  return NextResponse.json({
    success: true,
    date: targetDate.toISOString().split("T")[0],
    generated: results.filter((r) => r.status === "fulfilled").length,
    failed: failures.length,
  });
}
