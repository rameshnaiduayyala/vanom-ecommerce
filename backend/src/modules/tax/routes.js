import { prisma } from "../../infrastructure/database/prisma.js";
import { DefaultTaxProvider } from "./providers/index.js";
import { GeographyRepository } from "../geography/repository.js";
import { NotFoundError } from "../../common/errors/index.js";

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

export class TaxService {
  constructor(taxProvider = new DefaultTaxProvider()) {
    this.taxProvider = taxProvider;
  }

  async calculateTax({ countryCode = "IN", regionCode = null, items = [], customerType = "B2C", isB2BApproved = false }) {
    const country = await GeographyRepository.getCountryByCode(countryCode);
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
}

export default async function taxRoutes(fastify, options) {
  const service = new TaxService();

  fastify.post("/tax/calculate", {
    preHandler: [fastify.optionalAuthenticate],
    handler: async (request, reply) => {
      const { countryCode, regionCode, items } = request.body || {};
      const result = await service.calculateTax({
        countryCode: countryCode || "IN",
        regionCode,
        items: items || [],
        customerType: request.user?.customerType || "B2C",
      });
      return reply.send({ success: true, data: result });
    },
  });
}
