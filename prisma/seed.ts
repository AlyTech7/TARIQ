import { PrismaClient, Wilaya } from "@prisma/client";

const prisma = new PrismaClient();

const QUOTA_CONFIG = [
  { wilaya: Wilaya.AAIUN, daily: 50 },
  { wilaya: Wilaya.AUSERD, daily: 40 },
  { wilaya: Wilaya.RABOUNI, daily: 30 },
  { wilaya: Wilaya.DAKHLA, daily: 40 },
  { wilaya: Wilaya.SMARA, daily: 20 },
  { wilaya: Wilaya.BOUJEDUR, daily: 20 },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const config of QUOTA_CONFIG) {
    await prisma.quotaConfig.upsert({
      where: { wilaya: config.wilaya },
      update: { daily: config.daily },
      create: config,
    });
  }

  const emergencyCount = await prisma.emergencyState.count();
  if (emergencyCount === 0) {
    await prisma.emergencyState.create({
      data: { isActive: false, type: "NONE" },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    for (const config of QUOTA_CONFIG) {
      await prisma.dailyQuota.upsert({
        where: { wilaya_date: { wilaya: config.wilaya, date } },
        update: {},
        create: {
          wilaya: config.wilaya,
          date,
          totalSlots: config.daily,
          usedSlots: 0,
        },
      });
    }
  }

  console.log("✅ Seed completado — Cuotas configuradas para 14 días");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
