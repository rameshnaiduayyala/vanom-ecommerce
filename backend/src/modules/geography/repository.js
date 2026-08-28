import { prisma } from "../../infrastructure/database/prisma.js";

export class GeographyRepository {
  static async listCountries() {
    return prisma.country.findMany({
      where: { active: true },
      include: {
        currency: true,
        regions: { where: { active: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  static async getCountryByCode(code) {
    return prisma.country.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        currency: true,
        regions: true,
        defaultTax: true,
      },
    });
  }

  static async getCountryById(id) {
    return prisma.country.findUnique({
      where: { id },
      include: {
        currency: true,
        regions: true,
        defaultTax: true,
      },
    });
  }

  static async listCurrencies() {
    return prisma.currency.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
    });
  }

  static async getCurrencyByCode(code) {
    return prisma.currency.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  static async getExchangeRate(fromCountryId, toCountryId) {
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
