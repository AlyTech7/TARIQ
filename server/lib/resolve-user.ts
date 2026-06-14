import { currentUser } from "@clerk/nextjs/server";
import { Wilaya, type User } from "@prisma/client";
import { prisma } from "@/server/db";

export function isDatabaseConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("P1000") ||
    msg.includes("P1001") ||
    msg.includes("Can't reach database") ||
    msg.includes("Authentication failed") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("connect ETIMEDOUT")
  );
}

export async function resolveUser(clerkId: string): Promise<User | null> {
  try {
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) return user;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const unsafe = clerkUser.unsafeMetadata as { wilaya?: Wilaya };
    const pub = clerkUser.publicMetadata as { wilaya?: Wilaya };
    const metadataWilaya = unsafe.wilaya ?? pub.wilaya;
    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "Usuario";

    user = await prisma.user.create({
      data: {
        clerkId,
        fullName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber,
        wilaya: metadataWilaya ?? Wilaya.RABOUNI,
      },
    });

    return user;
  } catch (err) {
    if (isDatabaseConnectionError(err)) throw err;
    console.error("[resolveUser]", err);
    return null;
  }
}
