import { prisma } from "../../infrastructure/database/prisma.js";

export class PricingRepository {
  static async findPriceListsForCompany(companyId, countryId, currencyId) {
    return prisma.priceList.findMany({
      where: {
        countryId,
        currencyId,
        status: "ACTIVE",
        companies: {
          some: {
            companyId,
          },
        },
      },
      include: {
        companies: {
          where: { companyId },
        },
        prices: {
          where: { status: "ACTIVE" },
        },
      },
      orderBy: { priority: "desc" },
    });
  }

  static async findCustomerGroupPriceLists(customerGroupCode, countryId, currencyId) {
    return prisma.priceList.findMany({
      where: {
        countryId,
        currencyId,
        status: "ACTIVE",
        customerGroup: {
          code: customerGroupCode,
        },
      },
      include: {
        prices: {
          where: { status: "ACTIVE" },
        },
      },
      orderBy: { priority: "desc" },
    });
  }

  static async findProductPrices({ productId, variantId, priceListIds }) {
    return prisma.productPrice.findMany({
      where: {
        priceListId: { in: priceListIds },
        status: "ACTIVE",
        OR: [
          { variantId: variantId || undefined },
          { productId, variantId: null },
        ],
      },
      orderBy: { minQuantity: "desc" },
    });
  }

  static async getPackagingForVariant(variantId) {
    return prisma.productPackaging.findMany({
      where: { variantId },
      include: {
        unit: true,
        type: true,
        pallet: true,
      },
    });
  }
}
