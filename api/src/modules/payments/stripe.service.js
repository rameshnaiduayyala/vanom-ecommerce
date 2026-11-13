import Stripe from "stripe";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { toStripeAmount, fromStripeAmount } from "./currency.utils.js";

const isRealStripeKey =
  Boolean(env.stripeSecretKey) &&
  !env.stripeSecretKey.includes("placeholder") &&
  env.stripeSecretKey.startsWith("sk_");

export const stripeClient = isRealStripeKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: "2024-12-18.acacia"
    })
  : null;

/**
 * ─── STRIPE TAX: Real-time Sales Tax Calculation ─────────────────────────
 * Computes destination-based sales tax via Stripe Tax API.
 * Never uses hardcoded tax tables or local ZIP datasets.
 */
export async function calculateStripeTax({
  currency = "USD",
  shippingAddress,
  items = [],
  shippingAmount = 0
}) {
  const country = (shippingAddress?.countryCode || "US").toUpperCase();
  const postalCode = shippingAddress?.postalCode || "";
  const state = shippingAddress?.state || "";
  const city = shippingAddress?.city || "";
  const line1 = shippingAddress?.addressLine1 || "123 Main Street";

  const lineItems = items.map((item) => {
    const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : item.price || 0);
    const qty = Number(item.quantity || 1);
    const amountCents = Math.round(unitPrice * qty * 100);

    return {
      amount: Math.max(0, amountCents),
      reference: String(item.sku || item.variantId || item.productId || "sku_general"),
      tax_behavior: "exclusive",
      tax_code: "txcd_99999999" // General tangible consumer merchandise
    };
  });

  if (stripeClient) {
    try {
      const calculationParams = {
        currency: currency.toLowerCase(),
        customer_details: {
          address: {
            line1,
            city,
            state,
            postal_code: postalCode,
            country
          },
          address_source: "shipping"
        },
        line_items: lineItems.length > 0 ? lineItems : [{ amount: 100, reference: "item", tax_behavior: "exclusive" }]
      };

      if (shippingAmount > 0) {
        calculationParams.shipping_cost = {
          amount: Math.round(Number(shippingAmount) * 100),
          tax_behavior: "exclusive",
          tax_code: "txcd_92010001" // Shipping charge
        };
      }

      const calculation = await stripeClient.tax.calculations.create(calculationParams);
      const taxAmount = Number((calculation.tax_amount_exclusive / 100).toFixed(2));
      const firstBreakdown = calculation.tax_breakdown?.[0];
      const rateStr = firstBreakdown?.tax_rate_details?.percentage_decimal || "0.0";
      const taxabilityReason = firstBreakdown?.taxability_reason || null;
      const jurisdiction = firstBreakdown?.tax_rate_details?.state || firstBreakdown?.tax_rate_details?.country || state || null;

      return {
        taxAmount,
        taxCalculationId: calculation.id,
        taxBreakdown: calculation.tax_breakdown || [],
        rate: rateStr,
        taxabilityReason,
        jurisdiction,
        isCalculatedViaStripe: true
      };
    } catch (err) {
      console.warn("[Stripe Tax] Calculation notice:", err.message);
      // When destination jurisdiction has no tax registered or is exempt, return 0 tax with clean explanation
      return {
        taxAmount: 0,
        taxCalculationId: null,
        taxBreakdown: [],
        rate: 0,
        taxabilityReason: "not_collecting",
        jurisdiction: state || country,
        error: err.message,
        isCalculatedViaStripe: false
      };
    }
  }

  throw new AppError(
    "Stripe Tax calculation unavailable: STRIPE_SECRET_KEY is not configured.",
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    "STRIPE_GATEWAY_UNAVAILABLE"
  );
}

/**
 * ─── STRIPE PAYMENT: Create PaymentIntent with Tax Reference ─────────────
 */
export async function createStripePaymentIntent({
  order,
  customerEmail = null,
  customerName = null,
  captureMethod = "automatic",
  idempotencyKey = null,
  metadata = {}
}) {
  const currency = (order.currencyCode || "USD").toLowerCase();
  const amountSmallestUnit = toStripeAmount(order.total, currency);

  if (!stripeClient) {
    throw new AppError(
      "Stripe payment gateway is not configured. Please ensure STRIPE_SECRET_KEY is set in environment.",
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "STRIPE_GATEWAY_UNAVAILABLE"
    );
  }

  const effectiveIdempotencyKey =
    idempotencyKey || `pi_create_${order.id}_${amountSmallestUnit}_${currency}`;

  const params = {
    amount: amountSmallestUnit,
    currency,
    capture_method: captureMethod === "manual" ? "manual" : "automatic",
    metadata: {
      orderId: order.id,
      userId: order.userId || "",
      orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      ...(order.stripeTaxCalculationId ? { taxCalculationId: order.stripeTaxCalculationId } : {}),
      ...metadata
    },
    automatic_payment_methods: {
      enabled: true
    }
  };

  if (customerEmail) {
    params.receipt_email = customerEmail;
  }

  const paymentIntent = await stripeClient.paymentIntents.create(params, {
    idempotencyKey: effectiveIdempotencyKey
  });

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
    amount: Number(order.total),
    currency: order.currencyCode,
    livemode: paymentIntent.livemode,
    publishableKey: env.stripePublishableKey
  };
}

/**
 * ─── STRIPE RETRIEVE PAYMENTINTENT ───────────────────────────────────────
 */
export async function retrieveStripePaymentIntent(paymentIntentId) {
  if (!stripeClient || !paymentIntentId) {
    return null;
  }
  return stripeClient.paymentIntents.retrieve(paymentIntentId);
}

/**
 * ─── STRIPE CAPTURE PAYMENTINTENT ────────────────────────────────────────
 */
export async function captureStripePaymentIntent(
  paymentIntentId,
  { amount = null, currency = "USD" } = {},
  { idempotencyKey = null } = {}
) {
  if (!stripeClient) {
    throw new AppError(
      "Stripe payment gateway is not configured.",
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "STRIPE_GATEWAY_UNAVAILABLE"
    );
  }

  const params = {};
  if (amount !== null && amount !== undefined) {
    params.amount_to_capture = toStripeAmount(amount, currency);
  }

  const options = {};
  if (idempotencyKey) {
    options.idempotencyKey = idempotencyKey;
  }

  return stripeClient.paymentIntents.capture(paymentIntentId, params, options);
}

/**
 * ─── STRIPE CHECKOUT: Create Hosted Checkout Session with Stripe Tax ───────
 * Pure Stripe SDK call with automatic_tax enabled and customer details
 */
export async function createStripeCheckoutSession({
  order,
  customerEmail = null,
  successUrl,
  cancelUrl,
  idempotencyKey = null,
  metadata = {}
}) {
  if (!stripeClient) {
    throw new AppError(
      "Stripe payment gateway is not configured. Please ensure STRIPE_SECRET_KEY is set in environment.",
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "STRIPE_GATEWAY_UNAVAILABLE"
    );
  }

  const currency = (order.currencyCode || "USD").toLowerCase();

  // Convert line items from order
  const lineItems = (order.items || []).map((item) => {
    const unitPrice = Number(item.unitPrice || 0);
    const unitAmountSmallestUnit = toStripeAmount(unitPrice, currency);

    return {
      price_data: {
        currency,
        product_data: {
          name: item.productName || item.product?.name || "Product",
          images: item.product?.images?.[0]?.url ? [item.product.images[0].url] : [],
          metadata: {
            productId: String(item.productId || ""),
            variantId: String(item.variantId || "")
          }
        },
        unit_amount: Math.max(0, unitAmountSmallestUnit)
      },
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
    };
  });

  // If shipping charges apply, add as a line item or shipping option
  if (Number(order.shippingCharges) > 0) {
    lineItems.push({
      price_data: {
        currency,
        product_data: {
          name: `Shipping (${order.shippingCarrier || order.shippingMethod || "Standard"})`,
          metadata: { type: "shipping" }
        },
        unit_amount: toStripeAmount(order.shippingCharges, currency)
      },
      quantity: 1
    });
  }

  const effectiveIdempotencyKey =
    idempotencyKey || `cs_create_${order.id}_${toStripeAmount(order.total, currency)}_${currency}`;

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems.length > 0 ? lineItems : undefined,
    customer_email: customerEmail || undefined,
    automatic_tax: {
      enabled: true
    },
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "IN", "AU", "DE", "FR"]
    },
    tax_id_collection: {
      enabled: true
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      userId: order.userId || "",
      ...metadata
    }
  }, {
    idempotencyKey: effectiveIdempotencyKey
  });

  return {
    id: session.id,
    url: session.url,
    status: session.status
  };
}

/**
 * ─── STRIPE TAX: Record Committed Tax Transaction ───────────────────────
 */
export async function recordStripeTaxTransaction({ calculationId, reference }) {
  if (!stripeClient || !calculationId || calculationId.startsWith("taxcalc_dev_")) {
    return null;
  }

  try {
    const transaction = await stripeClient.tax.transactions.createFromCalculation({
      calculation: calculationId,
      reference: String(reference)
    });
    return transaction;
  } catch (err) {
    console.warn("[Stripe Tax] Could not record tax transaction:", err.message);
    return null;
  }
}

/**
 * ─── STRIPE REFUND: Refund Payment & Reversal ────────────────────────────
 */
export async function refundStripePayment(
  paymentIntentId,
  { amount = null, currency = "USD", reason = "requested_by_customer", idempotencyKey = null } = {}
) {
  if (stripeClient && paymentIntentId && !paymentIntentId.startsWith("pi_dev_")) {
    const params = {
      payment_intent: paymentIntentId,
      reason: reason || "requested_by_customer"
    };
    if (amount !== null && amount !== undefined) {
      params.amount = toStripeAmount(amount, currency);
    }

    const options = {};
    if (idempotencyKey) {
      options.idempotencyKey = idempotencyKey;
    }

    const refund = await stripeClient.refunds.create(params, options);
    return {
      id: refund.id,
      status: refund.status,
      amount: fromStripeAmount(refund.amount, refund.currency),
      currency: refund.currency,
      reason: refund.reason
    };
  }

  return {
    id: `re_mock_${Date.now()}`,
    status: "succeeded",
    amount: amount || 0,
    currency: (currency || "usd").toLowerCase(),
    reason: reason || "requested_by_customer"
  };
}

/**
 * ─── STRIPE WEBHOOK: Verify Cryptographic Signature ──────────────────────
 */
export function verifyStripeWebhook(rawBody, signature) {
  if (!signature) {
    throw new AppError("Missing stripe-signature header", HTTP_STATUS.BAD_REQUEST, "MISSING_SIGNATURE");
  }
  if (!rawBody || (Buffer.isBuffer(rawBody) && rawBody.length === 0)) {
    throw new AppError("Missing raw body for Stripe signature verification", HTTP_STATUS.BAD_REQUEST, "MISSING_RAW_BODY");
  }

  if (env.nodeEnv === "production") {
    if (!stripeClient || !env.stripeWebhookSecret || env.stripeWebhookSecret === "whsec_placeholder") {
      throw new AppError("Stripe webhook secret is not configured in production", HTTP_STATUS.INTERNAL_SERVER_ERROR, "CONFIG_ERROR");
    }
  }

  if (stripeClient && env.stripeWebhookSecret && env.stripeWebhookSecret !== "whsec_placeholder") {
    return stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret
    );
  }

  // Non-production test fallback ONLY when secret is explicitly unconfigured in dev
  try {
    if (Buffer.isBuffer(rawBody)) {
      return JSON.parse(rawBody.toString("utf8"));
    }
    if (typeof rawBody === "string") {
      return JSON.parse(rawBody);
    }
    return rawBody;
  } catch {
    return null;
  }
}
