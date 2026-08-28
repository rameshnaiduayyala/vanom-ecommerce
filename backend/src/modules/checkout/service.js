import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { TaxService } from "../tax/routes.js";
import { GeographyRepository } from "../geography/repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import { CartRepository } from "../cart/repository.js";
import { OrderRepository } from "../orders/repository.js";
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

export class CheckoutService {
  constructor(
    taxService = new TaxService(),
    notificationService = new NotificationService()
  ) {
    this.taxService = taxService;
    this.notificationService = notificationService;
  }

  /**
   * Authoritative validation & recalculation of commercial total.
   * Browser-submitted amounts are strictly ignored.
   */
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
      // If no direct items provided, load from active cart
      const cart = await CartRepository.findActiveCart(user.id, companyId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BusinessRuleError("Cart is empty", ERROR_CODES.CART_EMPTY);
      }
      items = cart.items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    }

    const country = await GeographyRepository.getCountryByCode(countryCode);
    const currency = await GeographyRepository.getCurrencyByCode(currencyCode);

    let subtotal = Money.toDecimal(0);
    const validatedItems = [];
    const stockReservations = [];

    // 1. Authoritative Price Resolution, MOQ & Inventory Check per item
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
          packaging: { include: { unit: true, type: true, pallet: true } },
        },
      });

      if (!variant || variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
        throw new NotFoundError(`Variant ${item.variantId} is inactive or not found`, ERROR_CODES.VARIANT_NOT_FOUND);
      }

      // Check stock availability
      const stock = await InventoryRepository.getAvailableStock(variant.id);
      if (stock.available < item.quantity) {
        throw new BusinessRuleError(
          `Insufficient stock for '${variant.name}'. Available: ${stock.available}, Requested: ${item.quantity}`,
          ERROR_CODES.INSUFFICIENT_STOCK
        );
      }

      // Find primary warehouse with stock
      const warehouseItem = await prisma.inventoryItem.findFirst({
        where: {
          variantId: variant.id,
          onHand: { gte: item.quantity },
        },
      });
      const warehouseId = warehouseItem?.warehouseId || (await prisma.warehouse.findFirst())?.id;

      stockReservations.push({
        warehouseId,
        variantId: variant.id,
        quantity: item.quantity,
      });

      // Authoritative Price Resolution
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

    // 2. Shipping calculation
    let shippingAmount = Money.toDecimal(0);
    if (fulfillmentType === "EXPRESS") {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(150) : Money.toDecimal(25);
    } else if (fulfillmentType === "FREIGHT" || fulfillmentType === "PALLET" || fulfillmentType === "TRUCKLOAD") {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(1500) : Money.toDecimal(200);
    } else if (Money.isLessThan(subtotal, countryCode === "IN" ? 1000 : 50)) {
      shippingAmount = countryCode === "IN" ? Money.toDecimal(70) : Money.toDecimal(10);
    }

    // 3. Tax Calculation
    const taxResult = await this.taxService.calculateTax({
      countryCode,
      regionCode: shippingAddress?.state || null,
      items: validatedItems,
      customerType: user.customerType || "B2C",
      isB2BApproved: Boolean(companyId),
    });

    const taxAmount = Money.toDecimal(taxResult.totalTax);

    // Apply item tax distribution
    taxResult.taxLines.forEach((line, index) => {
      if (validatedItems[index]) {
        validatedItems[index].taxAmount = line.taxAmount;
        validatedItems[index].taxRateSnapshot = line.rate;
        validatedItems[index].totalAmount = Money.add(validatedItems[index].subtotal, line.taxAmount);
      }
    });

    // 4. Discounts / Coupons
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

    // 5. Final Authoritative Total
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
      stockReservations,
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
      company: user.companyMembers?.find(m => m.companyId === checkoutPayload.companyId)?.company || null,
    };

    const order = await prisma.$transaction(async tx => {
      const createdOrder = await OrderRepository.createOrderWithTransaction(
        {
          orderData: {
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
          },
          itemsData: calculation.items.map(item => ({
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
          reservationsData: calculation.stockReservations,
          taxCalculationData: calculation.taxCalculation,
          outboxEventData: {
            eventType: "ORDER_CREATED",
          },
        },
        tx
      );

      // Clear the user's active cart upon successful order creation
      const activeCart = await CartRepository.findActiveCart(user.id, checkoutPayload.companyId);
      if (activeCart) {
        await CartRepository.clearCart(activeCart.id);
      }

      return createdOrder;
    });

    // Save response into PostgreSQL idempotency key record if key provided
    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, 201, { success: true, data: order }, order.id);
    }

    // Send confirmation notification
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
