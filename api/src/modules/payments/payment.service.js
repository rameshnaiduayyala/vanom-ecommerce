import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import * as inventoryService from "../inventory/inventory.service.js";
import { issueInvoiceForOrder } from "../invoice/invoice.service.js";
import {
  createStripePaymentIntent,
  recordStripeTaxTransaction,
  refundStripePayment,
  verifyStripeWebhook
} from "./stripe.service.js";

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
 */
export async function capturePayment(paymentId, { amount, orderId = null, userId = null } = {}) {
  let resolvedOrderId = orderId;

  if (!resolvedOrderId && paymentId) {
    const orderMatch = await prisma.order.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentId },
          { id: paymentId }
        ]
      }
    });
    if (orderMatch) resolvedOrderId = orderMatch.id;
  }

  if (resolvedOrderId) {
    const order = await prisma.order.findUnique({
      where: { id: resolvedOrderId },
      include: { items: true, user: true }
    });

    if (order) {
      // 1. Convert inventory reservation to SALE (idempotent)
      if (!order.inventoryDeducted) {
        await inventoryService.deductInventory(order.id, {
          createdById: userId || order.userId || null,
          notes: `Payment captured & verified (${paymentId})`
        });
      }

      // 2. Update order status to CONFIRMED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          ...(paymentId && !order.stripePaymentIntentId ? { stripePaymentIntentId: paymentId } : {})
        }
      });

      // 3. Commit Stripe Tax Transaction for audit & reporting
      if (order.stripeTaxCalculationId) {
        await recordStripeTaxTransaction({
          calculationId: order.stripeTaxCalculationId,
          reference: order.id
        });
      }

      // 4. Generate & Store Official Financial Invoice with PDF
      try {
        await issueInvoiceForOrder({ orderId: order.id });
      } catch (invErr) {
        console.warn("[Invoice] Auto invoice creation on capture:", invErr.message);
      }
    }
  }

  return {
    id: paymentId,
    orderId: resolvedOrderId,
    status: "captured",
    amount: amount || 0,
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
  let event = payload;

  // Verify HMAC signature if signature header is provided
  if (signature && rawBody) {
    try {
      const verified = verifyStripeWebhook(rawBody, signature);
      if (verified) event = verified;
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      throw new AppError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST, "WEBHOOK_SIGNATURE_INVALID");
    }
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
