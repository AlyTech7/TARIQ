import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: "elbachiryaraaly@gmail.com" },
    data: {
      role: "SUPER_ADMIN",
      verificationStatus: "APPROVED",
    },
  });
  console.log("Promoted:", user.email, "→", user.role);
}

main().finally(() => prisma.$disconnect());
