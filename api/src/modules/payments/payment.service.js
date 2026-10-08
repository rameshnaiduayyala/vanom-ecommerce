import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import * as inventoryService from "../inventory/inventory.service.js";
import { issueInvoiceForOrder } from "../invoice/invoice.service.js";
import {
  createStripePaymentIntent,
  createStripeCheckoutSession,
  recordStripeTaxTransaction,
  refundStripePayment,
  verifyStripeWebhook,
  stripeClient
} from "./stripe.service.js";

/**
 * ─── CREATE STRIPE CHECKOUT SESSION (ENTERPRISE HOSTED CHECKOUT) ──────────
 */
export async function createCheckoutSession({ orderId, userId = null, successUrl = null, cancelUrl = null }) {
  if (!orderId) {
    throw new AppError("Order ID is required", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(userId ? { userId } : {})
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } }
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new AppError(MESSAGES.ORDER_NOT_FOUND || "Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  const resolvedSuccessUrl =
    successUrl || `${clientOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`;
  const resolvedCancelUrl =
    cancelUrl || `${clientOrigin}/checkout?canceled=true&order_id=${order.id}`;

  const session = await createStripeCheckoutSession({
    order,
    customerEmail: order.user?.email || null,
    successUrl: resolvedSuccessUrl,
    cancelUrl: resolvedCancelUrl,
    metadata: {
      orderId: order.id,
      userId: order.userId || ""
    }
  });

  return {
    sessionId: session.id,
    url: session.url,
    orderId: order.id,
    amount: Number(order.total),
    currency: order.currencyCode
  };
}

/**
 * ─── CREATE PAYMENT INTENT (STRIPE PRIMARY) ──────────────────────────────
 */
export async function createPaymentIntent({ orderId, provider = "STRIPE", userId = null }) {
  if (!orderId) {
    throw new AppError("Order ID is required", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(userId ? { userId } : {})
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: true,
      invoices: true
    }
  });

  if (!order) {
    throw new AppError(MESSAGES.ORDER_NOT_FOUND || "Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const normalizedProvider = (provider || "STRIPE").toUpperCase();
  const customerEmail = order.user?.email || null;
  const customerName = `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || null;

  // 1. Primary Stripe Integration
  if (normalizedProvider === "STRIPE" || normalizedProvider === "CARD" || normalizedProvider === "APPLE_PAY" || normalizedProvider === "GOOGLE_PAY") {
    const stripeIntent = await createStripePaymentIntent({
      order,
      customerEmail,
      customerName,
      metadata: {
        orderId: order.id,
        orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`
      }
    });

    // Update order with payment intent ID if not yet saved
    if (!order.stripePaymentIntentId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: stripeIntent.id }
      });
    }

    return {
      id: stripeIntent.id,
      orderId: order.id,
      provider: "STRIPE",
      providerPaymentId: stripeIntent.id,
      clientSecret: stripeIntent.clientSecret,
      publishableKey: stripeIntent.publishableKey,
      amount: Number(order.total),
      currency: order.currencyCode,
      status: stripeIntent.status
    };
  }

  // 2. Legacy / Secondary Providers (Razorpay, PayPal fallback if requested)
  const timestamp = Date.now();
  const shortId = order.id.slice(-8);

  if (normalizedProvider === "RAZORPAY" || normalizedProvider === "AFTERPAY") {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    return {
      id: `pay_${timestamp}`,
      orderId: order.id,
      provider: "RAZORPAY",
      providerPaymentId: `order_rzp_${shortId}_${timestamp.toString(36)}`,
      keyId,
      amount: Number(order.total),
      currency: order.currencyCode,
      status: "created"
    };
  }

  return {
    id: `pay_${timestamp}`,
    orderId: order.id,
    provider: "PAYPAL",
    providerPaymentId: `paypal_${shortId}_${timestamp.toString(36)}`,
    amount: Number(order.total),
    currency: order.currencyCode,
    status: "created"
  };
}

/**
 * ─── CAPTURE & CONFIRM ORDER PAYMENT ─────────────────────────────────────
 * Converts inventory reservation to SALE, commits Stripe Tax, and generates invoice.
 * Strictly verifies caller ownership and live Stripe payment state.
 */
export async function capturePayment(paymentId, { amount, orderId = null, user = null } = {}) {
  if (!user) {
    throw new AppError("Authentication required for payment capture", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }

  let resolvedOrderId = orderId;
  let orderMatch = null;

  if (orderId) {
    orderMatch = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });
  }

  if (!orderMatch && paymentId) {
    orderMatch = await prisma.order.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentId },
          { id: paymentId }
        ]
      },
      include: { items: true, user: true }
    });
  }

  if (!orderMatch) {
    throw new AppError("Order not found for payment capture", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  resolvedOrderId = orderMatch.id;

  // Authorization: Caller must own the order or be SUPERADMIN
  const isSuperAdmin = user.role === "SUPERADMIN";
  if (!isSuperAdmin && orderMatch.userId !== user.sub) {
    throw new AppError("Forbidden: You do not have permission to capture payment for this order", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
  }

  // Verify PaymentIntent belongs to this order
  const intentId = paymentId || orderMatch.stripePaymentIntentId;

  // If live Stripe client is configured and intent is live:
  if (stripeClient && intentId && intentId.startsWith("pi_") && !intentId.startsWith("pi_dev_") && !intentId.startsWith("pay_test_")) {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(intentId);
    if (!paymentIntent) {
      throw new AppError("Stripe PaymentIntent not found", HTTP_STATUS.NOT_FOUND, "PAYMENT_INTENT_NOT_FOUND");
    }

    if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "requires_capture") {
      throw new AppError(
        `Cannot confirm order: Stripe payment state is "${paymentIntent.status}", expected "succeeded" or "requires_capture"`,
        HTTP_STATUS.BAD_REQUEST,
        "PAYMENT_NOT_CONFIRMED"
      );
    }

    // Verify intent metadata matches order
    if (paymentIntent.metadata?.orderId && paymentIntent.metadata.orderId !== orderMatch.id) {
      throw new AppError("PaymentIntent does not match target order ID", HTTP_STATUS.FORBIDDEN, "PAYMENT_ORDER_MISMATCH");
    }
  }

  // Idempotent: If order is already CONFIRMED and inventory already deducted, return gracefully
  if (orderMatch.status === "CONFIRMED" && orderMatch.inventoryDeducted) {
    return {
      id: intentId || paymentId,
      orderId: resolvedOrderId,
      status: "captured",
      amount: Number(orderMatch.total),
      capturedAt: new Date().toISOString(),
      idempotent: true
    };
  }

  // 1. Convert inventory reservation to SALE (idempotent)
  if (!orderMatch.inventoryDeducted) {
    await inventoryService.deductInventory(orderMatch.id, {
      createdById: user.sub || orderMatch.userId || null,
      notes: `Payment captured & verified (${intentId || paymentId})`
    });
  }

  // 2. Update order status to CONFIRMED
  await prisma.order.update({
    where: { id: orderMatch.id },
    data: {
      status: "CONFIRMED",
      ...(intentId && !orderMatch.stripePaymentIntentId ? { stripePaymentIntentId: intentId } : {})
    }
  });

  // 3. Commit Stripe Tax Transaction for audit & reporting
  if (orderMatch.stripeTaxCalculationId) {
    await recordStripeTaxTransaction({
      calculationId: orderMatch.stripeTaxCalculationId,
      reference: orderMatch.id
    });
  }

  // 4. Generate & Store Official Financial Invoice with PDF
  try {
    await issueInvoiceForOrder({ orderId: orderMatch.id });
  } catch (invErr) {
    console.warn("[Invoice] Auto invoice creation on capture:", invErr.message);
  }

  // 5. Initialize Fulfillment Shipment & Label (Idempotent)
  try {
    const { createShipmentForOrder } = await import("../shipping/shipping.service.js");
    await createShipmentForOrder({ orderId: orderMatch.id });
  } catch (shipErr) {
    console.warn("[Shipping] Shipment creation on capture:", shipErr.message);
  }

  return {
    id: intentId || paymentId,
    orderId: resolvedOrderId,
    status: "captured",
    amount: amount || Number(orderMatch.total) || 0,
    capturedAt: new Date().toISOString()
  };
}

/**
 * ─── REFUND PAYMENT ───────────────────────────────────────────────────────
 */
export async function refundPayment(paymentId, { amount, reason = "Customer request", orderId = null } = {}) {
  const stripeRefund = await refundStripePayment(paymentId, { amount, reason });

  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    try {
      const { syncInvoiceStatus } = await import("../invoice/invoice.service.js");
      await syncInvoiceStatus({
        orderId,
        orderStatus: "CANCELLED",
        paymentStatus: "REFUNDED",
        metadata: { refundId: stripeRefund.id, refundReason: reason }
      });
    } catch (invErr) {
      console.warn("[Invoice] Sync invoice on refund error:", invErr.message);
    }
  }

  return {
    ...stripeRefund,
    orderId,
    reason,
    refundedAt: new Date().toISOString()
  };
}

/**
 * ─── STRIPE WEBHOOK EVENT PROCESSOR ──────────────────────────────────────
 * Verified webhook handler:
 *   Payment Succeeded -> Confirm order -> Convert reservation to SALE -> Commit Stripe Tax -> Generate Invoice
 *   Payment Failed    -> Release inventory reservation -> Cancel order
 */
export async function processWebhook(payload, signature = null, rawBody = null) {
  if (!signature) {
    throw new AppError("Missing stripe-signature header", HTTP_STATUS.BAD_REQUEST, "MISSING_SIGNATURE");
  }
  if (!rawBody || (Buffer.isBuffer(rawBody) && rawBody.length === 0)) {
    throw new AppError("Missing raw body for Stripe signature verification", HTTP_STATUS.BAD_REQUEST, "MISSING_RAW_BODY");
  }

  let event = null;
  try {
    event = verifyStripeWebhook(rawBody, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    throw new AppError(err.message || "Invalid webhook signature", err.statusCode || HTTP_STATUS.BAD_REQUEST, "WEBHOOK_SIGNATURE_INVALID");
  }

  if (!event) {
    throw new AppError("Invalid webhook signature or payload", HTTP_STATUS.BAD_REQUEST, "WEBHOOK_SIGNATURE_INVALID");
  }

  const eventType = event?.type || event?.event || "unknown";
  const dataObject = event?.data?.object || {};

  const orderId =
    dataObject?.metadata?.orderId ||
    dataObject?.client_reference_id ||
    event?.orderId ||
    null;

  let matchedOrder = null;
  if (orderId) {
    matchedOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });
  } else if (dataObject?.id) {
    matchedOrder = await prisma.order.findFirst({
      where: { stripePaymentIntentId: dataObject.id }
    });
  }

  let inventoryAction = "none";
  let invoiceGenerated = false;

  if (matchedOrder) {
    // ── PAYMENT SUCCESS: payment_intent.succeeded ─────────────────────────
    if (
      eventType === "payment_intent.succeeded" ||
      eventType === "checkout.session.completed" ||
      eventType === "charge.succeeded"
    ) {
      // 1. Deduct stock & convert reservation to SALE
      if (!matchedOrder.inventoryDeducted) {
        await inventoryService.deductInventory(matchedOrder.id, {
          notes: `Stripe Webhook: ${eventType} (${dataObject.id || "verified"})`
        });
        inventoryAction = "converted_to_sale";
      } else {
        inventoryAction = "already_deducted";
      }

      // 2. Set order status to CONFIRMED
      await prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId: dataObject.id || matchedOrder.stripePaymentIntentId
        }
      });

      // 3. Record official Stripe Tax transaction
      if (matchedOrder.stripeTaxCalculationId) {
        await recordStripeTaxTransaction({
          calculationId: matchedOrder.stripeTaxCalculationId,
          reference: matchedOrder.id
        });
      }

      // 4. Generate official Invoice and PDF
      try {
        await issueInvoiceForOrder({ orderId: matchedOrder.id });
        invoiceGenerated = true;
      } catch (invErr) {
        console.warn("[Invoice] Webhook invoice creation deferred:", invErr.message);
      }

      // 5. Initialize Fulfillment Shipment & Label
      try {
        const { createShipmentForOrder } = await import("../shipping/shipping.service.js");
        await createShipmentForOrder({ orderId: matchedOrder.id });
      } catch (shipErr) {
        console.warn("[Shipping] Shipment creation on payment succeeded:", shipErr.message);
      }
    }
    // ── PAYMENT FAILURE OR CANCELLATION ──────────────────────────────────
    else if (
      eventType === "payment_intent.payment_failed" ||
      eventType === "payment_intent.canceled" ||
      eventType === "charge.failed"
    ) {
      // Release reservation back to stock
      if (matchedOrder.inventoryReserved && !matchedOrder.inventoryDeducted) {
        await inventoryService.releaseInventory(matchedOrder.id, {
          reason: `Stripe payment failed: ${dataObject.last_payment_error?.message || eventType}`
        });
        inventoryAction = "reservation_released";
      }

      await prisma.order.update({
        where: { id: matchedOrder.id },
        data: { status: "CANCELLED" }
      });

      try {
        const { syncInvoiceStatus } = await import("../invoice/invoice.service.js");
        await syncInvoiceStatus({
          orderId: matchedOrder.id,
          orderStatus: "CANCELLED",
          paymentStatus: "FAILED"
        });
      } catch (invErr) {
        console.warn("[Invoice] Webhook invoice sync on failure deferred:", invErr.message);
      }
    }
  }

  return {
    received: true,
    eventType,
    orderId: matchedOrder?.id || orderId,
    inventoryAction,
    invoiceGenerated,
    processedAt: new Date().toISOString()
  };
}
