import { Money } from "../../../common/utils/money.js";
import { Prisma } from "@prisma/client";
import { TaxProvider } from "./tax-provider.js";

/**
 * US State Sales Tax Rates (State + Average County/City Local Surcharge)
 */
export const US_STATE_TAX_RATES = {
  CA: { stateRate: 0.0725, localAvg: 0.0157, total: 0.0882, name: "California" },
  NY: { stateRate: 0.0400, localAvg: 0.0452, total: 0.0852, name: "New York" },
  TX: { stateRate: 0.0625, localAvg: 0.0195, total: 0.0820, name: "Texas" },
  FL: { stateRate: 0.0600, localAvg: 0.0102, total: 0.0702, name: "Florida" },
  IL: { stateRate: 0.0625, localAvg: 0.0256, total: 0.0881, name: "Illinois" },
  WA: { stateRate: 0.0650, localAvg: 0.0279, total: 0.0929, name: "Washington" },
  PA: { stateRate: 0.0600, localAvg: 0.0034, total: 0.0634, name: "Pennsylvania" },
  OH: { stateRate: 0.0575, localAvg: 0.0149, total: 0.0724, name: "Ohio" },
  GA: { stateRate: 0.0400, localAvg: 0.0335, total: 0.0735, name: "Georgia" },
  NC: { stateRate: 0.0475, localAvg: 0.0225, total: 0.0700, name: "North Carolina" },
  NJ: { stateRate: 0.06625, localAvg: 0.000, total: 0.06625, name: "New Jersey" },
  VA: { stateRate: 0.0530, localAvg: 0.0045, total: 0.0575, name: "Virginia" },
  OR: { stateRate: 0.0000, localAvg: 0.0000, total: 0.0000, name: "Oregon (Zero Tax)" },
  NH: { stateRate: 0.0000, localAvg: 0.0000, total: 0.0000, name: "New Hampshire (Zero Tax)" },
  DE: { stateRate: 0.0000, localAvg: 0.0000, total: 0.0000, name: "Delaware (Zero Tax)" },
  MT: { stateRate: 0.0000, localAvg: 0.0000, total: 0.0000, name: "Montana (Zero Tax)" },
  DEFAULT: { stateRate: 0.0625, localAvg: 0.0150, total: 0.0775, name: "United States (Standard Average)" },
};

/**
 * Canadian GST / PST / HST Multi-Jurisdiction Matrix
 */
export const CA_PROVINCE_TAX_RATES = {
  ON: { gst: 0.00, pst: 0.00, hst: 0.13, total: 0.13, type: "HST", name: "Ontario" },
  BC: { gst: 0.05, pst: 0.07, hst: 0.00, total: 0.12, type: "GST+PST", name: "British Columbia" },
  AB: { gst: 0.05, pst: 0.00, hst: 0.00, total: 0.05, type: "GST Only", name: "Alberta" },
  QC: { gst: 0.05, pst: 0.09975, hst: 0.00, total: 0.14975, type: "GST+QST", name: "Quebec" },
  NS: { gst: 0.00, pst: 0.00, hst: 0.15, total: 0.15, type: "HST", name: "Nova Scotia" },
  NB: { gst: 0.00, pst: 0.00, hst: 0.15, total: 0.15, type: "HST", name: "New Brunswick" },
  MB: { gst: 0.05, pst: 0.07, hst: 0.00, total: 0.12, type: "GST+RST", name: "Manitoba" },
  SK: { gst: 0.05, pst: 0.06, hst: 0.00, total: 0.11, type: "GST+PST", name: "Saskatchewan" },
  NL: { gst: 0.00, pst: 0.00, hst: 0.15, total: 0.15, type: "HST", name: "Newfoundland and Labrador" },
  PE: { gst: 0.00, pst: 0.00, hst: 0.15, total: 0.15, type: "HST", name: "Prince Edward Island" },
  DEFAULT: { gst: 0.05, pst: 0.05, hst: 0.00, total: 0.10, type: "GST+PST", name: "Canada Federal Standard" },
};

/**
 * Avalara AvaTax Third-Party Engine Adapter
 * Integrates Avalara AvaTax REST API (v2) with automated fallback to precise jurisdiction matrices.
 */
export class AvalaraTaxProvider extends TaxProvider {
  constructor(config = {}) {
    super();
    this.accountId = config.accountId || process.env.AVALARA_ACCOUNT_ID;
    this.licenseKey = config.licenseKey || process.env.AVALARA_LICENSE_KEY;
    this.companyCode = config.companyCode || process.env.AVALARA_COMPANY_CODE || "DEFAULT";
    this.environment = config.environment || process.env.AVALARA_ENVIRONMENT || "sandbox"; // sandbox | production
    this.apiUrl = this.environment === "production"
      ? "https://rest.avatax.com/api/v2"
      : "https://sandbox-rest.avatax.com/api/v2";
  }

  async calculateTax({ countryCode, regionCode, postalCode, address, items, customerType = "B2C", isB2BApproved = false, taxExemptionNo = null }) {
    const isUS = countryCode === "US";
    const isCA = countryCode === "CA";

    // 1. Check for valid B2B resale/exemption certificate
    if (isB2BApproved && taxExemptionNo) {
      return this._buildExemptResponse("AVALARA_AVATAX", "B2B_RESALE_EXEMPTION", items, countryCode, regionCode);
    }

    // 2. If Avalara credentials are provided in env, make live external call
    if (this.accountId && this.licenseKey) {
      try {
        const liveResult = await this._callAvaTaxApi({
          countryCode,
          regionCode,
          postalCode,
          address,
          items,
          customerType,
          taxExemptionNo,
        });
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn("[Avalara AvaTax API Warning] Live request failed, using jurisdiction fallback:", err.message);
      }
    }

    // 3. Fallback: Precise state / province tax matrix for USA & Canada
    if (isUS) {
      return this._calculateUSSalesTax(regionCode, items, postalCode);
    }

    if (isCA) {
      return this._calculateCanadaTax(regionCode, items, postalCode);
    }

    // Default global fallback
    return this._calculateGenericTax(countryCode, items);
  }

  _calculateUSSalesTax(stateCode, items, postalCode) {
    const cleanState = (stateCode || "").toUpperCase().trim();
    const rateData = US_STATE_TAX_RATES[cleanState] || US_STATE_TAX_RATES.DEFAULT;
    const effectiveRate = new Prisma.Decimal(rateData.total.toFixed(4));

    let totalTax = new Prisma.Decimal(0);
    const taxLines = [];

    for (const item of items) {
      const taxableAmount = Money.toDecimal(item.subtotal || Money.multiply(item.unitPrice, item.quantity));
      const itemTax = Money.round(Money.multiply(taxableAmount, effectiveRate), 2);
      totalTax = Money.add(totalTax, itemTax);

      taxLines.push({
        variantId: item.variantId,
        productId: item.productId,
        taxableAmount,
        rate: effectiveRate,
        taxAmount: itemTax,
        taxType: "SALES_TAX",
        jurisdiction: {
          country: "US",
          region: cleanState || "DEFAULT",
          jurisdictionName: rateData.name,
          stateRate: rateData.stateRate,
          localRate: rateData.localAvg,
          postalCode: postalCode || null,
        },
      });
    }

    return {
      provider: "AVALARA_AVATAX",
      jurisdiction: rateData.name,
      taxType: "SALES_TAX",
      effectiveRate: rateData.total,
      totalTax: Money.round(totalTax, 2),
      taxLines,
    };
  }

  _calculateCanadaTax(provinceCode, items, postalCode) {
    const cleanProv = (provinceCode || "").toUpperCase().trim();
    const rateData = CA_PROVINCE_TAX_RATES[cleanProv] || CA_PROVINCE_TAX_RATES.DEFAULT;
    const effectiveRate = new Prisma.Decimal(rateData.total.toFixed(4));

    let totalTax = new Prisma.Decimal(0);
    const taxLines = [];

    for (const item of items) {
      const taxableAmount = Money.toDecimal(item.subtotal || Money.multiply(item.unitPrice, item.quantity));
      const itemTax = Money.round(Money.multiply(taxableAmount, effectiveRate), 2);
      totalTax = Money.add(totalTax, itemTax);

      taxLines.push({
        variantId: item.variantId,
        productId: item.productId,
        taxableAmount,
        rate: effectiveRate,
        taxAmount: itemTax,
        taxType: rateData.type,
        jurisdiction: {
          country: "CA",
          province: cleanProv || "DEFAULT",
          jurisdictionName: rateData.name,
          gst: rateData.gst,
          pst: rateData.pst,
          hst: rateData.hst,
          postalCode: postalCode || null,
        },
      });
    }

    return {
      provider: "AVALARA_AVATAX",
      jurisdiction: rateData.name,
      taxType: rateData.type,
      effectiveRate: rateData.total,
      totalTax: Money.round(totalTax, 2),
      taxLines,
    };
  }

  _calculateGenericTax(countryCode, items) {
    const isUK = countryCode === "GB";
    const defaultRate = isUK ? new Prisma.Decimal("0.20") : new Prisma.Decimal("0.18");
    const taxType = isUK ? "VAT" : "GST";

    let totalTax = new Prisma.Decimal(0);
    const taxLines = [];

    for (const item of items) {
      const taxableAmount = Money.toDecimal(item.subtotal || Money.multiply(item.unitPrice, item.quantity));
      const itemTax = Money.round(Money.multiply(taxableAmount, defaultRate), 2);
      totalTax = Money.add(totalTax, itemTax);

      taxLines.push({
        variantId: item.variantId,
        productId: item.productId,
        taxableAmount,
        rate: defaultRate,
        taxAmount: itemTax,
        taxType,
        jurisdiction: { country: countryCode },
      });
    }

    return {
      provider: "AVALARA_AVATAX",
      taxType,
      totalTax: Money.round(totalTax, 2),
      taxLines,
    };
  }

  _buildExemptResponse(provider, reason, items, countryCode, regionCode) {
    const zero = new Prisma.Decimal(0);
    return {
      provider,
      isExempt: true,
      exemptionReason: reason,
      totalTax: zero,
      taxLines: items.map((it) => ({
        variantId: it.variantId,
        productId: it.productId,
        taxableAmount: Money.toDecimal(it.subtotal || 0),
        rate: zero,
        taxAmount: zero,
        taxType: "EXEMPT",
        jurisdiction: { country: countryCode, region: regionCode },
      })),
    };
  }

  async _callAvaTaxApi(payload) {
    const authHeader = "Basic " + Buffer.from(`${this.accountId}:${this.licenseKey}`).toString("base64");
    const response = await fetch(`${this.apiUrl}/transactions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        type: "SalesOrder",
        companyCode: this.companyCode,
        date: new Date().toISOString().split("T")[0],
        customerCode: payload.customerType === "B2B" ? "B2B-CUSTOMER" : "RETAIL-CONSUMER",
        exemptionNo: payload.taxExemptionNo,
        addresses: {
          singleLocation: {
            line1: payload.address?.line1 || "Main St",
            city: payload.address?.city || "New York",
            region: payload.regionCode || "NY",
            country: payload.countryCode || "US",
            postalCode: payload.postalCode || "10001",
          },
        },
        lines: payload.items.map((it, idx) => ({
          number: String(idx + 1),
          quantity: it.quantity || 1,
          amount: Number(it.subtotal || it.unitPrice * it.quantity),
          taxCode: it.taxCode || "P0000000",
          itemCode: it.sku || it.productId,
          description: it.name || "Commercial Good",
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AvaTax API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      provider: "AVALARA_AVATAX",
      transactionCode: data.code,
      totalTax: Money.toDecimal(data.totalTax || 0),
      totalTaxCalculated: data.totalTaxCalculated,
      taxLines: (data.lines || []).map((l, i) => ({
        variantId: payload.items[i]?.variantId,
        productId: payload.items[i]?.productId,
        taxableAmount: Money.toDecimal(l.taxableAmount || l.amount),
        rate: Money.toDecimal(l.rate || 0),
        taxAmount: Money.toDecimal(l.tax || 0),
        taxType: "SALES_TAX",
        jurisdiction: {
          country: payload.countryCode,
          region: payload.regionCode,
        },
      })),
    };
  }
}
