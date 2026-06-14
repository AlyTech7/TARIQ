import "server-only";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/router/_app";
import { createTRPCContext } from "@/server/trpc/init";

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  return createCaller(ctx);
}
