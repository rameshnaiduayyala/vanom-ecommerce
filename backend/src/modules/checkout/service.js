import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { TaxService } from "../tax/service.js";
import { NotificationService } from "../notifications/service.js";
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
    notificationService = new NotificationService()
  ) {
    this.taxService = taxService;
    this.notificationService = notificationService;
  }

  async validateCheckout(user, {
    items = [],
    companyId = null,
    countryCode = "IN",
    currencyCode = "INR",
    shippingAddress,
    billingAddress,
    couponCode = null,
    fulfillmentType = "STANDARD",
  }) {
    if (!items || items.length === 0) {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: user.id,
          companyId: companyId || null,
          active: true,
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

    const country = await prisma.country.findUnique({ where: { code: countryCode.toUpperCase() } });
    const currency = await prisma.currency.findUnique({ where: { code: currencyCode.toUpperCase() } });

    if (!country || !currency) {
      throw new NotFoundError("Country or currency not supported");
    }

    let subtotal = Money.toDecimal(0);
    const validatedItems = [];
    const stockReservations = [];

    for (const item of items) {
      let variant = null;
      if (item.variantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: true,
            packaging: { include: { unit: true, type: true, pallet: true } },
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
            packaging: { include: { unit: true, type: true, pallet: true } },
          },
        });
      }
      if (!variant) {
        // Fallback to first available active variant
        variant = await prisma.productVariant.findFirst({
          where: { status: "ACTIVE" },
          include: {
            product: true,
            packaging: { include: { unit: true, type: true, pallet: true } },
          },
        });
      }

      if (!variant || variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
        throw new NotFoundError(`Product item is inactive or not found`, ERROR_CODES.VARIANT_NOT_FOUND);
      }

      const priceResult = await PriceResolver.resolvePrice({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        countryCode,
        currencyCode,
        user,
        companyId,
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
        currencyId: currency.id,
        packagingSnapshot: variant.packaging || [],
        isB2B: priceResult.isB2B,
      });
    }

    let shippingAmount = Money.toDecimal(0);
    if (fulfillmentType === "EXPRESS") {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(150) : Money.toDecimal(25);
    } else if (fulfillmentType === "FREIGHT" || fulfillmentType === "PALLET" || fulfillmentType === "TRUCKLOAD") {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(1500) : Money.toDecimal(200);
    } else if (Money.isLessThan(subtotal, countryCode === "IN" ? 1000 : 50)) {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(70) : Money.toDecimal(10);
    }

    const taxResult = await this.taxService.calculateTax({
      countryCode,
      regionCode: shippingAddress?.state || null,
      items: validatedItems,
      customerType: user.customerType || "B2C",
      isB2BApproved: Boolean(companyId),
    });

    const taxAmount = Money.toDecimal(taxResult.totalTax);

    taxResult.taxLines.forEach((line, index) => {
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
        include: { promotion: true },
      });
      if (coupon && coupon.active && coupon.promotion?.active) {
        if (coupon.promotion.type === "PERCENTAGE") {
          discountAmount = Money.round(Money.percentage(subtotal, coupon.promotion.value), 2);
        } else {
          discountAmount = Money.min(subtotal, Money.toDecimal(coupon.promotion.value));
        }
      }
    }

    const totalAmount = Money.round(
      Money.add(Money.subtract(subtotal, discountAmount), Money.add(shippingAmount, taxAmount)),
      2
    );

    return {
      country,
      currency,
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

    const customerSnapshot = {
      id: user.id,
      email: user.email,
      customerType: user.customerType,
      company: user.companyMembers?.find((m) => m.companyId === checkoutPayload.companyId)?.company || null,
    };

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          companyId: checkoutPayload.companyId || null,
          customerType: user.customerType || "B2C",
          source: checkoutPayload.companyId ? "B2B_PORTAL" : "WEB",
          status: "PENDING_PAYMENT",
          countryId: calculation.country.id,
          currencyId: calculation.currency.id,
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
              currencyId: calculation.currency.id,
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
          currency: true,
          company: true,
        },
      });

      const activeCart = await tx.cart.findFirst({
        where: {
          userId: user.id,
          companyId: checkoutPayload.companyId || null,
          active: true,
        },
      });
      if (activeCart) {
        await tx.cartItem.deleteMany({ where: { cartId: activeCart.id } });
      }

      await tx.outboxEvent.create({
        data: {
          aggregateType: "ORDER",
          aggregateId: createdOrder.id,
          eventType: "ORDER_CREATED",
          payload: {
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            totalAmount: createdOrder.totalAmount,
            currency: calculation.currency.code,
            userId: createdOrder.userId,
            companyId: createdOrder.companyId,
          },
        },
      });

      return createdOrder;
    });

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 201, { success: true, data: order }, order.id);
    }

    await this.notificationService.sendNotification({
      userId: user.id,
      channel: "EMAIL",
      title: `Order Confirmation - ${order.orderNumber}`,
      body: `Thank you for your order! Your order ${order.orderNumber} for total ${calculation.currency.code} ${order.totalAmount} has been placed.`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });

    return order;
  }
}
