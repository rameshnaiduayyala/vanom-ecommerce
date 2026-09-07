import { DefaultTaxProvider } from "./providers/index.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * TaxService
 * Direct Prisma queries, multi-region tax calculating providers (Avalara, Stripe Tax, default VAT/GST)
 */
export class TaxService {
  constructor(taxProvider = new DefaultTaxProvider()) {
    this.taxProvider = taxProvider;
  }

  async calculateTax({ countryCode = "IN", regionCode = null, items = [], customerType = "B2C", isB2BApproved = false }) {
    const country = await prisma.country.findUnique({
      where: { code: countryCode.toUpperCase() },
    });
    if (!country) {
      throw new NotFoundError(`Country '${countryCode}' not found`);
    }

    return this.taxProvider.calculateTax({
      countryCode,
      regionCode,
      items,
      customerType,
      isB2BApproved,
    });
  }

  async findJurisdiction(countryId, regionId = null) {
    return prisma.taxJurisdiction.findFirst({
      where: {
        countryId,
        regionId: regionId || undefined,
        active: true,
      },
      include: {
        rates: { where: { active: true } },
        rules: { where: { active: true } },
      },
    });
  }

  async saveTaxCalculation({ orderId, countryId, provider, totalTax, lines, response }, tx = null) {
    const db = tx || prisma;
    return db.taxCalculation.create({
      data: {
        orderId,
        countryId,
        provider,
        totalTax,
        response,
        lines: {
          create: (lines || []).map((line) => ({
            orderItemId: line.orderItemId,
            taxRateId: line.taxRateId || null,
            taxableAmount: line.taxableAmount,
            rate: line.rate,
            taxAmount: line.taxAmount,
            taxType: line.taxType,
            jurisdictionSnapshot: line.jurisdictionSnapshot || {},
          })),
        },
      },
      include: { lines: true },
    });
  }
}
