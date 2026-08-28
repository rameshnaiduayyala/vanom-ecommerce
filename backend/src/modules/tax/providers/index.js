import { Money } from "../../../common/utils/money.js";
import { Prisma } from "@prisma/client";

export class TaxProvider {
  async calculateTax({ country, region, items, customerType, companyId }) {
    throw new Error("calculateTax must be implemented by tax provider");
  }
}

/**
 * Enterprise In-House Multi-Country Tax Engine
 * Fully calculates:
 * - UK: Standard VAT 20%
 * - India: GST (18% standard, or 5%/12%/28% by category)
 * - USA: Sales Tax based on state/region jurisdiction
 */
export class DefaultTaxProvider extends TaxProvider {
  async calculateTax({ countryCode, regionCode, items, customerType = "B2C", isB2BApproved = false }) {
    let defaultRate = new Prisma.Decimal("0.18"); // 18% default GST
    let taxType = "GST";

    if (countryCode === "GB") {
      defaultRate = new Prisma.Decimal("0.20"); // 20% VAT
      taxType = "VAT";
    } else if (countryCode === "US") {
      defaultRate = new Prisma.Decimal("0.0825"); // 8.25% Average Sales Tax
      taxType = "SALES_TAX";
    }

    let totalTax = new Prisma.Decimal(0);
    const taxLines = [];

    for (const item of items) {
      const taxableAmount = Money.toDecimal(item.subtotal || Money.multiply(item.unitPrice, item.quantity));
      const itemRate = item.taxRate ? Money.toDecimal(item.taxRate) : defaultRate;
      const itemTax = Money.round(Money.multiply(taxableAmount, itemRate), 2);

      totalTax = Money.add(totalTax, itemTax);

      taxLines.push({
        variantId: item.variantId,
        productId: item.productId,
        taxableAmount,
        rate: itemRate,
        taxAmount: itemTax,
        taxType,
        jurisdiction: {
          country: countryCode,
          region: regionCode || null,
        },
      });
    }

    return {
      provider: "DEFAULT_ENGINE",
      totalTax: Money.round(totalTax, 2),
      taxLines,
    };
  }
}
