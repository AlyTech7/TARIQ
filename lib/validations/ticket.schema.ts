import { CargoCategory } from "@prisma/client";
import { z } from "zod";

export const cargoItemSchema = z.object({
  category: z.nativeEnum(CargoCategory),
  description: z.string().max(500).optional(),
  quantity: z.number().positive().max(100000),
  unit: z.string().min(1).max(20),
  estimatedKg: z.number().positive().optional(),
  authDocUrl: z.string().url().optional(),
  authDocKey: z.string().optional(),
});

export const reserveTicketSchema = z.object({
  travelDate: z.coerce.date().refine(
    (date) => {
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() + 2);
      return date >= minDate;
    },
    { message: "La fecha debe ser al menos 48 horas en el futuro" },
  ),
  destination: z.enum([
    "TIFARITI",
    "BIR_LEHLU",
    "AGUENIT",
    "MEHARIZ",
    "ZUG",
    "MIJEK",
    "BIR_TIGUISIT",
    "DOUGAJ",
  ]),
  passengerName: z.string().min(2).max(100),
  passengerPhone: z.string().optional(),
  cargoItems: z.array(cargoItemSchema).min(0).max(20),
  notes: z.string().max(1000).optional(),
});

export type CargoItemInput = z.infer<typeof cargoItemSchema>;
export type ReserveTicketInput = z.infer<typeof reserveTicketSchema>;
