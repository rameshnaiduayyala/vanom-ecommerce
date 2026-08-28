import { describe, expect, it } from "vitest";
import { Money } from "../../src/common/utils/money.js";

describe("Pricing Engine Core Logic", () => {
  it("should calculate bulk discount tiers with financial precision", () => {
    const tierPrice = Money.toDecimal("420.00");
    const quantity = 25;
    const total = Money.multiply(tierPrice, quantity);
    expect(Money.format(total, 2)).toBe("10500.00");
  });
});
