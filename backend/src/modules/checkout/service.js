import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { TaxService } from "../tax/service.js";
import { NotificationService } from "../notifications/service.js";
import { InventoryService } from "../inventory/service.js";
import { Money } from "../../common/utils/money.js";
import { IdGenerator } from "../../common/utils/id-generator.js";
import { saveIdempotentResponse } from "../../plugins/idempotency.plugin.js";
import {
  BadRequestError,
  BusinessRuleError,
  NotFoundError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * CheckoutService
 * Direct Prisma queries, authoritative commercial validation, tax recalculation, and atomic order placement
 */
export class CheckoutService {
  constructor(
    taxService = new TaxService(),
    notificationService = new NotificationService(),
    inventoryService = new InventoryService()
  ) {
    this.taxService = taxService;
    this.notificationService = notificationService;
    this.inventoryService = inventoryService;
  }

  async validateCheckout(user, {
    items = [],
    businessId = null,
    companyId = null,
    countryCode = "US",
    currencyCode = "USD",
    shippingAddress,
    billingAddress,
    couponCode = null,
    fulfillmentType = "STANDARD",
  }) {
    const finalBusinessId = businessId || companyId;
    if (!items || items.length === 0) {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: user.id,
          businessId: finalBusinessId || null,
          status: "ACTIVE",
        },
        include: { items: true },
      });
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BusinessRuleError("Cart is empty", ERROR_CODES.CART_EMPTY);
      }
      items = cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    }

    let country = await prisma.country.findUnique({ where: { code: countryCode.toUpperCase() } });
    if (!country) country = await prisma.country.findFirst({ where: { active: true } }) || await prisma.country.findFirst();

    const normCurrency = ["CAD", "USD"].includes(currencyCode?.toUpperCase())
      ? currencyCode.toUpperCase()
      : (country?.currency || "USD");

    let subtotal = Money.toDecimal(0);
    const validatedItems = [];

    for (const item of items) {
      let variant = null;
      if (item.variantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: true,
            packaging: true,
          },
        });
      }
      if (!variant && (item.productId || item.id)) {
        const targetId = item.productId || item.id;
        variant = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { id: targetId },
              { productId: targetId },
            ],
          },
          include: {
            product: true,
            packaging: true,
          },
        });
      }
      if (!variant) {
        variant = await prisma.productVariant.findFirst({
          where: { status: "ACTIVE" },
          include: {
            product: true,
            packaging: true,
          },
        });
      }

      if (!variant || variant.status !== "ACTIVE" || variant.product?.status !== "ACTIVE") {
        throw new NotFoundError(`Product item is inactive or not found`, ERROR_CODES.VARIANT_NOT_FOUND);
      }

      const priceResult = await PriceResolver.resolvePrice({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        countryCode: country.code,
        currencyCode: normCurrency,
        user,
        businessId: finalBusinessId,
      });

      const itemSubtotal = Money.round(Money.multiply(priceResult.unitPrice, item.quantity), 2);
      subtotal = Money.add(subtotal, itemSubtotal);

      validatedItems.push({
        productId: variant.productId,
        variantId: variant.id,
        productNameSnapshot: variant.product.name,
        skuSnapshot: variant.sku,
        quantity: item.quantity,
        unitPrice: priceResult.unitPrice,
        subtotal: itemSubtotal,
        discountAmount: Money.toDecimal(0),
        taxAmount: Money.toDecimal(0),
        totalAmount: itemSubtotal,
        currency: normCurrency,
        packagingSnapshot: variant.packaging || [],
        isB2B: priceResult.isB2B,
      });
    }

    let shippingAmount = Money.toDecimal(0);
    if (fulfillmentType === "EXPRESS") {
      shippingAmount = Money.toDecimal(25);
    } else if (fulfillmentType === "FREIGHT" || fulfillmentType === "PALLET" || fulfillmentType === "TRUCKLOAD") {
      shippingAmount = Money.toDecimal(200);
    } else if (Money.isLessThan(subtotal, 50)) {
      shippingAmount = Money.toDecimal(10);
    }

    const taxResult = await this.taxService.calculateTax({
      countryCode: country.code,
      regionCode: shippingAddress?.state || shippingAddress?.stateCode || null,
      postalCode: shippingAddress?.postalCode || shippingAddress?.zip || null,
      address: shippingAddress,
      items: validatedItems,
      customerType: user.customerType || "B2C",
      isB2BApproved: Boolean(finalBusinessId),
    });

    const taxAmount = Money.toDecimal(taxResult.totalTax || 0);

    taxResult.taxLines?.forEach((line, index) => {
      if (validatedItems[index]) {
        validatedItems[index].taxAmount = line.taxAmount;
        validatedItems[index].taxRateSnapshot = line.rate;
        validatedItems[index].totalAmount = Money.add(validatedItems[index].subtotal, line.taxAmount);
      }
    });

    let discountAmount = Money.toDecimal(0);
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon && coupon.status === "ACTIVE") {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = Money.round(Money.percentage(subtotal, coupon.discountValue), 2);
        } else {
          discountAmount = Money.min(subtotal, Money.toDecimal(coupon.discountValue));
        }
        if (coupon.maxDiscount) {
          discountAmount = Money.min(discountAmount, Money.toDecimal(coupon.maxDiscount));
        }
      }
    }

    const totalAmount = Money.round(
      Money.add(Money.subtract(subtotal, discountAmount), Money.add(shippingAmount, taxAmount)),
      2
    );

    return {
      country,
      currency: normCurrency,
      subtotal: Money.round(subtotal, 2),
      discountAmount: Money.round(discountAmount, 2),
      shippingAmount: Money.round(shippingAmount, 2),
      taxAmount: Money.round(taxAmount, 2),
      totalAmount,
      items: validatedItems,
      taxCalculation: taxResult,
      shippingAddress: shippingAddress || {},
      billingAddress: billingAddress || shippingAddress || {},
      fulfillmentType,
    };
  }

  async placeOrder(user, checkoutPayload, idempotencyKey = null) {
    const calculation = await this.validateCheckout(user, checkoutPayload);
    const orderNumber = IdGenerator.generateOrderNumber();

    const finalBusinessId = checkoutPayload.businessId || checkoutPayload.companyId || null;
    const customerSnapshot = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      customerType: user.customerType,
      business: user.businessMemberships?.find((m) => m.businessId === finalBusinessId)?.business || null,
    };

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          businessId: finalBusinessId,
          customerType: user.customerType || "B2C",
          channel: finalBusinessId ? "B2B" : "B2C",
          source: finalBusinessId ? "B2B_PORTAL" : "WEB",
          status: "PENDING_PAYMENT",
          countryId: calculation.country.id,
          currency: calculation.currency,
          subtotal: calculation.subtotal,
          discountAmount: calculation.discountAmount,
          shippingAmount: calculation.shippingAmount,
          taxAmount: calculation.taxAmount,
          totalAmount: calculation.totalAmount,
          billingAddress: calculation.billingAddress,
          shippingAddress: calculation.shippingAddress,
          customerSnapshot,
          notes: checkoutPayload.notes || null,
          placedAt: new Date(),
          items: {
            create: calculation.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              skuSnapshot: item.skuSnapshot,
              productNameSnapshot: item.productNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              discountAmount: item.discountAmount,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount,
              currency: calculation.currency,
              taxRateSnapshot: item.taxRateSnapshot || 0,
              packagingSnapshot: item.packagingSnapshot,
            })),
          },
          statusHistory: {
            create: {
              toStatus: "PENDING_PAYMENT",
              reason: "Initial order placement",
            },
          },
        },
        include: {
          items: true,
          country: true,
          business: true,
        },
      });

      // Reserve inventory for each item
      for (const item of calculation.items) {
        if (item.variantId) {
          await this.inventoryService.reserveStock(
            {
              variantId: item.variantId,
              quantity: item.quantity,
              orderId: createdOrder.id,
            },
            tx
          );
        }
      }

      const activeCart = await tx.cart.findFirst({
        where: {
          userId: user.id,
          businessId: finalBusinessId,
          status: "ACTIVE",
        },
      });
      if (activeCart) {
        await tx.cartItem.deleteMany({ where: { cartId: activeCart.id } });
      }

      return createdOrder;
    });

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 201, { success: true, data: order }, user.id);
    }

    await this.notificationService.sendNotification({
      userId: user.id,
      channel: "EMAIL",
      title: `Order Confirmation - ${order.orderNumber}`,
      body: `Thank you for your order! Your order ${order.orderNumber} for total ${calculation.currency} ${order.totalAmount} has been placed.`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });

    return order;
  }
}
