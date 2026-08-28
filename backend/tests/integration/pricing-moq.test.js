import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PriceResolver } from "../../src/modules/pricing/price-resolver.js";
import { prisma, disconnectPrisma } from "../../src/infrastructure/database/prisma.js";
import { Money } from "../../src/common/utils/money.js";

describe("Authoritative Price Resolver & MOQ Tests", () => {
  let soilProduct;
  let soilVariant;
  let approvedCompany;
  let b2bUser;

  beforeAll(async () => {
    soilProduct = await prisma.product.findUnique({
      where: { slug: "premium-garden-soil" },
      include: { variants: true },
    });
    soilVariant = soilProduct?.variants[0];

    approvedCompany = await prisma.company.findFirst({
      where: { status: "APPROVED" },
      include: { members: { include: { company: true } } },
    });

    if (approvedCompany?.members?.[0]) {
      b2bUser = {
        id: approvedCompany.members[0].userId,
        customerType: "B2B",
        roles: ["COMPANY_ADMIN"],
        companyMembers: approvedCompany.members,
      };
    }
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("should resolve standard B2C retail price in India (₹499)", async () => {
    if (!soilProduct || !soilVariant) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 1,
      countryCode: "IN",
      currencyCode: "INR",
      user: null, // guest or retail
    });

    expect(Money.format(result.unitPrice, 2)).toBe("499.00");
    expect(Money.format(result.subtotal, 2)).toBe("499.00");
    expect(result.currency).toBe("INR");
    expect(result.isB2B).toBe(false);
  });

  it("should resolve B2B Tier 1 (20-49 sacks: ₹420) for approved B2B company", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 25,
      countryCode: "IN",
      currencyCode: "INR",
      user: b2bUser,
      companyId: approvedCompany.id,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("420.00");
    expect(Money.format(result.subtotal, 2)).toBe("10500.00"); // 25 * 420
    expect(result.isB2B).toBe(true);
  });

  it("should resolve B2B Tier 3 (100+ sacks: ₹350) for approved B2B company", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 100,
      countryCode: "IN",
      currencyCode: "INR",
      user: b2bUser,
      companyId: approvedCompany.id,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("350.00");
    expect(Money.format(result.subtotal, 2)).toBe("35000.00");
    expect(result.isB2B).toBe(true);
  });

  it("should resolve USA B2B Tier 1 (20-49 sacks: $16.50) in USD", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 30,
      countryCode: "US",
      currencyCode: "USD",
      user: b2bUser,
      companyId: approvedCompany.id,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("16.50");
    expect(result.currency).toBe("USD");
    expect(result.isB2B).toBe(true);
  });

  it("should resolve UK B2B Tier 3 (100+ sacks: £12.20) in GBP", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 150,
      countryCode: "GB",
      currencyCode: "GBP",
      user: b2bUser,
      companyId: approvedCompany.id,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("12.20");
    expect(result.currency).toBe("GBP");
    expect(result.isB2B).toBe(true);
  });
});
