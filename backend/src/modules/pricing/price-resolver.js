import { prisma } from "../../infrastructure/database/prisma.js";
import { Money } from "../../common/utils/money.js";
import { BusinessRuleError, NotFoundError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class PriceResolver {
  static async resolvePrice({
    productId,
    variantId = null,
    quantity = 1,
    countryCode = "US",
    currencyCode = "USD",
    user = null,
    businessId = null,
    companyId = null,
  }) {
    if (quantity <= 0) {
      throw new BusinessRuleError("Quantity must be greater than zero", ERROR_CODES.INVALID_QUANTITY);
    }

    const normCurrency = ["CAD", "USD"].includes(currencyCode?.toUpperCase())
      ? currencyCode.toUpperCase()
      : (countryCode?.toUpperCase() === "CA" ? "CAD" : "USD");

    let targetBusinessId = businessId || companyId;
    let isApprovedB2B = false;

    if (!targetBusinessId && user?.businessMemberships?.length > 0) {
      const approvedMember = user.businessMemberships.find((m) => m.business?.status === "APPROVED");
      if (approvedMember) {
        targetBusinessId = approvedMember.businessId;
        isApprovedB2B = true;
      }
    } else if (targetBusinessId) {
      const userBiz = user?.businessMemberships?.find((m) => m.businessId === targetBusinessId);
      if (userBiz && userBiz.business?.status === "APPROVED") {
        isApprovedB2B = true;
      }
    }

    // 1. Resolve variant ID if not explicitly provided
    let targetVariantId = variantId;
    let targetProductId = productId;

    if (!targetVariantId && targetProductId) {
      const variant = await prisma.productVariant.findFirst({
        where: { productId: targetProductId, status: "ACTIVE" },
      });
      targetVariantId = variant?.id;
    } else if (targetVariantId && !targetProductId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: targetVariantId },
      });
      targetProductId = variant?.productId;
    }

    if (!targetVariantId) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { status: "ACTIVE" },
      });
      targetVariantId = firstVariant?.id;
      targetProductId = firstVariant?.productId;
    }

    // 2. Check for Agreed B2B Customer Price
    if (isApprovedB2B && targetBusinessId && targetVariantId) {
      const customPrice = await prisma.b2BCustomerPrice.findFirst({
        where: {
          businessId: targetBusinessId,
          variantId: targetVariantId,
          currency: normCurrency,
          active: true,
        },
      });

      if (customPrice) {
        const unitPrice = Money.toDecimal(customPrice.unitPrice);
        const subtotal = Money.multiply(unitPrice, quantity);
        return {
          productId: targetProductId,
          variantId: targetVariantId,
          quantity,
          unitPrice,
          subtotal,
          currency: normCurrency,
          isB2B: true,
          pricingType: "B2B_CUSTOM",
        };
      }
    }

    // 3. Check for B2B Listing & Tiers
    if (isApprovedB2B && targetProductId && targetVariantId) {
      const b2bListing = await prisma.b2BProductListing.findFirst({
        where: {
          productId: targetProductId,
          OR: [{ businessId: targetBusinessId }, { businessId: null }],
          status: "ACTIVE",
        },
        include: {
          prices: { where: { variantId: targetVariantId, currency: normCurrency, status: "ACTIVE" } },
          tiers: { orderBy: { minQuantity: "desc" } },
        },
      });

      if (b2bListing && b2bListing.prices?.length > 0) {
        const baseB2BPrice = b2bListing.prices[0];
        let unitPrice = Money.toDecimal(baseB2BPrice.unitPrice);

        // Check MOQ
        if (b2bListing.moq && quantity < b2bListing.moq) {
          throw new BusinessRuleError(
            `Minimum order quantity (MOQ) of ${b2bListing.moq} not met for wholesale pricing. Requested: ${quantity}`,
            ERROR_CODES.MOQ_NOT_MET,
            { requiredMoq: b2bListing.moq, requestedQuantity: quantity }
          );
        }

        // Apply matching tiered volume discount
        if (b2bListing.tiers && b2bListing.tiers.length > 0) {
          const matchedTier = b2bListing.tiers.find(
            (t) => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
          );

          if (matchedTier) {
            if (matchedTier.discountType === "PERCENTAGE") {
              const discountMultiplier = 1 - Number(matchedTier.discountValue);
              unitPrice = Money.multiply(unitPrice, discountMultiplier);
            } else if (matchedTier.discountType === "FIXED") {
              unitPrice = Money.subtract(unitPrice, matchedTier.discountValue);
            }
          }
        }

        const subtotal = Money.multiply(unitPrice, quantity);
        return {
          productId: targetProductId,
          variantId: targetVariantId,
          quantity,
          unitPrice,
          subtotal,
          currency: normCurrency,
          isB2B: true,
          moq: b2bListing.moq,
          pricingType: "B2B_TIERED",
        };
      }
    }

    // 4. Standard B2C Retail Price
    const b2cPrice = await prisma.b2CPrice.findFirst({
      where: {
        variantId: targetVariantId,
        currency: normCurrency,
        status: "ACTIVE",
      },
    });

    if (b2cPrice) {
      const unitPrice = Money.toDecimal(b2cPrice.price);
      const subtotal = Money.multiply(unitPrice, quantity);
      return {
        productId: targetProductId,
        variantId: targetVariantId,
        quantity,
        unitPrice,
        subtotal,
        compareAt: b2cPrice.compareAt ? Money.toDecimal(b2cPrice.compareAt) : null,
        currency: normCurrency,
        isB2B: false,
        pricingType: "B2C_RETAIL",
      };
    }

    // Fallback: search any active B2C price
    const fallbackB2C = await prisma.b2CPrice.findFirst({
      where: { variantId: targetVariantId, status: "ACTIVE" },
    });

    if (fallbackB2C) {
      const unitPrice = Money.toDecimal(fallbackB2C.price);
      const subtotal = Money.multiply(unitPrice, quantity);
      return {
        productId: targetProductId,
        variantId: targetVariantId,
        quantity,
        unitPrice,
        subtotal,
        currency: fallbackB2C.currency,
        isB2B: false,
        pricingType: "B2C_FALLBACK",
      };
    }

    throw new NotFoundError(
      `No pricing configured for product ${targetProductId} in ${normCurrency}`,
      ERROR_CODES.PRICE_NOT_FOUND
    );
  }
}
