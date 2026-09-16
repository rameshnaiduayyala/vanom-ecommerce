import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { Money } from "../../common/utils/money.js";
import { BusinessRuleError, NotFoundError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * CartService
 * Handles Cart and CartItem operations directly via Prisma with dynamic pricing & multi-country logic
 */
export class CartService {
  async _getOrCreateCart({ userId, businessId = null, companyId = null, countryId, currency = "USD" }) {
    const finalBusinessId = businessId || companyId;
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        businessId: finalBusinessId || null,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { include: { file: true } },
                    categories: { include: { category: true } },
                  },
                },
                images: { include: { file: true } },
                inventoryItems: true,
                packaging: true,
              },
            },
          },
        },
        country: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          businessId: finalBusinessId,
          countryId,
          currency,
          status: "ACTIVE",
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { include: { file: true } },
                      categories: { include: { category: true } },
                    },
                  },
                  images: { include: { file: true } },
                  inventoryItems: true,
                  packaging: true,
                },
              },
            },
          },
          country: true,
        },
      });
    }

    return cart;
  }

  async getCart(user, businessId = null, countryCode = "US", currencyCode = "USD") {
    let country = await prisma.country.findUnique({ where: { code: countryCode.toUpperCase() } });
    if (!country) {
      country = await prisma.country.findFirst({ where: { active: true } }) || await prisma.country.findFirst();
    }

    const normCurrency = ["CAD", "USD"].includes(currencyCode?.toUpperCase())
      ? currencyCode.toUpperCase()
      : (country?.currency || "USD");

    const cart = await this._getOrCreateCart({
      userId: user.id,
      businessId,
      countryId: country.id,
      currency: normCurrency,
    });

    return this._enrichCartWithDynamicPricing(cart, user, country.code, normCurrency);
  }

  async addItem(user, { variantId, productId, id, quantity = 1, businessId, companyId, countryCode = "US", currencyCode = "USD" }) {
    const targetId = variantId || productId || id;
    if (!targetId || quantity <= 0) {
      throw new BusinessRuleError("Valid product/variant ID and positive quantity are required", ERROR_CODES.INVALID_QUANTITY);
    }

    let variant = await prisma.productVariant.findUnique({
      where: { id: targetId },
      include: { product: true },
    });

    if (!variant) {
      variant = await prisma.productVariant.findFirst({
        where: {
          OR: [{ id: targetId }, { productId: targetId }],
          status: "ACTIVE",
        },
        include: { product: true },
      });
    }

    if (!variant) {
      variant = await prisma.productVariant.findFirst({
        where: { status: "ACTIVE" },
        include: { product: true },
      });
    }

    if (!variant || variant.status !== "ACTIVE" || variant.product?.status !== "ACTIVE") {
      throw new NotFoundError("Product variant is not available", ERROR_CODES.VARIANT_NOT_FOUND);
    }

    const finalBusinessId = businessId || companyId;
    const priceResolution = await PriceResolver.resolvePrice({
      productId: variant.productId,
      variantId: variant.id,
      quantity,
      countryCode,
      currencyCode,
      user,
      businessId: finalBusinessId,
    });

    let country = await prisma.country.findUnique({ where: { code: countryCode.toUpperCase() } });
    if (!country) country = await prisma.country.findFirst();

    const normCurrency = ["CAD", "USD"].includes(currencyCode?.toUpperCase()) ? currencyCode.toUpperCase() : "USD";

    const cart = await this._getOrCreateCart({
      userId: user.id,
      businessId: finalBusinessId,
      countryId: country.id,
      currency: normCurrency,
    });

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: variant.id },
      },
      create: {
        cartId: cart.id,
        variantId: variant.id,
        quantity,
        unitPrice: priceResolution.unitPrice,
        currency: normCurrency,
      },
      update: {
        quantity: { increment: quantity },
        unitPrice: priceResolution.unitPrice,
        currency: normCurrency,
      },
    });

    return this.getCart(user, finalBusinessId, countryCode, normCurrency);
  }

  async updateItemQuantity(user, itemId, quantity, countryCode = "US", currencyCode = "USD") {
    if (quantity < 0) {
      throw new BusinessRuleError("Quantity cannot be negative", ERROR_CODES.INVALID_QUANTITY);
    }
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
    return this.getCart(user, null, countryCode, currencyCode);
  }

  async removeItem(user, itemId, countryCode = "US", currencyCode = "USD") {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(user, null, countryCode, currencyCode);
  }

  async clearCart(user, businessId = null) {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        businessId: businessId || null,
        status: "ACTIVE",
      },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
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
          businessId: cart.businessId,
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

      const catImage = item.variant.product?.categories?.[0]?.category?.imageUrl || "";
      const itemImage =
        item.variant.images?.[0]?.file?.url ||
        item.variant.product?.images?.[0]?.file?.url ||
        catImage ||
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80";

      const hasInv = item.variant.inventoryItems && item.variant.inventoryItems.length > 0;
      const availableStock = hasInv
        ? item.variant.inventoryItems.reduce(
            (sum, inv) => sum + (Number(inv.onHand ?? 0) - Number(inv.reserved ?? 0)),
            0
          )
        : 100;

      enrichedItems.push({
        id: item.id,
        variantId: item.variantId,
        variantName: item.variant.name,
        sku: item.variant.sku,
        productId: item.variant.productId,
        productName: item.variant.product?.name,
        slug: item.variant.product?.slug,
        image: itemImage,
        availableStock: Math.max(0, availableStock),
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
      businessId: cart.businessId,
      companyId: cart.businessId,
      country: cart.country.code,
      currency: cart.currency,
      items: enrichedItems,
      itemCount: enrichedItems.length,
      subtotal: Money.round(subtotal, 2),
    };
  }
}
