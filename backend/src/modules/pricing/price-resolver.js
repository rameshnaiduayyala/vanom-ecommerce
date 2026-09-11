import { prisma } from "../../infrastructure/database/prisma.js";
import { Money } from "../../common/utils/money.js";
import { BusinessRuleError, NotFoundError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class PriceResolver {
  static async resolvePrice({
    productId,
    variantId = null,
    quantity = 1,
    countryCode = "IN",
    currencyCode = "INR",
    user = null,
    companyId = null,
  }) {
    if (quantity <= 0) {
      throw new BusinessRuleError("Quantity must be greater than zero", ERROR_CODES.INVALID_QUANTITY);
    }

    const country = await prisma.country.findUnique({
      where: { code: countryCode.toUpperCase() },
      include: { currency: true, regions: true, defaultTax: true },
    });
    if (!country) {
      throw new NotFoundError(`Country '${countryCode}' not found`);
    }

    const currency = await prisma.currency.findUnique({
      where: { code: currencyCode.toUpperCase() },
    });
    if (!currency) {
      throw new NotFoundError(`Currency '${currencyCode}' not found`);
    }

    let isApprovedB2B = false;
    let targetCompanyId = companyId;

    if (!targetCompanyId && user?.companyMembers?.length > 0) {
      const approvedMember = user.companyMembers.find((m) => m.company?.status === "APPROVED");
      if (approvedMember) {
        targetCompanyId = approvedMember.companyId;
        isApprovedB2B = true;
      }
    } else if (targetCompanyId) {
      const userCompany = user?.companyMembers?.find((m) => m.companyId === targetCompanyId);
      if (userCompany && userCompany.company?.status === "APPROVED") {
        isApprovedB2B = true;
      }
    }

    let candidatePriceLists = [];

    if (isApprovedB2B && targetCompanyId) {
      const companyLists = await prisma.priceList.findMany({
        where: {
          countryId: country.id,
          currencyId: currency.id,
          status: "ACTIVE",
          companies: {
            some: {
              companyId: targetCompanyId,
            },
          },
        },
        include: {
          companies: { where: { companyId: targetCompanyId } },
          prices: { where: { status: "ACTIVE" } },
        },
        orderBy: { priority: "desc" },
      });
      candidatePriceLists.push(...companyLists);

      const b2bLists = await prisma.priceList.findMany({
        where: {
          countryId: country.id,
          currencyId: currency.id,
          status: "ACTIVE",
          customerGroup: { code: "B2B" },
        },
        include: {
          prices: { where: { status: "ACTIVE" } },
        },
        orderBy: { priority: "desc" },
      });
      candidatePriceLists.push(...b2bLists);
    }

    const b2cLists = await prisma.priceList.findMany({
      where: {
        countryId: country.id,
        currencyId: currency.id,
        status: "ACTIVE",
        customerGroup: { code: "B2C" },
      },
      include: {
        prices: { where: { status: "ACTIVE" } },
      },
      orderBy: { priority: "desc" },
    });
    candidatePriceLists.push(...b2cLists);

    // Fallback: If no price list found for this exact country/currency, fallback to any active B2C price list
    if (candidatePriceLists.length === 0) {
      const fallbackLists = await prisma.priceList.findMany({
        where: {
          status: "ACTIVE",
          customerGroup: { code: "B2C" },
        },
        include: {
          prices: { where: { status: "ACTIVE" } },
        },
        orderBy: { priority: "desc" },
        take: 2,
      });
      candidatePriceLists.push(...fallbackLists);
    }

    if (candidatePriceLists.length === 0) {
      throw new NotFoundError(
        `No active price list found for ${countryCode} in ${currencyCode}`,
        ERROR_CODES.PRICE_NOT_FOUND
      );
    }

    const priceListIds = candidatePriceLists.map((pl) => pl.id);
    let availablePrices = await prisma.productPrice.findMany({
      where: {
        priceListId: { in: priceListIds },
        status: "ACTIVE",
        OR: [
          { variantId: variantId || undefined },
          { productId, variantId: null },
        ],
      },
      orderBy: { minQuantity: "desc" },
    });

    // Fallback: If no price entry found in candidate lists, search any active price entry for this product/variant
    if (!availablePrices || availablePrices.length === 0) {
      availablePrices = await prisma.productPrice.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { variantId: variantId || undefined },
            { productId, variantId: null },
          ],
        },
        orderBy: { minQuantity: "desc" },
      });
    }

    if (!availablePrices || availablePrices.length === 0) {
      throw new NotFoundError(
        `No pricing configured for product ${productId} in ${countryCode}/${currencyCode}`,
        ERROR_CODES.PRICE_NOT_FOUND
      );
    }

    let matchedPrice = null;
    let lowestMoq = Infinity;
    let isB2BTierAvailable = false;

    for (const pl of candidatePriceLists) {
      const isB2BList = pl.customerGroupId !== b2cLists[0]?.customerGroupId;
      const listPrices = availablePrices.filter((p) => p.priceListId === pl.id);

      if (listPrices.length === 0) continue;

      if (isB2BList) {
        isB2BTierAvailable = true;
        const minTier = listPrices.reduce((min, p) => (p.minQuantity < min ? p.minQuantity : min), Infinity);
        if (minTier < lowestMoq) lowestMoq = minTier;
      }

      const matchingTier = listPrices.find(
        (p) => quantity >= p.minQuantity && (p.maxQuantity === null || quantity <= p.maxQuantity)
      );

      if (matchingTier) {
        matchedPrice = {
          price: matchingTier,
          priceList: pl,
          isB2B: isB2BList,
        };
        break;
      }
    }

    if (isApprovedB2B && isB2BTierAvailable && !matchedPrice && lowestMoq !== Infinity && quantity < lowestMoq) {
      throw new BusinessRuleError(
        `Minimum order quantity (MOQ) of ${lowestMoq} not met for wholesale pricing. Requested: ${quantity}`,
        ERROR_CODES.MOQ_NOT_MET,
        { requiredMoq: lowestMoq, requestedQuantity: quantity }
      );
    }

    if (!matchedPrice) {
      const retailList = b2cLists[0] || candidatePriceLists[0];
      const retailPrices = availablePrices.filter((p) => p.priceListId === retailList?.id);
      const defaultTier =
        retailPrices.find((p) => quantity >= p.minQuantity && (p.maxQuantity === null || quantity <= p.maxQuantity)) ||
        retailPrices[0] ||
        availablePrices[0];

      if (!defaultTier) {
        throw new NotFoundError(
          `Unable to resolve unit price for product ${productId}`,
          ERROR_CODES.PRICE_NOT_FOUND
        );
      }

      matchedPrice = {
        price: defaultTier,
        priceList: retailList || { id: defaultTier.priceListId, name: "Standard Price List" },
        isB2B: false,
      };
    }

    const unitPrice = Money.toDecimal(matchedPrice.price.amount);
    const subtotal = Money.multiply(unitPrice, quantity);

    return {
      productId,
      variantId,
      quantity,
      unitPrice,
      subtotal,
      currency: currency.code,
      currencyId: currency.id,
      country: country.code,
      countryId: country.id,
      priceListId: matchedPrice.priceList.id,
      priceListName: matchedPrice.priceList.name,
      isB2B: matchedPrice.isB2B,
      minQuantity: matchedPrice.price.minQuantity,
      maxQuantity: matchedPrice.price.maxQuantity,
    };
  }
}
