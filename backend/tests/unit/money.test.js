import { describe, it, expect } from "vitest";
import { Money } from "../../src/common/utils/money.js";
import { Prisma } from "@prisma/client";

describe("Money - Financial Precision Engine", () => {
  it("should prevent JavaScript floating point precision issues (0.1 + 0.2 = 0.3)", () => {
    // Standard JS: 0.1 + 0.2 === 0.30000000000000004
    const result = Money.add(0.1, 0.2);
    expect(Money.format(result, 2)).toBe("0.30");
    expect(Money.isEqual(result, new Prisma.Decimal("0.3"))).toBe(true);
  });

  it("should accurately calculate quantity tiers without floating point drift", () => {
    // 350.55 * 100
    const total = Money.multiply("350.55", 100);
    expect(Money.format(total, 2)).toBe("35055.00");
  });

  it("should calculate exact percentages for tax and discounts", () => {
    // 18% GST on 499.00
    const tax = Money.percentage("499.00", 18);
    expect(Money.format(tax, 2)).toBe("89.82");
  });

  it("should handle division and rounding with half-up rule", () => {
    const divided = Money.divide("100.00", "3");
    expect(Money.format(divided, 2)).toBe("33.33");
  });

  it("should throw error on division by zero", () => {
    expect(() => Money.divide(100, 0)).toThrow("Division by zero in financial calculation");
  });

  it("should correctly compare decimal values", () => {
    expect(Money.isGreaterThan("100.50", "100.49")).toBe(true);
    expect(Money.isLessThan("50.00", "50.01")).toBe(true);
    expect(Money.isEqual("12.00", 12)).toBe(true);
  });
});
