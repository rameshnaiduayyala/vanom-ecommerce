import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

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
      invoices: true
    }
  });

  if (!order) {
    throw new AppError(MESSAGES.ORDER_NOT_FOUND || "Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  }

  const amount = Number(order.total);
  const currency = order.currencyCode || "USD";
  const normalizedProvider = (provider || "STRIPE").toUpperCase();
  const timestamp = Date.now();
  const shortId = order.id.slice(-8);

  switch (normalizedProvider) {
    case "RAZORPAY":
    case "AFTERPAY": {
      const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_replace_with_real_id";
      const providerPaymentId = `order_rzp_${shortId}_${timestamp.toString(36)}`;
      return {
        id: `pay_${timestamp}`,
        orderId: order.id,
        provider: "RAZORPAY",
        providerPaymentId,
        keyId,
        amount,
        currency,
        status: "created"
      };
    }

    case "PAYPAL": {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      return {
        id: `pay_${timestamp}`,
        orderId: order.id,
        provider: "PAYPAL",
        providerPaymentId: `paypal_${shortId}_${timestamp.toString(36)}`,
        approvalUrl: `${clientUrl}/orders/${order.id}?status=paid`,
        amount,
        currency,
        status: "created"
      };
    }

    case "CARD":
    case "STRIPE":
    case "APPLE_PAY":
    case "GOOGLE_PAY":
    default: {
      return {
        id: `pi_${timestamp}`,
        orderId: order.id,
        provider: "STRIPE",
        providerPaymentId: `pi_${timestamp}_${shortId}`,
        clientSecret: `pi_${timestamp}_secret_${Math.random().toString(36).slice(2, 10)}`,
        amount,
        currency,
        status: "requires_payment_method"
      };
    }
  }
}

export async function capturePayment(paymentId, { amount, orderId = null } = {}) {
  if (orderId) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" }
      });
    } catch (err) {
      console.warn("Could not update order status on capture:", err.message);
    }
  }

  return {
    id: paymentId,
    orderId,
    status: "captured",
    amount: amount || 0,
    capturedAt: new Date().toISOString()
  };
}

export async function refundPayment(paymentId, { amount, reason = "Customer request" } = {}) {
  return {
    id: `ref_${Date.now()}`,
    paymentId,
    status: "refunded",
    amount: amount || 0,
    reason,
    refundedAt: new Date().toISOString()
  };
}

export async function processWebhook(payload) {
  return {
    received: true,
    eventType: payload?.event || payload?.type || "unknown",
    processedAt: new Date().toISOString()
  };
}
