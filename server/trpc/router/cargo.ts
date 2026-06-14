import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import {
  validateCargoItems,
  isCargoValid,
  type CargoItemInput,
} from "@/server/lib/cargo-rules";
import { cargoItemSchema } from "@/lib/validations/ticket.schema";
import { CargoCategory } from "@prisma/client";

export const cargoRouter = createTRPCRouter({
  validate: protectedProcedure
    .input(z.object({ items: z.array(cargoItemSchema) }))
    .mutation(({ input }) => {
      const items: CargoItemInput[] = input.items.map((item) => ({
        ...item,
        category: item.category as CargoCategory,
      }));
      const validated = validateCargoItems(items);
      return {
        items: validated,
        isValid: isCargoValid(validated),
      };
    }),
});
