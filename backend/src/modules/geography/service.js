import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * GeographyService
 * Direct Prisma queries for Countries, Currencies, Regions, and Exchange Rates
 */
export class GeographyService {
  async getCountries() {
    return prisma.country.findMany({
      where: { active: true },
      include: {
        currency: true,
        regions: { where: { active: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  async getCountry(identifier) {
    let country = null;
    if (identifier.length === 2) {
      country = await prisma.country.findUnique({
        where: { code: identifier.toUpperCase() },
        include: {
          currency: true,
          regions: true,
          defaultTax: true,
        },
      });
    } else {
      country = await prisma.country.findUnique({
        where: { id: identifier },
        include: {
          currency: true,
          regions: true,
          defaultTax: true,
        },
      });
    }
    if (!country) {
      throw new NotFoundError(`Country '${identifier}' not found`);
    }
    return country;
  }

  async getCurrencies() {
    return prisma.currency.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
  }

  async getCountryByCode(code) {
    return prisma.country.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        currency: true,
        regions: true,
        defaultTax: true,
      },
    });
  }

  async getCurrencyByCode(code) {
    return prisma.currency.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async getExchangeRate(fromCountryId, toCountryId) {
    if (fromCountryId === toCountryId) return 1.0;
    return prisma.exchangeRate.findFirst({
      where: {
        fromCountryId,
        toCountryId,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      orderBy: { effectiveFrom: "desc" },
    });
  }
}
