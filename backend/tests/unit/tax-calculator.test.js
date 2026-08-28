import { describe, it, expect } from "vitest";
import { DefaultTaxProvider } from "../../src/modules/tax/providers/index.js";
import { Money } from "../../src/common/utils/money.js";

describe("Tax Calculator Engine", () => {
  const taxProvider = new DefaultTaxProvider();

  it("should calculate 18% standard GST for India (IN)", async () => {
    const items = [
      { variantId: "var-1", subtotal: 1000, quantity: 2, unitPrice: 500 },
    ];
    const result = await taxProvider.calculateTax({
      countryCode: "IN",
      items,
      customerType: "B2C",
    });

    expect(result.taxLines[0].taxType).toBe("GST");
    expect(Money.format(result.totalTax, 2)).toBe("180.00");
  });

  it("should calculate 20% standard VAT for United Kingdom (GB)", async () => {
    const items = [
      { variantId: "var-1", subtotal: 200, quantity: 1, unitPrice: 200 },
    ];
    const result = await taxProvider.calculateTax({
      countryCode: "GB",
      items,
      customerType: "B2C",
    });

    expect(result.taxLines[0].taxType).toBe("VAT");
    expect(Money.format(result.totalTax, 2)).toBe("40.00");
  });

  it("should calculate 8.25% Sales Tax for United States (US)", async () => {
    const items = [
      { variantId: "var-1", subtotal: 100, quantity: 1, unitPrice: 100 },
    ];
    const result = await taxProvider.calculateTax({
      countryCode: "US",
      items,
      customerType: "B2C",
    });

    expect(result.taxLines[0].taxType).toBe("SALES_TAX");
    expect(Money.format(result.totalTax, 2)).toBe("8.25");
  });
});
