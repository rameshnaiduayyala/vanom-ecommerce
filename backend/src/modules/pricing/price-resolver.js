import { PricingRepository } from "./pricing.repository.js";
import { GeographyRepository } from "../geography/repository.js";
import { Money } from "../../common/utils/money.js";
import { BusinessRuleError, NotFoundError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class PriceResolver {
  /**
   * Resolves authoritative price for a product/variant given commercial context.
   *
   * @param {Object} context
   * @param {string} context.productId
   * @param {string} [context.variantId]
   * @param {number} context.quantity
   * @param {string} [context.countryCode="IN"]
   * @param {string} [context.currencyCode="INR"]
   * @param {Object} [context.user=null]
   * @param {string} [context.companyId=null]
   */
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

    const country = await GeographyRepository.getCountryByCode(countryCode);
    if (!country) {
      throw new NotFoundError(`Country '${countryCode}' not found`);
    }

    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);
    if (!currency) {
      throw new NotFoundError(`Currency '${currencyCode}' not found`);
    }

    // Determine if requester is an approved B2B company
    let isApprovedB2B = false;
    let targetCompanyId = companyId;

    if (!targetCompanyId && user?.companyMembers?.length > 0) {
      const approvedMember = user.companyMembers.find(m => m.company.status === "APPROVED");
      if (approvedMember) {
        targetCompanyId = approvedMember.companyId;
        isApprovedB2B = true;
      }
    } else if (targetCompanyId) {
      const userCompany = user?.companyMembers?.find(m => m.companyId === targetCompanyId);
      if (userCompany && userCompany.company.status === "APPROVED") {
        isApprovedB2B = true;
      }
    }

    // Collect candidate price lists in order of precedence:
    // 1. Company Specific Price List
    // 2. B2B Wholesale Price List (if approved B2B)
    // 3. B2C Retail Price List
    let candidatePriceLists = [];

    if (isApprovedB2B && targetCompanyId) {
      const companyLists = await PricingRepository.findPriceListsForCompany(
        targetCompanyId,
        country.id,
        currency.id
      );
      candidatePriceLists.push(...companyLists);

      const b2bLists = await PricingRepository.findCustomerGroupPriceLists(
        "B2B",
        country.id,
        currency.id
      );
      candidatePriceLists.push(...b2bLists);
    }

    // Always fallback to standard B2C price list if not resolved or for retail customers
    const b2cLists = await PricingRepository.findCustomerGroupPriceLists(
      "B2C",
      country.id,
      currency.id
    );
    candidatePriceLists.push(...b2cLists);

    if (candidatePriceLists.length === 0) {
      throw new NotFoundError(
        `No active price list found for ${countryCode} in ${currencyCode}`,
        ERROR_CODES.PRICE_NOT_FOUND
      );
    }

    const priceListIds = candidatePriceLists.map(pl => pl.id);
    const availablePrices = await PricingRepository.findProductPrices({
      productId,
      variantId,
      priceListIds,
    });

    if (!availablePrices || availablePrices.length === 0) {
      throw new NotFoundError(
        `No pricing configured for product ${productId} in ${countryCode}/${currencyCode}`,
        ERROR_CODES.PRICE_NOT_FOUND
      );
    }

    // Evaluate MOQ and Tier Matching
    let matchedPrice = null;
    let lowestMoq = Infinity;
    let isB2BTierAvailable = false;

    // Check if B2B wholesale pricing is being targeted
    for (const pl of candidatePriceLists) {
      const isB2BList = pl.customerGroupId !== b2cLists[0]?.customerGroupId;
      const listPrices = availablePrices.filter(p => p.priceListId === pl.id);

      if (listPrices.length === 0) continue;

      if (isB2BList) {
        isB2BTierAvailable = true;
        // Track the lowest MOQ for this B2B price list
        const minTier = listPrices.reduce((min, p) => (p.minQuantity < min ? p.minQuantity : min), Infinity);
        if (minTier < lowestMoq) lowestMoq = minTier;
      }

      // Check if requested quantity meets any tier in this price list
      const matchingTier = listPrices.find(
        p => quantity >= p.minQuantity && (p.maxQuantity === null || quantity <= p.maxQuantity)
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

    // If customer is B2B, has B2B tiers configured, but ordered less than the minimum required MOQ
    if (isApprovedB2B && isB2BTierAvailable && !matchedPrice && lowestMoq !== Infinity && quantity < lowestMoq) {
      // In B2B wholesale purchasing mode, reject with MOQ_NOT_MET
      throw new BusinessRuleError(
        `Minimum order quantity (MOQ) of ${lowestMoq} not met for wholesale pricing. Requested: ${quantity}`,
        ERROR_CODES.MOQ_NOT_MET,
        { requiredMoq: lowestMoq, requestedQuantity: quantity }
      );
    }

    // Fallback to retail price tier if no B2B tier matched
    if (!matchedPrice) {
      const retailList = b2cLists[0];
      const retailPrices = availablePrices.filter(p => p.priceListId === retailList?.id);
      const defaultTier = retailPrices.find(
        p => quantity >= p.minQuantity && (p.maxQuantity === null || quantity <= p.maxQuantity)
      ) || retailPrices[0];

      if (!defaultTier) {
        throw new NotFoundError(
          `Unable to resolve unit price for product ${productId}`,
          ERROR_CODES.PRICE_NOT_FOUND
        );
      }

      matchedPrice = {
        price: defaultTier,
        priceList: retailList,
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
