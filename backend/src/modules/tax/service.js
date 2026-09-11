import { TaxEngineFactory } from "./providers/factory.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * Enterprise TaxService
 * Multi-jurisdiction Tax Engine with support for Third-Party Avalara AvaTax & Stripe Tax,
 * covering USA (State + County sales tax), Canada (GST/PST/HST), UK VAT, and India GST.
 */
export class TaxService {
  constructor(taxProvider = null) {
    this.taxProvider = taxProvider || TaxEngineFactory.getProvider();
  }

  async calculateTax({
    countryCode = "US",
    regionCode = null,
    postalCode = null,
    address = null,
    items = [],
    customerType = "B2C",
    isB2BApproved = false,
    taxExemptionNo = null,
    provider = null,
  }) {
    const country = await prisma.country.findFirst({
      where: {
        OR: [{ code: countryCode.toUpperCase() }, { id: countryCode }],
      },
    });

    const activeProvider = provider
      ? TaxEngineFactory.getProvider(provider)
      : this.taxProvider;

    return activeProvider.calculateTax({
      countryCode: country?.code || countryCode.toUpperCase(),
      regionCode,
      postalCode,
      address,
      items,
      customerType,
      isB2BApproved,
      taxExemptionNo,
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
        response: response || {},
        lines: {
          create: (lines || []).map((line) => ({
            orderItemId: line.orderItemId,
            taxRateId: line.taxRateId || null,
            taxableAmount: line.taxableAmount,
            rate: line.rate,
            taxAmount: line.taxAmount,
            taxType: line.taxType,
            jurisdictionSnapshot: line.jurisdictionSnapshot || line.jurisdiction || {},
          })),
        },
      },
      include: { lines: true },
    });
  }
}
