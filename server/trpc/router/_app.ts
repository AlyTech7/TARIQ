import { createTRPCRouter } from "../init";
import { ticketsRouter, publicTicketsRouter } from "./tickets";
import { usersRouter } from "./users";
import { quotasRouter } from "./quotas";
import { cargoRouter } from "./cargo";
import { superAdminRouter } from "./super-admin";

export const appRouter = createTRPCRouter({
  tickets: ticketsRouter,
  public: publicTicketsRouter,
  users: usersRouter,
  quotas: quotasRouter,
  cargo: cargoRouter,
  superAdmin: superAdminRouter,
});

export type AppRouter = typeof appRouter;
