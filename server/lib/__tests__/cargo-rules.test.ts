import { describe, it, expect } from "vitest";
import {
  validateCargoItems,
  isCargoValid,
} from "@/server/lib/cargo-rules";
import { CargoCategory } from "@prisma/client";

describe("cargo-rules", () => {
  it("allows fuel diesel under 50L without auth doc error", () => {
    const result = validateCargoItems([
      {
        category: CargoCategory.FUEL_DIESEL,
        quantity: 40,
        unit: "litros",
      },
    ]);
    expect(result[0]?.exceedsLimit).toBe(false);
    expect(result[0]?.requiresAuth).toBe(false);
    expect(isCargoValid(result)).toBe(true);
  });

  it("requires auth for fuel diesel over 50L", () => {
    const result = validateCargoItems([
      {
        category: CargoCategory.FUEL_DIESEL,
        quantity: 60,
        unit: "litros",
      },
    ]);
    expect(result[0]?.exceedsLimit).toBe(true);
    expect(result[0]?.requiresAuth).toBe(true);
    expect(isCargoValid(result)).toBe(false);
  });

  it("requires auth doc for livestock", () => {
    const result = validateCargoItems([
      {
        category: CargoCategory.LIVESTOCK_CAMEL,
        quantity: 2,
        unit: "cabezas",
      },
    ]);
    expect(result[0]?.requiresAuth).toBe(true);
    expect(
      result[0]?.alerts.some((a) => a.code === "AUTH_DOCUMENT_MISSING"),
    ).toBe(true);
  });

  it("requires description for OTHER category", () => {
    const result = validateCargoItems([
      {
        category: CargoCategory.OTHER,
        quantity: 1,
        unit: "unidades",
        description: "abc",
      },
    ]);
    expect(
      result[0]?.alerts.some((a) => a.code === "OTHER_DESCRIPTION_REQUIRED"),
    ).toBe(true);
  });

  it("passes OTHER with valid description", () => {
    const result = validateCargoItems([
      {
        category: CargoCategory.OTHER,
        quantity: 1,
        unit: "unidades",
        description: "Material de carpintería variado",
      },
    ]);
    expect(isCargoValid(result)).toBe(true);
  });
});
