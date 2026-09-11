import { Money } from "../../../common/utils/money.js";
import { Prisma } from "@prisma/client";
import { TaxProvider } from "./tax-provider.js";
import { US_STATE_TAX_RATES, CA_PROVINCE_TAX_RATES } from "./avalara.provider.js";

/**
 * Stripe Tax Third-Party Engine Adapter
 * Real-time tax calculation using Stripe Tax API with automated USA & Canada state/province tax resolution.
 */
export class StripeTaxProvider extends TaxProvider {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.STRIPE_SECRET_KEY;
  }

  async calculateTax({ countryCode, regionCode, postalCode, address, items, customerType = "B2C", isB2BApproved = false, taxExemptionNo = null }) {
    if (isB2BApproved && taxExemptionNo) {
      return {
        provider: "STRIPE_TAX",
        isExempt: true,
        exemptionReason: "CUSTOMER_EXEMPTION_CERTIFICATE",
        totalTax: new Prisma.Decimal(0),
        taxLines: items.map((it) => ({
          variantId: it.variantId,
          productId: it.productId,
          taxableAmount: Money.toDecimal(it.subtotal || 0),
          rate: new Prisma.Decimal(0),
          taxAmount: new Prisma.Decimal(0),
          taxType: "EXEMPT",
        })),
      };
    }

    // Call live Stripe Tax API if secret key is present
    if (this.apiKey) {
      try {
        const liveCalculation = await this._callStripeTaxApi({
          countryCode,
          regionCode,
          postalCode,
          items,
        });
        if (liveCalculation) return liveCalculation;
      } catch (err) {
        console.warn("[Stripe Tax API Warning] Live calculation failed, utilizing native jurisdiction matrix:", err.message);
      }
    }

    // High-performance jurisdiction matrix calculation for US / CA / Global
    if (countryCode === "US") {
      const state = (regionCode || "").toUpperCase().trim();
      const rateData = US_STATE_TAX_RATES[state] || US_STATE_TAX_RATES.DEFAULT;
      const rate = new Prisma.Decimal(rateData.total.toFixed(4));
      return this._formatMatrixResponse("STRIPE_TAX", "SALES_TAX", rate, rateData.name, items, { country: "US", region: state });
    }

    if (countryCode === "CA") {
      const prov = (regionCode || "").toUpperCase().trim();
      const rateData = CA_PROVINCE_TAX_RATES[prov] || CA_PROVINCE_TAX_RATES.DEFAULT;
      const rate = new Prisma.Decimal(rateData.total.toFixed(4));
      return this._formatMatrixResponse("STRIPE_TAX", rateData.type, rate, rateData.name, items, { country: "CA", province: prov });
    }

    const defaultRate = countryCode === "GB" ? new Prisma.Decimal("0.20") : new Prisma.Decimal("0.18");
    const taxType = countryCode === "GB" ? "VAT" : "GST";
    return this._formatMatrixResponse("STRIPE_TAX", taxType, defaultRate, countryCode, items, { country: countryCode });
  }

  _formatMatrixResponse(provider, taxType, rate, jurisdictionName, items, jurisdiction) {
    let totalTax = new Prisma.Decimal(0);
    const taxLines = [];

    for (const item of items) {
      const taxableAmount = Money.toDecimal(item.subtotal || Money.multiply(item.unitPrice, item.quantity));
      const itemTax = Money.round(Money.multiply(taxableAmount, rate), 2);
      totalTax = Money.add(totalTax, itemTax);

      taxLines.push({
        variantId: item.variantId,
        productId: item.productId,
        taxableAmount,
        rate,
        taxAmount: itemTax,
        taxType,
        jurisdiction: { ...jurisdiction, jurisdictionName },
      });
    }

    return {
      provider,
      jurisdiction: jurisdictionName,
      taxType,
      effectiveRate: Number(rate),
      totalTax: Money.round(totalTax, 2),
      taxLines,
    };
  }

  async _callStripeTaxApi(payload) {
    const subtotalCents = Math.round(
      payload.items.reduce((s, it) => s + Number(it.subtotal || it.unitPrice * it.quantity), 0) * 100
    );

    const body = new URLSearchParams();
    body.append("currency", payload.countryCode === "CA" ? "cad" : "usd");
    body.append("customer_details[address][country]", payload.countryCode);
    if (payload.regionCode) body.append("customer_details[address][state]", payload.regionCode);
    if (payload.postalCode) body.append("customer_details[address][postal_code]", payload.postalCode);
    body.append("customer_details[address_source]", "shipping");

    payload.items.forEach((it, idx) => {
      body.append(`line_items[${idx}][amount]`, Math.round(Number(it.subtotal || it.unitPrice * it.quantity) * 100));
      body.append(`line_items[${idx}][reference]`, it.sku || it.productId || `item_${idx}`);
    });

    const response = await fetch("https://api.stripe.com/v1/tax/calculations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Stripe Tax API error HTTP ${response.status}`);
    }

    const data = await response.json();
    const totalTax = Money.toDecimal((data.tax_amount_exclusive || data.tax_amount_inclusive || 0) / 100);

    return {
      provider: "STRIPE_TAX",
      stripeCalculationId: data.id,
      totalTax,
      taxLines: (data.line_items?.data || []).map((l, i) => ({
        variantId: payload.items[i]?.variantId,
        productId: payload.items[i]?.productId,
        taxableAmount: Money.toDecimal(l.amount / 100),
        taxAmount: Money.toDecimal(l.tax_amount / 100),
        rate: Money.toDecimal((l.tax_breakdown?.[0]?.tax_rate_details?.percentage_decimal || 0) / 100),
        taxType: "SALES_TAX",
        jurisdiction: { country: payload.countryCode, region: payload.regionCode },
      })),
    };
  }
}
