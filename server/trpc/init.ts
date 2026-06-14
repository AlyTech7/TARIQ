import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/server/db";
import { Wilaya, type User } from "@prisma/client";
import { enforceRole } from "./middleware/auth";

async function resolveUser(clerkId: string): Promise<User | null> {
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
  } catch {
    return null;
  }
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId: clerkId } = await auth();

  let user: User | null = null;
  if (clerkId) {
    user = await resolveUser(clerkId);
  }

  const trpcSource = opts.headers.get("x-trpc-source");
  if (
    trpcSource !== "tariq-client" &&
    process.env.NODE_ENV === "production"
  ) {
    const isServerCall = !opts.headers.get("origin");
    if (!isServerCall) {
      throw new TRPCError({ code: "FORBIDDEN", message: "INVALID_TRPC_SOURCE" });
    }
  }

  return {
    db: prisma,
    clerkId,
    user,
    userId: user?.id ?? null,
    headers: opts.headers,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.clerkId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "USER_NOT_SYNCED",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  enforceRole(ctx.user.role, ["WILAYA_ADMIN", "SUPER_ADMIN"]);
  return next({ ctx });
});

export const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  enforceRole(ctx.user.role, ["SUPER_ADMIN"]);
  return next({ ctx });
});
