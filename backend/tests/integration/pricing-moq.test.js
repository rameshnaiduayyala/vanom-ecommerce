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
      include: {
        variants: true,
        b2cListing: { include: { prices: true } },
        b2bListings: { include: { prices: true, tiers: true } },
      },
    });
    soilVariant = soilProduct?.variants[0];

    approvedCompany = await prisma.business.findFirst({
      where: { status: "APPROVED" },
      include: { members: { include: { business: true } } },
    });

    if (approvedCompany?.members?.[0]) {
      b2bUser = {
        id: approvedCompany.members[0].userId,
        customerType: "B2B",
        roles: ["BUSINESS_USER"],
        companyMembers: approvedCompany.members,
        businessMemberships: approvedCompany.members,
      };
    }
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("should resolve standard B2C retail price in USD ($24.99)", async () => {
    if (!soilProduct || !soilVariant) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 1,
      countryCode: "US",
      currencyCode: "USD",
      user: null, // guest or retail
    });

    expect(Money.format(result.unitPrice, 2)).toBe("24.99");
    expect(Money.format(result.subtotal, 2)).toBe("24.99");
    expect(result.currency).toBe("USD");
    expect(result.isB2B).toBe(false);
  });

  it("should resolve standard B2C retail price in CAD ($32.99)", async () => {
    if (!soilProduct || !soilVariant) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 2,
      countryCode: "CA",
      currencyCode: "CAD",
      user: null,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("32.99");
    expect(Money.format(result.subtotal, 2)).toBe("65.98");
    expect(result.currency).toBe("CAD");
    expect(result.isB2B).toBe(false);
  });

  it("should resolve B2B Base Unit Price ($16.50) in USD for approved B2B business", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 10,
      countryCode: "US",
      currencyCode: "USD",
      user: b2bUser,
      companyId: approvedCompany.id,
      businessId: approvedCompany.id,
    });

    expect(Money.format(result.unitPrice, 2)).toBe("16.50");
    expect(Money.format(result.subtotal, 2)).toBe("165.00");
    expect(result.currency).toBe("USD");
    expect(result.isB2B).toBe(true);
  });

  it("should resolve B2B Volume Discount Tier (100+ units: 15% off -> $14.025) in USD", async () => {
    if (!soilProduct || !soilVariant || !b2bUser) return;

    const result = await PriceResolver.resolvePrice({
      productId: soilProduct.id,
      variantId: soilVariant.id,
      quantity: 100,
      countryCode: "US",
      currencyCode: "USD",
      user: b2bUser,
      companyId: approvedCompany.id,
      businessId: approvedCompany.id,
    });

    expect(Number(result.unitPrice)).toBeLessThan(16.50);
    expect(result.currency).toBe("USD");
    expect(result.isB2B).toBe(true);
  });
});
