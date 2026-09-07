import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "./price-resolver.js";

/**
 * PricingService
 * Real-time contextual B2B/B2C pricing, price lists, tiers, and packaging logic
 */
export class PricingService {
  async resolvePrice(context) {
    return PriceResolver.resolvePrice(context);
  }

  async getPackaging(variantId) {
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
