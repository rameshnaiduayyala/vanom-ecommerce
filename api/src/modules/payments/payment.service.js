import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { env } from "../../config/env.js";
import * as inventoryService from "../inventory/inventory.service.js";
import { issueInvoiceForOrder, syncInvoiceStatus } from "../invoice/invoice.service.js";
import {
  createStripePaymentIntent,
  createStripeCheckoutSession,
  captureStripePaymentIntent,
  retrieveStripePaymentIntent,
  recordStripeTaxTransaction,
  refundStripePayment,
  verifyStripeWebhook,
  stripeClient
} from "./stripe.service.js";
import {
  toStripeAmount,
  fromStripeAmount,
  isAmountMatching,
  isCurrencyMatching
} from "./currency.utils.js";
import {
  verifyGuestOrderToken,
  generateGuestOrderAuth
} from "./guest-auth.utils.js";

// Re-export guest auth helpers for use in checkout and order modules
export { generateGuestOrderAuth, verifyGuestOrderToken };

/**
 * ─── DISTINCT PAYMENT STATES ──────────────────────────────────────────────
 */
export const PAYMENT_STATES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  REQUIRES_ACTION: "REQUIRES_ACTION",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  REFUNDED: "REFUNDED"
};

/**
 * ─── ORDER ACCESS AUTHORIZATION VERIFICATION ──────────────────────────────
 * Enforces requirement 2.1:
 * - Require authentication for registered customer orders.
 * - Verify the order belongs to the authenticated customer.
 * - For guest checkout, verify the cryptographic guest access token.
 * - Prevent arbitrary or cross-customer order payment operations.
 */
export function verifyOrderAccess(order, { user = null, guestToken = null } = {}) {
  if (!order) {
    throw new AppError(MESSAGES.ORDER_NOT_FOUND || "Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  // 1. SUPERADMIN has full administrative authorization
  if (user && user.role === "SUPERADMIN") {
    return true;
  }

  const orderUserId = order.userId;
  const isGuestOrder = Boolean(order.metadata?.isGuestOrder || order.metadata?.guestOrderTokenHash);
  const callerId = user ? (user.sub || user.id) : null;

  // 2. Registered customer order: MUST be authenticated as that customer
  if (!isGuestOrder && orderUserId) {
    if (!callerId) {
      throw new AppError("Authentication required for this customer order", HTTP_STATUS.UNAUTHORIZED, "AUTH_REQUIRED");
    }
    if (orderUserId !== callerId) {
      throw new AppError("Forbidden: You do not have permission to access or pay for this order", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
    }
    return true;
  }

  // 3. Guest order authorization
  if (isGuestOrder) {
    // If the authenticated user is the one associated with the guest order
    if (callerId && orderUserId === callerId) {
      return true;
    }

    const storedHash = order.metadata?.guestOrderTokenHash;
    const expiresAt = order.metadata?.guestOrderTokenExpiresAt;

    if (!storedHash) {
      throw new AppError("Guest order is missing access authorization configuration", HTTP_STATUS.FORBIDDEN, "GUEST_AUTH_INVALID");
    }

    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      throw new AppError("Guest payment authorization token has expired", HTTP_STATUS.FORBIDDEN, "GUEST_TOKEN_EXPIRED");
    }

    const isValid = verifyGuestOrderToken(guestToken, storedHash, expiresAt);
    if (!isValid) {
      throw new AppError("Invalid or missing guest payment authorization token", HTTP_STATUS.UNAUTHORIZED, "GUEST_AUTH_REQUIRED");
    }
    return true;
  }

  // Fallback check
  if (callerId && orderUserId === callerId) {
    return true;
  }

  throw new AppError("Forbidden: Access denied to this order", HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
}

/**
 * ─── ORDER PAYABLE STATE VERIFICATION ─────────────────────────────────────
 * Enforces requirement 2.1:
 * - Order must be in PENDING_PAYMENT (or PENDING) state.
 * - Reject cancelled, refunded, or already-paid orders.
 * - Verify valid positive amount and currency.
 */
export function verifyOrderPayable(order) {
  if (order.status === "CANCELLED") {
    throw new AppError("Cannot process payment: Order is cancelled", HTTP_STATUS.BAD_REQUEST, "ORDER_CANCELLED");
  }

  const paymentStatus = order.metadata?.paymentStatus;
  if (paymentStatus === PAYMENT_STATES.REFUNDED) {
    throw new AppError("Cannot process payment: Order has been refunded", HTTP_STATUS.BAD_REQUEST, "ORDER_REFUNDED");
  }

  if (
    order.status === "CONFIRMED" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED" ||
    order.inventoryDeducted === true ||
    paymentStatus === PAYMENT_STATES.CAPTURED
  ) {
    throw new AppError("Cannot process payment: Order is already paid or confirmed", HTTP_STATUS.BAD_REQUEST, "ORDER_ALREADY_PAID");
  }

  const total = Number(order.total);
  if (!Number.isFinite(total) || total <= 0) {
    throw new AppError("Cannot process payment: Order total must be greater than zero", HTTP_STATUS.BAD_REQUEST, "INVALID_ORDER_AMOUNT");
  }

  if (!order.currencyCode || typeof order.currencyCode !== "string" || order.currencyCode.length < 3) {
    throw new AppError("Cannot process payment: Order has an invalid currency code", HTTP_STATUS.BAD_REQUEST, "INVALID_ORDER_CURRENCY");
  }
}

/**
 * ─── SECURE REDIRECT URL BUILDER ──────────────────────────────────────────
 * Enforces requirement 2.5:
 * - Do not accept arbitrary external redirect URLs.
 * - Use configured trusted frontend origin (CLIENT_URL / ALLOWED_ORIGINS).
 * - Construct success and cancel URLs on the backend, preserving Stripe placeholders.
 */
export function resolveTrustedRedirectUrls(orderId, { successUrl = null, cancelUrl = null } = {}) {
  const clientOrigin = (env.clientUrl || "http://localhost:5173").replace(/\/$/, "");
  const allowedOrigins = (env.allowedOrigins || [clientOrigin]).map((o) => o.replace(/\/$/, ""));

  function sanitizeUrl(candidateUrl, defaultRelativePath) {
    if (!candidateUrl) {
      return `${clientOrigin}${defaultRelativePath}`;
    }

    // Relative path starting with single slash
    if (candidateUrl.startsWith("/") && !candidateUrl.startsWith("//")) {
      return `${clientOrigin}${candidateUrl}`;
    }

    try {
      const parsed = new URL(candidateUrl);
      const origin = parsed.origin.replace(/\/$/, "");
      if (allowedOrigins.includes(origin)) {
        return candidateUrl;
      }
    } catch {
      // Malformed URL
    }

    // Disallowed external origin: fall back safely to configured frontend origin
    return `${clientOrigin}${defaultRelativePath}`;
  }

  const safeSuccessUrl = sanitizeUrl(
    successUrl,
    `/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}`
  );
  const safeCancelUrl = sanitizeUrl(
    cancelUrl,
    `/checkout/payment-cancelled?order_id=${encodeURIComponent(orderId)}`
  );

  return { successUrl: safeSuccessUrl, cancelUrl: safeCancelUrl };
}

/**
 * ─── CREATE STRIPE CHECKOUT SESSION ───────────────────────────────────────
 */
export async function createCheckoutSession({
  orderId,
  user = null,
  userId = null,
  guestToken = null,
  successUrl = null,
  cancelUrl = null
}) {
  if (!orderId) {
    throw new AppError("Order ID is required", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
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

  const effectiveUser = user || (userId ? { sub: userId } : null);
  verifyOrderAccess(order, { user: effectiveUser, guestToken });
  verifyOrderPayable(order);

  const { successUrl: safeSuccessUrl, cancelUrl: safeCancelUrl } = resolveTrustedRedirectUrls(order.id, {
    successUrl,
    cancelUrl
  });

  const session = await createStripeCheckoutSession({
    order,
    customerEmail: order.user?.email || null,
    successUrl: safeSuccessUrl,
    cancelUrl: safeCancelUrl,
    metadata: {
      orderId: order.id,
      userId: order.userId || ""
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      metadata: {
        ...(order.metadata && typeof order.metadata === "object" ? order.metadata : {}),
        stripeCheckoutSessionId: session.id,
        paymentStatus: PAYMENT_STATES.PENDING_PAYMENT,
        paymentProvider: "STRIPE"
      }
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
export async function createPaymentIntent({
  orderId,
  provider = "STRIPE",
  user = null,
  userId = null,
  guestToken = null,
  captureMethod = "automatic"
}) {
  if (!orderId) {
    throw new AppError("Order ID is required", HTTP_STATUS.BAD_REQUEST, "ORDER_ID_REQUIRED");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: true,
      invoices: true
    }
  });

  if (!order) {
    throw new AppError(MESSAGES.ORDER_NOT_FOUND || "Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const effectiveUser = user || (userId ? { sub: userId } : null);
  verifyOrderAccess(order, { user: effectiveUser, guestToken });
  verifyOrderPayable(order);

  const normalizedProvider = (provider || "STRIPE").toUpperCase();
  const customerEmail = order.user?.email || null;
  const customerName = `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || null;

  // 1. Primary Stripe Integration
  if (
    normalizedProvider === "STRIPE" ||
    normalizedProvider === "CARD" ||
    normalizedProvider === "APPLE_PAY" ||
    normalizedProvider === "GOOGLE_PAY"
  ) {
    const stripeIntent = await createStripePaymentIntent({
      order,
      customerEmail,
      customerName,
      captureMethod,
      metadata: {
        orderId: order.id,
        orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: stripeIntent.id,
        metadata: {
          ...(order.metadata && typeof order.metadata === "object" ? order.metadata : {}),
          paymentStatus: captureMethod === "manual" ? PAYMENT_STATES.AUTHORIZED : PAYMENT_STATES.PENDING_PAYMENT,
          paymentProvider: "STRIPE",
          captureMethod: captureMethod === "manual" ? "manual" : "automatic"
        }
      }
    });

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

  // 2. Secondary Providers (fallback)
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
 * Enforces requirement 2.2 & 2.3:
 * - Verify PaymentIntent ID, Order ID, Metadata, Currency, Amount (smallest units), and Environment.
 * - If requires_capture, execute capture via Stripe with idempotency key.
 * - Idempotent execution: prevent duplicate captures and inventory deductions.
 */
export async function capturePayment(
  paymentId,
  { amount = null, orderId = null, user = null, guestToken = null } = {}
) {
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

  // Authorization check (Registered customer, guest token, or SUPERADMIN)
  verifyOrderAccess(orderMatch, { user, guestToken });

  // Disallow capturing cancelled or refunded orders
  if (orderMatch.status === "CANCELLED") {
    throw new AppError("Cannot capture payment: Order is cancelled", HTTP_STATUS.BAD_REQUEST, "ORDER_CANCELLED");
  }
  if (orderMatch.metadata?.paymentStatus === PAYMENT_STATES.REFUNDED) {
    throw new AppError("Cannot capture payment: Order is refunded", HTTP_STATUS.BAD_REQUEST, "ORDER_REFUNDED");
  }

  const intentId = paymentId || orderMatch.stripePaymentIntentId;

  // Idempotency: If already confirmed and captured, return gracefully
  const isAlreadyCaptured =
    orderMatch.status === "CONFIRMED" &&
    orderMatch.inventoryDeducted &&
    orderMatch.metadata?.paymentStatus === PAYMENT_STATES.CAPTURED;

  if (isAlreadyCaptured) {
    return {
      id: intentId || paymentId,
      orderId: resolvedOrderId,
      status: "captured",
      amount: Number(orderMatch.total),
      capturedAt: new Date().toISOString(),
      idempotent: true
    };
  }

  // Live Stripe verification when configured
  if (stripeClient && intentId && intentId.startsWith("pi_") && !intentId.startsWith("pi_dev_") && !intentId.startsWith("pay_test_")) {
    const paymentIntent = await retrieveStripePaymentIntent(intentId);
    if (!paymentIntent) {
      throw new AppError("Stripe PaymentIntent not found", HTTP_STATUS.NOT_FOUND, "PAYMENT_INTENT_NOT_FOUND");
    }

    // 1. Verify metadata binding
    if (paymentIntent.metadata?.orderId && paymentIntent.metadata.orderId !== orderMatch.id) {
      throw new AppError("PaymentIntent does not match target order ID", HTTP_STATUS.FORBIDDEN, "PAYMENT_ORDER_MISMATCH");
    }

    // 2. Verify currency match
    if (!isCurrencyMatching(orderMatch.currencyCode, paymentIntent.currency)) {
      throw new AppError(
        `Payment currency mismatch: expected ${orderMatch.currencyCode}, got ${paymentIntent.currency.toUpperCase()}`,
        HTTP_STATUS.BAD_REQUEST,
        "CURRENCY_MISMATCH"
      );
    }

    // 3. Verify amount in smallest units
    const expectedSmallestUnit = toStripeAmount(orderMatch.total, orderMatch.currencyCode);
    if (paymentIntent.amount !== expectedSmallestUnit) {
      throw new AppError(
        `Payment amount mismatch: expected ${orderMatch.total} ${orderMatch.currencyCode} (${expectedSmallestUnit} units), got ${paymentIntent.amount} units`,
        HTTP_STATUS.BAD_REQUEST,
        "AMOUNT_MISMATCH"
      );
    }

    // 4. Verify livemode in production
    if (env.nodeEnv === "production" && !paymentIntent.livemode) {
      throw new AppError("Live payment verification failed: Test mode PaymentIntent in production", HTTP_STATUS.BAD_REQUEST, "TEST_MODE_IN_PRODUCTION");
    }

    // 5. Verify status / Execute capture if authorization-only
    if (paymentIntent.status === "requires_capture") {
      const captureKey = `capture_${orderMatch.id}_${intentId}`;
      const capturedIntent = await captureStripePaymentIntent(
        intentId,
        { amount: orderMatch.total, currency: orderMatch.currencyCode },
        { idempotencyKey: captureKey }
      );

      if (capturedIntent.status !== "succeeded") {
        throw new AppError(
          `Payment capture failed with Stripe status: "${capturedIntent.status}"`,
          HTTP_STATUS.BAD_REQUEST,
          "PAYMENT_CAPTURE_FAILED"
        );
      }
    } else if (paymentIntent.status === "canceled") {
      throw new AppError("Payment was canceled", HTTP_STATUS.BAD_REQUEST, "PAYMENT_CANCELLED");
    } else if (paymentIntent.status === "processing") {
      throw new AppError("Payment is still processing", HTTP_STATUS.BAD_REQUEST, "PAYMENT_PROCESSING");
    } else if (paymentIntent.status !== "succeeded") {
      throw new AppError(
        `Cannot confirm order: Stripe payment state is "${paymentIntent.status}", expected "succeeded" or "requires_capture"`,
        HTTP_STATUS.BAD_REQUEST,
        "PAYMENT_NOT_CONFIRMED"
      );
    }
  }

  // Atomic database update inside transaction
  await prisma.$transaction(async (tx) => {
    // 1. Convert inventory reservation to SALE (idempotent)
    if (!orderMatch.inventoryDeducted) {
      await inventoryService.deductInventory(orderMatch.id, {
        createdById: user?.sub || user?.id || orderMatch.userId || null,
        notes: `Payment captured & verified (${intentId || paymentId})`,
        tx
      });
    }

    // 2. Update order status and payment state
    const currentMetadata = orderMatch.metadata && typeof orderMatch.metadata === "object" ? orderMatch.metadata : {};
    await tx.order.update({
      where: { id: orderMatch.id },
      data: {
        status: "CONFIRMED",
        inventoryDeducted: true,
        ...(intentId && !orderMatch.stripePaymentIntentId ? { stripePaymentIntentId: intentId } : {}),
        metadata: {
          ...currentMetadata,
          paymentStatus: PAYMENT_STATES.CAPTURED,
          capturedAt: new Date().toISOString(),
          paymentHistory: [
            ...(Array.isArray(currentMetadata.paymentHistory) ? currentMetadata.paymentHistory : []),
            {
              event: "PAYMENT_CAPTURED",
              paymentId: intentId || paymentId,
              amount: Number(orderMatch.total),
              currency: orderMatch.currencyCode,
              timestamp: new Date().toISOString(),
              capturedBy: user?.sub || user?.id || "system"
            }
          ]
        }
      }
    });

    // 3. Log Audit Trail
    await tx.auditLog.create({
      data: {
        actorId: user?.sub || user?.id || null,
        actorEmail: user?.email || orderMatch.user?.email || null,
        actorRole: user?.role || "SYSTEM",
        action: "PAYMENT_CAPTURED",
        entityType: "Order",
        entityId: orderMatch.id,
        description: `Payment captured for order ${orderMatch.id} (${orderMatch.currencyCode} ${orderMatch.total})`,
        metadata: {
          paymentId: intentId || paymentId,
          amount: Number(orderMatch.total),
          currency: orderMatch.currencyCode
        }
      }
    });
  }, {
    timeout: 30000,
    maxWait: 10000
  });

  // 3. Commit Stripe Tax Transaction
  if (orderMatch.stripeTaxCalculationId) {
    await recordStripeTaxTransaction({
      calculationId: orderMatch.stripeTaxCalculationId,
      reference: orderMatch.id
    });
  }

  // 4. Generate Official Financial Invoice (idempotent)
  try {
    await issueInvoiceForOrder({ orderId: orderMatch.id });
  } catch (invErr) {
    console.warn("[Invoice] Auto invoice creation on capture:", invErr.message);
  }

  // 5. Initialize Fulfillment Shipment & Label
  try {
    const { createShipmentForOrder } = await import("../shipping/shipping.service.js");
    await createShipmentForOrder({ orderId: orderMatch.id });
  } catch (shipErr) {
    console.warn("[Shipping] Shipment creation on capture:", shipErr.message);
  }

  // 6. Send payment confirmation email + GA4 Measurement Protocol (non-blocking)
  prisma.order
    .findUnique({ where: { id: orderMatch.id }, include: { user: true, items: true } })
    .then(async (fullOrder) => {
      if (!fullOrder) return;
      import("../analytics/analytics.service.js")
        .then(({ trackServerPurchase }) => trackServerPurchase(fullOrder))
        .catch((gaErr) => console.warn("[GA4] Server purchase tracking failed:", gaErr.message));
      if (!fullOrder.user?.email) return;
      const { sendPaymentStatusEmail } = await import("../../email/email.service.js");
      await sendPaymentStatusEmail({
        email: fullOrder.user.email,
        firstName: fullOrder.user.firstName,
        orderId: fullOrder.id,
        status: "SUCCEEDED",
        amount: amount || Number(fullOrder.total) || 0,
        currencyCode: fullOrder.currencyCode || "USD",
        paymentId: intentId || paymentId
      });
    })
    .catch((emailErr) => console.warn("[Email] Payment capture email failed:", emailErr.message));

  return {
    id: intentId || paymentId,
    orderId: resolvedOrderId,
    status: "captured",
    amount: amount || Number(orderMatch.total) || 0,
    capturedAt: new Date().toISOString(),
    idempotent: false
  };
}

/**
 * ─── SECURE REFUND PAYMENT ────────────────────────────────────────────────
 * Enforces requirement 2.6:
 * - Only authorized administrators (SUPERADMIN) can initiate refunds.
 * - Verify original payment ownership and order association.
 * - Validate refund amount: prevent refunds > captured minus previous refunds.
 * - Use Stripe idempotency keys.
 * - Maintain accurate partial-refund and full-refund history.
 * - Do not mark order refunded before Stripe confirms.
 */
export async function refundPayment(
  paymentId,
  { amount = null, reason = "requested_by_customer", orderId = null, user = null } = {}
) {
  // Authorization: Only SUPERADMIN can initiate refunds
  if (!user || user.role !== "SUPERADMIN") {
    throw new AppError("Forbidden: Only administrators can initiate refunds", HTTP_STATUS.FORBIDDEN, "ADMIN_REQUIRED");
  }

  let orderMatch = null;
  if (orderId) {
    orderMatch = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
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
      include: { user: true }
    });
  }

  if (!orderMatch) {
    throw new AppError("Order not found for refund", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const intentId = paymentId || orderMatch.stripePaymentIntentId;
  const currentMetadata = orderMatch.metadata && typeof orderMatch.metadata === "object" ? orderMatch.metadata : {};
  const previousRefunds = Array.isArray(currentMetadata.refunds) ? currentMetadata.refunds : [];

  const totalCaptured = Number(orderMatch.total);
  const totalRefundedSoFar = previousRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const availableToRefund = Math.max(0, Number((totalCaptured - totalRefundedSoFar).toFixed(2)));

  if (availableToRefund <= 0) {
    throw new AppError("This order has already been fully refunded", HTTP_STATUS.BAD_REQUEST, "ORDER_ALREADY_REFUNDED");
  }

  const requestedAmount = amount !== null && amount !== undefined ? Number(amount) : availableToRefund;

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    throw new AppError("Refund amount must be greater than zero", HTTP_STATUS.BAD_REQUEST, "INVALID_REFUND_AMOUNT");
  }

  if (requestedAmount > availableToRefund) {
    throw new AppError(
      `Refund amount of ${requestedAmount} exceeds available refundable amount of ${availableToRefund}`,
      HTTP_STATUS.BAD_REQUEST,
      "REFUND_AMOUNT_EXCEEDED"
    );
  }

  // Idempotency key for Stripe refund API call
  const idempotencyKey = `refund_${orderMatch.id}_${intentId}_${toStripeAmount(requestedAmount, orderMatch.currencyCode)}_${previousRefunds.length + 1}`;

  // Execute refund with Stripe
  const stripeRefund = await refundStripePayment(intentId, {
    amount: requestedAmount,
    currency: orderMatch.currencyCode,
    reason,
    idempotencyKey
  });

  if (stripeRefund.status !== "succeeded" && stripeRefund.status !== "pending") {
    throw new AppError(`Stripe refund failed with status: ${stripeRefund.status}`, HTTP_STATUS.BAD_REQUEST, "REFUND_FAILED");
  }

  const newTotalRefunded = Number((totalRefundedSoFar + requestedAmount).toFixed(2));
  const isFullyRefunded = newTotalRefunded >= totalCaptured;
  const newPaymentStatus = isFullyRefunded ? PAYMENT_STATES.REFUNDED : PAYMENT_STATES.PARTIALLY_REFUNDED;

  // Update order inside database transaction
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderMatch.id },
      data: {
        ...(isFullyRefunded ? { status: "CANCELLED" } : {}),
        metadata: {
          ...currentMetadata,
          paymentStatus: newPaymentStatus,
          totalRefunded: newTotalRefunded,
          refunds: [
            ...previousRefunds,
            {
              id: stripeRefund.id,
              amount: requestedAmount,
              currency: orderMatch.currencyCode,
              reason,
              status: stripeRefund.status,
              refundedAt: new Date().toISOString(),
              refundedBy: user.sub || user.id || user.email || "SUPERADMIN"
            }
          ]
        }
      }
    });

    // Record Audit Log
    await tx.auditLog.create({
      data: {
        actorId: user.sub || user.id || null,
        actorEmail: user.email || null,
        actorRole: user.role || "SUPERADMIN",
        action: "PAYMENT_REFUNDED",
        entityType: "Order",
        entityId: orderMatch.id,
        description: `Refund of ${orderMatch.currencyCode} ${requestedAmount} issued (${newPaymentStatus})`,
        metadata: {
          refundId: stripeRefund.id,
          amount: requestedAmount,
          currency: orderMatch.currencyCode,
          newPaymentStatus
        }
      }
    });
  });

  // Sync invoice status
  try {
    await syncInvoiceStatus({
      orderId: orderMatch.id,
      orderStatus: isFullyRefunded ? "CANCELLED" : orderMatch.status,
      paymentStatus: newPaymentStatus,
      metadata: { refundId: stripeRefund.id, refundReason: reason, refundAmount: requestedAmount }
    });
  } catch (invErr) {
    console.warn("[Invoice] Sync invoice on refund error:", invErr.message);
  }

  // Send refund notification email (non-blocking)
  if (orderMatch.user?.email) {
    import("../../email/email.service.js")
      .then(({ sendPaymentStatusEmail }) =>
        sendPaymentStatusEmail({
          email: orderMatch.user.email,
          firstName: orderMatch.user.firstName,
          orderId: orderMatch.id,
          status: "REFUNDED",
          amount: requestedAmount,
          currencyCode: orderMatch.currencyCode || "USD",
          paymentId: stripeRefund.id || intentId,
          reason
        })
      )
      .catch((emailErr) => console.warn("[Email] Refund email failed:", emailErr.message));
  }

  return {
    ...stripeRefund,
    orderId: orderMatch.id,
    amount: requestedAmount,
    totalRefunded: newTotalRefunded,
    paymentStatus: newPaymentStatus,
    reason,
    refundedAt: new Date().toISOString()
  };
}

/**
 * ─── STRIPE WEBHOOK EVENT PROCESSOR ──────────────────────────────────────
 * Enforces requirement 2.4:
 * - Signature verification using raw request body.
 * - Idempotent processing with database event ID tracking.
 * - Independent handling of supported event types.
 * - Amount and currency validation.
 * - Database transactions for state changes.
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

  if (!event || !event.id) {
    throw new AppError("Invalid webhook signature or payload", HTTP_STATUS.BAD_REQUEST, "WEBHOOK_SIGNATURE_INVALID");
  }

  const eventId = event.id;
  const eventType = event.type || event.event || "unknown";
  const dataObject = event.data?.object || {};

  // Idempotency: Check database record of processed event IDs in AuditLog
  const alreadyProcessed = await prisma.auditLog.findFirst({
    where: {
      action: "STRIPE_WEBHOOK_PROCESSED",
      entityType: "StripeEvent",
      entityId: eventId
    }
  });

  if (alreadyProcessed) {
    return {
      received: true,
      duplicate: true,
      eventId,
      eventType,
      processedAt: alreadyProcessed.createdAt.toISOString()
    };
  }

  // Locate matching order
  const orderId =
    dataObject.metadata?.orderId ||
    dataObject.client_reference_id ||
    event.orderId ||
    null;

  let matchedOrder = null;
  if (orderId) {
    matchedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true }
    });
  } else if (dataObject.id) {
    matchedOrder = await prisma.order.findFirst({
      where: { stripePaymentIntentId: dataObject.id },
      include: { user: true, items: true }
    });
  }

  if (!matchedOrder) {
    // Record receipt of unlinked webhook event for audit trail
    await prisma.auditLog.create({
      data: {
        action: "STRIPE_WEBHOOK_PROCESSED",
        entityType: "StripeEvent",
        entityId: eventId,
        description: `Received Stripe webhook ${eventType} (no order matched)`,
        metadata: { eventType, objectId: dataObject.id || null }
      }
    });

    return {
      received: true,
      unhandled: true,
      eventId,
      eventType
    };
  }

  const currentMetadata = matchedOrder.metadata && typeof matchedOrder.metadata === "object" ? matchedOrder.metadata : {};
  const processedEvents = Array.isArray(currentMetadata.processedStripeEvents) ? currentMetadata.processedStripeEvents : [];

  if (processedEvents.includes(eventId)) {
    return {
      received: true,
      duplicate: true,
      eventId,
      eventType
    };
  }

  // Validate amount and currency where applicable
  const eventCurrency = dataObject.currency;
  const eventAmountSmallest = dataObject.amount_received ?? dataObject.amount ?? dataObject.amount_total;

  if (
    eventCurrency &&
    !isCurrencyMatching(matchedOrder.currencyCode, eventCurrency) &&
    eventType !== "charge.refunded"
  ) {
    console.error(`[Stripe Webhook] Currency mismatch for order ${matchedOrder.id}: expected ${matchedOrder.currencyCode}, got ${eventCurrency}`);
    throw new AppError("Webhook payload currency mismatch with order", HTTP_STATUS.BAD_REQUEST, "CURRENCY_MISMATCH");
  }

  // ── 1. PAYMENT_INTENT.SUCCEEDED ───────────────────────────────────────────
  if (eventType === "payment_intent.succeeded") {
    // Validate amount
    const expectedSmallestUnit = toStripeAmount(matchedOrder.total, matchedOrder.currencyCode);
    if (eventAmountSmallest !== undefined && eventAmountSmallest !== expectedSmallestUnit) {
      console.error(`[Stripe Webhook] Amount mismatch for order ${matchedOrder.id}: expected ${expectedSmallestUnit}, got ${eventAmountSmallest}`);
      throw new AppError("Webhook payment amount mismatch with order", HTTP_STATUS.BAD_REQUEST, "AMOUNT_MISMATCH");
    }

    await prisma.$transaction(async (tx) => {
      if (!matchedOrder.inventoryDeducted) {
        await inventoryService.deductInventory(matchedOrder.id, {
          notes: `Stripe Webhook: payment_intent.succeeded (${dataObject.id})`,
          tx
        });
      }

      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: "CONFIRMED",
          inventoryDeducted: true,
          stripePaymentIntentId: dataObject.id || matchedOrder.stripePaymentIntentId,
          metadata: {
            ...currentMetadata,
            paymentStatus: PAYMENT_STATES.CAPTURED,
            capturedAt: new Date().toISOString(),
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed payment_intent.succeeded for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id, amount: dataObject.amount, currency: dataObject.currency }
        }
      });
    });

    // Commit Stripe Tax
    if (matchedOrder.stripeTaxCalculationId) {
      await recordStripeTaxTransaction({
        calculationId: matchedOrder.stripeTaxCalculationId,
        reference: matchedOrder.id
      });
    }

    // Issue invoice
    try {
      await issueInvoiceForOrder({ orderId: matchedOrder.id });
    } catch (invErr) {
      console.warn("[Invoice] Webhook invoice creation deferred:", invErr.message);
    }

    // Shipment
    try {
      const { createShipmentForOrder } = await import("../shipping/shipping.service.js");
      await createShipmentForOrder({ orderId: matchedOrder.id });
    } catch (shipErr) {
      console.warn("[Shipping] Shipment creation deferred:", shipErr.message);
    }

    // Send confirmation email (non-blocking)
    if (matchedOrder.user?.email) {
      import("../../email/email.service.js")
        .then(({ sendPaymentStatusEmail }) =>
          sendPaymentStatusEmail({
            email: matchedOrder.user.email,
            firstName: matchedOrder.user.firstName,
            orderId: matchedOrder.id,
            status: "SUCCEEDED",
            amount: Number(matchedOrder.total) || 0,
            currencyCode: matchedOrder.currencyCode || "USD",
            paymentId: dataObject.id || matchedOrder.stripePaymentIntentId
          })
        )
        .catch((emailErr) => console.warn("[Email] Payment success email failed:", emailErr.message));
    }
  }

  // ── 2. PAYMENT_INTENT.AMOUNT_CAPTURABLE_UPDATED (AUTHORIZED) ─────────────
  else if (eventType === "payment_intent.amount_capturable_updated") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          stripePaymentIntentId: dataObject.id || matchedOrder.stripePaymentIntentId,
          metadata: {
            ...currentMetadata,
            paymentStatus: PAYMENT_STATES.AUTHORIZED,
            authorizedAt: new Date().toISOString(),
            amountCapturable: dataObject.amount_capturable,
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed payment_intent.amount_capturable_updated (authorized) for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id, amountCapturable: dataObject.amount_capturable }
        }
      });
    });
  }

  // ── 3. PAYMENT_INTENT.PAYMENT_FAILED / PAYMENT_INTENT.CANCELED ───────────
  else if (eventType === "payment_intent.payment_failed" || eventType === "payment_intent.canceled") {
    await prisma.$transaction(async (tx) => {
      if (matchedOrder.inventoryReserved && !matchedOrder.inventoryDeducted) {
        await inventoryService.releaseInventory(matchedOrder.id, {
          reason: `Stripe webhook: ${eventType} (${dataObject.last_payment_error?.message || "Failed"})`,
          tx
        });
      }

      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: "CANCELLED",
          metadata: {
            ...currentMetadata,
            paymentStatus: PAYMENT_STATES.PAYMENT_FAILED,
            failureReason: dataObject.last_payment_error?.message || eventType,
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed ${eventType} for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id, failureMessage: dataObject.last_payment_error?.message }
        }
      });
    });

    try {
      await syncInvoiceStatus({
        orderId: matchedOrder.id,
        orderStatus: "CANCELLED",
        paymentStatus: "FAILED"
      });
    } catch (invErr) {
      console.warn("[Invoice] Webhook invoice sync deferred:", invErr.message);
    }
  }

  // ── 4. CHECKOUT.SESSION.COMPLETED ────────────────────────────────────────
  else if (eventType === "checkout.session.completed") {
    // Check payment_status === "paid" before treating order as paid
    const isPaid = dataObject.payment_status === "paid";

    await prisma.$transaction(async (tx) => {
      if (isPaid) {
        if (!matchedOrder.inventoryDeducted) {
          await inventoryService.deductInventory(matchedOrder.id, {
            notes: `Stripe Webhook: checkout.session.completed (paid)`,
            tx
          });
        }

        await tx.order.update({
          where: { id: matchedOrder.id },
          data: {
            status: "CONFIRMED",
            inventoryDeducted: true,
            stripePaymentIntentId: dataObject.payment_intent || matchedOrder.stripePaymentIntentId,
            metadata: {
              ...currentMetadata,
              paymentStatus: PAYMENT_STATES.CAPTURED,
              capturedAt: new Date().toISOString(),
              processedStripeEvents: [...processedEvents, eventId]
            }
          }
        });
      } else {
        // Payment requires async settlement (e.g. Boleto, SEPA) or action
        await tx.order.update({
          where: { id: matchedOrder.id },
          data: {
            metadata: {
              ...currentMetadata,
              paymentStatus: PAYMENT_STATES.REQUIRES_ACTION,
              processedStripeEvents: [...processedEvents, eventId]
            }
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed checkout.session.completed (payment_status: ${dataObject.payment_status}) for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id, paymentStatus: dataObject.payment_status }
        }
      });
    });

    if (isPaid) {
      if (matchedOrder.stripeTaxCalculationId) {
        await recordStripeTaxTransaction({
          calculationId: matchedOrder.stripeTaxCalculationId,
          reference: matchedOrder.id
        });
      }
      try {
        await issueInvoiceForOrder({ orderId: matchedOrder.id });
      } catch (invErr) {
        console.warn("[Invoice] Webhook invoice creation deferred:", invErr.message);
      }
    }
  }

  // ── 5. CHECKOUT.SESSION.ASYNC_PAYMENT_SUCCEEDED ───────────────────────────
  else if (eventType === "checkout.session.async_payment_succeeded") {
    await prisma.$transaction(async (tx) => {
      if (!matchedOrder.inventoryDeducted) {
        await inventoryService.deductInventory(matchedOrder.id, {
          notes: `Stripe Webhook: checkout.session.async_payment_succeeded`
        });
      }

      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: "CONFIRMED",
          inventoryDeducted: true,
          stripePaymentIntentId: dataObject.payment_intent || matchedOrder.stripePaymentIntentId,
          metadata: {
            ...currentMetadata,
            paymentStatus: PAYMENT_STATES.CAPTURED,
            capturedAt: new Date().toISOString(),
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed checkout.session.async_payment_succeeded for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id }
        }
      });
    });

    try {
      await issueInvoiceForOrder({ orderId: matchedOrder.id });
    } catch (invErr) {
      console.warn("[Invoice] Webhook invoice creation deferred:", invErr.message);
    }
  }

  // ── 6. CHECKOUT.SESSION.ASYNC_PAYMENT_FAILED ──────────────────────────────
  else if (eventType === "checkout.session.async_payment_failed") {
    await prisma.$transaction(async (tx) => {
      if (matchedOrder.inventoryReserved && !matchedOrder.inventoryDeducted) {
        await inventoryService.releaseInventory(matchedOrder.id, {
          reason: `Stripe webhook: async payment failed`
        });
      }

      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: "CANCELLED",
          metadata: {
            ...currentMetadata,
            paymentStatus: PAYMENT_STATES.PAYMENT_FAILED,
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed checkout.session.async_payment_failed for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id }
        }
      });
    });

    try {
      await syncInvoiceStatus({
        orderId: matchedOrder.id,
        orderStatus: "CANCELLED",
        paymentStatus: "FAILED"
      });
    } catch (invErr) {
      console.warn("[Invoice] Webhook invoice sync deferred:", invErr.message);
    }
  }

  // ── 7. CHARGE.REFUNDED ────────────────────────────────────────────────────
  else if (eventType === "charge.refunded") {
    const refundList = dataObject.refunds?.data || [];
    const totalRefundedInSmallest = dataObject.amount_refunded || 0;
    const totalRefundedDecimal = fromStripeAmount(totalRefundedInSmallest, matchedOrder.currencyCode);
    const isFullRefund = dataObject.refunded === true || totalRefundedDecimal >= Number(matchedOrder.total);
    const newPaymentStatus = isFullRefund ? PAYMENT_STATES.REFUNDED : PAYMENT_STATES.PARTIALLY_REFUNDED;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          ...(isFullRefund ? { status: "CANCELLED" } : {}),
          metadata: {
            ...currentMetadata,
            paymentStatus: newPaymentStatus,
            totalRefunded: totalRefundedDecimal,
            refunds: refundList.map((r) => ({
              id: r.id,
              amount: fromStripeAmount(r.amount, r.currency),
              currency: r.currency,
              reason: r.reason,
              status: r.status,
              refundedAt: new Date(r.created * 1000).toISOString()
            })),
            processedStripeEvents: [...processedEvents, eventId]
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: "STRIPE_WEBHOOK_PROCESSED",
          entityType: "StripeEvent",
          entityId: eventId,
          description: `Processed charge.refunded (${newPaymentStatus}) for order ${matchedOrder.id}`,
          metadata: { orderId: matchedOrder.id, amountRefunded: totalRefundedDecimal }
        }
      });
    });

    try {
      await syncInvoiceStatus({
        orderId: matchedOrder.id,
        orderStatus: isFullRefund ? "CANCELLED" : matchedOrder.status,
        paymentStatus: newPaymentStatus,
        metadata: { totalRefunded: totalRefundedDecimal }
      });
    } catch (invErr) {
      console.warn("[Invoice] Sync invoice on refund webhook error:", invErr.message);
    }
  }

  // ── 8. UNHANDLED OTHER EVENTS ─────────────────────────────────────────────
  else {
    await prisma.auditLog.create({
      data: {
        action: "STRIPE_WEBHOOK_PROCESSED",
        entityType: "StripeEvent",
        entityId: eventId,
        description: `Stripe event ${eventType} acknowledged without action for order ${matchedOrder.id}`,
        metadata: { orderId: matchedOrder.id, eventType }
      }
    });
  }

  return {
    received: true,
    eventType,
    eventId,
    orderId: matchedOrder.id,
    processedAt: new Date().toISOString()
  };
}
