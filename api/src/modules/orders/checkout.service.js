import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { calculateStripeTax, createStripePaymentIntent } from "../payments/stripe.service.js";
import { resolveUserOrganization } from "../inventory/organization.service.js";
import { reserveInventory } from "../inventory/inventory.service.js";
import { getShippingRates, saveOrderRateSnapshot } from "../shipping/shipping.service.js";

/**
 * ─── STRIPE CHECKOUT API SERVICE ──────────────────────────────────────────
 * Executes the secure enterprise checkout flow:
 *   Validate customer/cart -> Load products -> Validate prices -> Validate stock
 *   -> Get shipping address -> Calculate Shippo Shipping -> Calculate Stripe Tax
 *   -> Order with PENDING_PAYMENT -> Reserve stock -> Stripe PaymentIntent
 */

export async function processCheckout({
  userId,
  countryId,
  currencyCode,
  shippingAddress,
  billingAddress,
  items: directItems = null,
  shippingCharges = 0,
  shippingRateId = null,
  shippingMethod = null,
  shippingCarrier = null,
  warehouseId = null,
  discount = 0
}) {
  // ── 1. Validate Customer ──────────────────────────────────────────────────
  if (!userId) {
    throw new AppError("Authentication required for checkout", HTTP_STATUS.UNAUTHORIZED, "AUTH_REQUIRED");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true }
  });

  if (!userRecord) {
    throw new AppError("Customer account not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
  }

  // ── 2. Validate & Normalize Shipping Address ──────────────────────────────
  if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.postalCode) {
    throw new AppError(
      MESSAGES.SHIPPING_ADDRESS_REQUIRED || "Complete shipping address is required",
      HTTP_STATUS.BAD_REQUEST,
      "SHIPPING_ADDRESS_REQUIRED"
    );
  }

  // Resolve target country & currency
  const targetCountry = await prisma.country.findFirst({
    where: {
      OR: [
        ...(countryId ? [{ id: countryId }, { code: countryId.toUpperCase() }] : []),
        ...(shippingAddress.countryCode ? [{ code: shippingAddress.countryCode.toUpperCase() }] : [])
      ]
    }
  });

  const resolvedCountryId = targetCountry?.id || countryId;
  const resolvedCountryCode = (targetCountry?.code || shippingAddress.countryCode || "US").toUpperCase();
  const resolvedCurrency = (
    currencyCode ||
    (resolvedCountryCode === "IN" ? "INR" : resolvedCountryCode === "CA" ? "CAD" : "USD")
  ).toUpperCase();

  const billing = billingAddress || shippingAddress;

  const addressPayload = (addr, type) => ({
    type,
    fullName: addr.fullName || `${userRecord.firstName || ""} ${userRecord.lastName || ""}`.trim() || "Customer",
    phone: addr.phone || "+10000000000",
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2 || null,
    city: addr.city || "City",
    state: addr.state || null,
    postalCode: addr.postalCode,
    countryCode: addr.countryCode || resolvedCountryCode
  });

  // ── 3. Validate Cart & Load Products / Prices from Database ───────────────
    // Populate server cart if direct items were sent
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { countries: true } },
            variant: { include: { countries: true } }
          }
        }
      }
    });

    if ((!cart || !cart.items.length) && Array.isArray(directItems) && directItems.length > 0) {
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }
      for (const it of directItems) {
        const pId = it.productId || it.id;
        const vId = it.variantId || null;
        if (!pId) continue;
        const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: pId, variantId: vId } });
        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + (it.quantity || 1) }
          });
        } else {
          await prisma.cartItem.create({
            data: { cartId: cart.id, productId: pId, variantId: vId, quantity: it.quantity || 1 }
          });
        }
      }
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { include: { countries: true } },
              variant: { include: { countries: true } }
            }
          }
        }
      });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError(MESSAGES.CART_EMPTY || "Your cart is empty", HTTP_STATUS.BAD_REQUEST, "CART_EMPTY");
    }

    // ── 4. Validate Prices & Inventory from Database ────────────────────────
    let subtotal = new Prisma.Decimal(0);
    const validatedItems = [];

    for (const item of cart.items) {
      // Re-fetch product from DB to ensure it's still active & valid
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!dbProduct || dbProduct.isActive === false) {
        throw new AppError(
          `Product "${dbProduct?.name || item.productId}" is no longer available`,
          HTTP_STATUS.BAD_REQUEST,
          "PRODUCT_UNAVAILABLE"
        );
      }

      let dbVariant = null;
      if (item.variantId) {
        dbVariant = await prisma.productVariant.findUnique({
          where: { id: item.variantId }
        });
        if (!dbVariant || dbVariant.isActive === false) {
          throw new AppError(
            `Selected product option is no longer available`,
            HTTP_STATUS.BAD_REQUEST,
            "VARIANT_UNAVAILABLE"
          );
        }
      }

      // Validate price against database (country pricing overrides basePrice)
      let unitPrice = null;
      if (dbVariant) {
        const variantCountry = await prisma.productVariantCountry.findUnique({
          where: {
            variantId_countryId: { variantId: dbVariant.id, countryId: resolvedCountryId }
          }
        });
        if (variantCountry?.isAvailable && variantCountry?.price !== null) {
          unitPrice = variantCountry.price;
        }
      }

      if (unitPrice === null) {
        const productCountry = await prisma.productCountry.findUnique({
          where: {
            productId_countryId: { productId: dbProduct.id, countryId: resolvedCountryId }
          }
        });
        if (productCountry?.isAvailable && productCountry?.price !== null) {
          unitPrice = productCountry.price;
        }
      }

      if (unitPrice === null) {
        unitPrice = dbProduct.basePrice || new Prisma.Decimal(0);
      }

      const itemTotal = new Prisma.Decimal(unitPrice).mul(item.quantity);
      subtotal = subtotal.add(itemTotal);

      // Validate inventory availability
      const inventoryRecords = await prisma.inventory.findMany({
        where: {
          ...(dbVariant ? { variantId: dbVariant.id } : { productId: dbProduct.id, variantId: null })
        }
      });

      const totalAvailableStock = inventoryRecords.reduce(
        (sum, inv) => sum + Math.max(0, inv.quantity - inv.reservedQuantity),
        0
      );

      // If inventory records exist, enforce stock availability
      if (inventoryRecords.length > 0 && totalAvailableStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${dbProduct.name}". Available: ${totalAvailableStock}, requested: ${item.quantity}`,
          HTTP_STATUS.BAD_REQUEST,
          "INSUFFICIENT_STOCK"
        );
      }

      const productName = dbVariant?.name
        ? `${dbProduct.name} - ${dbVariant.name}`
        : dbProduct.name;
      const sku = dbVariant?.sku || dbProduct.sku || null;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName,
        sku,
        unitPrice,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // ── 4.5. Validate Shippo Shipping Rate & Calculate Shipping Fee ──
    let validatedShippingCharges = Number(shippingCharges || 0);
    let resolvedCarrier = shippingCarrier || null;
    let resolvedMethod = shippingMethod || null;
    let selectedRateSnapshot = null;

    try {
      const ratesResult = await getShippingRates({
        organizationId: userRecord?.organizationId || null,
        warehouseId,
        shippingAddress,
        items: validatedItems,
        subtotal: Number(subtotal)
      });

      if (shippingRateId && ratesResult?.rates?.length) {
        const matched = ratesResult.rates.find(r => r.id === shippingRateId || r.rateId === shippingRateId);
        if (matched) {
          validatedShippingCharges = Number(matched.amount);
          resolvedCarrier = matched.carrier;
          resolvedMethod = matched.service;
          selectedRateSnapshot = matched;
        }
      } else if (ratesResult?.rates?.length && !shippingRateId && !shippingCharges) {
        const defaultRate = ratesResult.rates[0];
        validatedShippingCharges = Number(defaultRate.amount);
        resolvedCarrier = defaultRate.carrier;
        resolvedMethod = defaultRate.service;
        selectedRateSnapshot = defaultRate;
      }
    } catch (rateErr) {
      console.warn("[Shippo] Shipping rate calculation note:", rateErr.message);
    }

    // ── 5. Calculate Real-Time Stripe Sales Tax (Outside DB Transaction) ─────
    const shippingNum = validatedShippingCharges;
    const discountNum = new Prisma.Decimal(discount || 0);

    const stripeTaxRes = await calculateStripeTax({
      currency: resolvedCurrency,
      shippingAddress: {
        ...shippingAddress,
        countryCode: resolvedCountryCode
      },
      items: validatedItems.map((i) => ({
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        sku: i.sku,
        variantId: i.variantId,
        productId: i.productId
      })),
      shippingAmount: shippingNum
    });

    const taxDecimal = new Prisma.Decimal(stripeTaxRes.taxAmount || 0);
    const shippingDecimal = new Prisma.Decimal(shippingNum);
    const finalTotal = subtotal.sub(discountNum).add(shippingDecimal).add(taxDecimal);

    // ── 6. Create Order & Reserve Inventory Atomically ───────────────────────
    const checkoutResult = await prisma.$transaction(async (tx) => {
      const org = await resolveUserOrganization(userRecord, tx);

      const order = await tx.order.create({
        data: {
          userId,
          organizationId: org.id,
          warehouseId: warehouseId || null,
          status: "PENDING_PAYMENT",
          currencyCode: resolvedCurrency,
          subtotal,
          discount: discountNum,
          shippingCharges: shippingDecimal,
          shippingRateId: shippingRateId || selectedRateSnapshot?.id || null,
          shippingCarrier: resolvedCarrier,
          shippingMethod: resolvedMethod,
          tax: taxDecimal,
          total: finalTotal,
          stripeTaxCalculationId: stripeTaxRes.taxCalculationId || null,
          metadata: {
            taxBreakdown: stripeTaxRes.taxBreakdown || [],
            isCalculatedViaStripe: stripeTaxRes.isCalculatedViaStripe,
            shippoRateSnapshot: selectedRateSnapshot || null
          },
          items: {
            create: validatedItems
          },
          addresses: {
            create: [
              addressPayload(shippingAddress, "SHIPPING"),
              addressPayload(billing, "BILLING")
            ]
          }
        },
        include: {
          items: true,
          addresses: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } }
        }
      });

      // Persist historical shipping rate snapshot
      if (selectedRateSnapshot) {
        await saveOrderRateSnapshot({
          orderId: order.id,
          selectedRate: selectedRateSnapshot,
          tx
        });
      }

      // Reserve Inventory Atomically
      await reserveInventory({
        organizationId: org.id,
        items: validatedItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity
        })),
        orderId: order.id,
        userId,
        tx
      });

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return {
        order,
        stripeTaxRes
      };
    }, {
      timeout: 15000
    });

  // ── 8. Create Stripe PaymentIntent ────────────────────────────────────────
  const { order } = checkoutResult;

  const paymentIntentResult = await createStripePaymentIntent({
    order,
    customerEmail: userRecord.email,
    customerName: `${userRecord.firstName || ""} ${userRecord.lastName || ""}`.trim(),
    metadata: {
      orderId: order.id,
      taxCalculationId: stripeTaxRes.taxCalculationId || ""
    }
  });

  // Update order with payment intent ID
  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntentResult.id
    }
  });

  // Pre-initialize draft invoice snapshot for audit integrity
  try {
    const { issueInvoiceForOrder } = await import("../invoice/invoice.service.js");
    await issueInvoiceForOrder({ orderId: order.id });
  } catch (invErr) {
    console.warn("[Invoice] Pre-issuing draft invoice on checkout:", invErr.message);
  }

  // ── 9. Return Stripe clientSecret & Order Reference ───────────────────────
  const orderNumber = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
  const totalNum = Number(order.total || 0);

  const formattedOrder = {
    ...order,
    orderNumber,
    total: totalNum,
    totalAmount: totalNum,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    shippingCharges: Number(order.shippingCharges || 0),
    discount: Number(order.discount || 0),
    shippingMethod: order.shippingMethod || null,
    shippingCarrier: order.shippingCarrier || null,
    shippingRateId: order.shippingRateId || null
  };

  return {
    order: formattedOrder,
    orderId: order.id,
    orderNumber,
    status: order.status || "PENDING_PAYMENT",
    clientSecret: paymentIntentResult.clientSecret,
    paymentIntentId: paymentIntentResult.id,
    publishableKey: paymentIntentResult.publishableKey,
    amount: totalNum,
    total: totalNum,
    totalAmount: totalNum,
    currency: order.currencyCode,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    shippingCharges: Number(order.shippingCharges || 0),
    discount: Number(order.discount || 0),
    shippingMethod: order.shippingMethod || null,
    shippingCarrier: order.shippingCarrier || null,
    shippingRateId: order.shippingRateId || null,
    taxCalculation: {
      id: stripeTaxRes.taxCalculationId,
      amount: stripeTaxRes.taxAmount,
      rate: stripeTaxRes.rate,
      breakdown: stripeTaxRes.taxBreakdown,
      isStripeTax: stripeTaxRes.isCalculatedViaStripe
    }
  };
}

/**
 * ─── REAL-TIME STRIPE TAX ESTIMATE ENDPOINT ─────────────────────────────────
 * Allows the frontend checkout UI to compute sales tax live via Stripe Tax
 * as the user types/selects their shipping address before placing order.
 */
export async function estimateStripeTax(payload = {}) {
  const {
    currency = "USD",
    currencyCode,
    shippingAddress,
    items = [],
    shippingAmount = 0,
    shippingCost
  } = payload;

  return calculateStripeTax({
    currency: currencyCode || currency,
    shippingAddress,
    items,
    shippingAmount: shippingCost !== undefined ? shippingCost : shippingAmount
  });
}
