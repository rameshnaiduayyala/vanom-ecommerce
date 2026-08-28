import { prisma } from "../../infrastructure/database/prisma.js";
import { CartRepository } from "./repository.js";
import { GeographyRepository } from "../geography/repository.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { InventoryRepository } from "../inventory/repository.js";
import { Money } from "../../common/utils/money.js";
import { BusinessRuleError, NotFoundError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class CartService {
  async getCart(user, companyId = null, countryCode = "IN", currencyCode = "INR") {
    const country = await GeographyRepository.getCountryByCode(countryCode);
    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);

    const cart = await CartRepository.getOrCreateCart({
      userId: user.id,
      companyId,
      countryId: country.id,
      currencyId: currency.id,
    });

    return this._enrichCartWithDynamicPricing(cart, user, country.code, currency.code);
  }

  async addItem(user, { variantId, quantity, companyId, countryCode = "IN", currencyCode = "INR" }) {
    if (!variantId || quantity <= 0) {
      throw new BusinessRuleError("Valid variantId and positive quantity are required", ERROR_CODES.INVALID_QUANTITY);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
      throw new NotFoundError("Product variant is not available", ERROR_CODES.VARIANT_NOT_FOUND);
    }

    const stock = await InventoryRepository.getAvailableStock(variantId);
    if (stock.available < quantity) {
      throw new BusinessRuleError(
        `Requested quantity (${quantity}) exceeds available stock (${stock.available})`,
        ERROR_CODES.INSUFFICIENT_STOCK
      );
    }

    const priceResolution = await PriceResolver.resolvePrice({
      productId: variant.productId,
      variantId: variant.id,
      quantity,
      countryCode,
      currencyCode,
      user,
      companyId,
    });

    const country = await GeographyRepository.getCountryByCode(countryCode);
    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);

    const cart = await CartRepository.getOrCreateCart({
      userId: user.id,
      companyId,
      countryId: country.id,
      currencyId: currency.id,
    });

    await CartRepository.addItem({
      cartId: cart.id,
      variantId,
      quantity,
      unitPrice: priceResolution.unitPrice,
    });

    return this.getCart(user, companyId, countryCode, currencyCode);
  }

  async updateItemQuantity(user, itemId, quantity, countryCode = "IN", currencyCode = "INR") {
    if (quantity < 0) {
      throw new BusinessRuleError("Quantity cannot be negative", ERROR_CODES.INVALID_QUANTITY);
    }
    await CartRepository.updateItemQuantity(itemId, quantity);
    return this.getCart(user, null, countryCode, currencyCode);
  }

  async removeItem(user, itemId, countryCode = "IN", currencyCode = "INR") {
    await CartRepository.removeItem(itemId);
    return this.getCart(user, null, countryCode, currencyCode);
  }

  async clearCart(user, companyId = null) {
    const cart = await CartRepository.findActiveCart(user.id, companyId);
    if (cart) {
      await CartRepository.clearCart(cart.id);
    }
    return { cleared: true };
  }

  async _enrichCartWithDynamicPricing(cart, user, countryCode, currencyCode) {
    let subtotal = Money.toDecimal(0);
    const enrichedItems = [];

    for (const item of cart.items) {
      let resolved = null;
      try {
        resolved = await PriceResolver.resolvePrice({
          productId: item.variant.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          countryCode,
          currencyCode,
          user,
          companyId: cart.companyId,
        });
      } catch (err) {
        resolved = {
          unitPrice: item.unitPrice || Money.toDecimal(0),
          subtotal: Money.multiply(item.unitPrice || 0, item.quantity),
          error: err.message,
        };
      }

      const itemSubtotal = resolved.subtotal || Money.multiply(resolved.unitPrice, item.quantity);
      subtotal = Money.add(subtotal, itemSubtotal);

      enrichedItems.push({
        id: item.id,
        variantId: item.variantId,
        variantName: item.variant.name,
        sku: item.variant.sku,
        productName: item.variant.product.name,
        quantity: item.quantity,
        unitPrice: resolved.unitPrice,
        subtotal: itemSubtotal,
        isB2B: resolved.isB2B || false,
        packaging: item.variant.packaging || [],
      });
    }

    return {
      id: cart.id,
      userId: cart.userId,
      companyId: cart.companyId,
      country: cart.country.code,
      currency: cart.currency.code,
      items: enrichedItems,
      itemCount: enrichedItems.length,
      subtotal: Money.round(subtotal, 2),
    };
  }
}
