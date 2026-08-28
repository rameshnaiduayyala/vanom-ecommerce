import { prisma } from "../../infrastructure/database/prisma.js";

export class TaxRepository {
  static async findJurisdiction(countryId, regionId = null) {
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

  static async saveTaxCalculation({ orderId, countryId, provider, totalTax, lines, response }, tx = null) {
    const db = tx || prisma;
    return db.taxCalculation.create({
      data: {
        orderId,
        countryId,
        provider,
        totalTax,
        response,
        lines: {
          create: lines.map(line => ({
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
