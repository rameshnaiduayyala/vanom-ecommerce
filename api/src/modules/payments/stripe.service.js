import Stripe from "stripe";
import { env } from "../../config/env.js";

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

      return {
        taxAmount,
        taxCalculationId: calculation.id,
        taxBreakdown: calculation.tax_breakdown || [],
        rate: calculation.tax_breakdown?.[0]?.tax_rate_details?.percentage_decimal || 0,
        isCalculatedViaStripe: true
      };
    } catch (err) {
      console.warn("[Stripe Tax] Calculation notice:", err.message);
      // If Stripe account doesn't have active registration in destination jurisdiction, return 0 tax
      return {
        taxAmount: 0,
        taxCalculationId: null,
        taxBreakdown: [],
        rate: 0,
        error: err.message,
        isCalculatedViaStripe: false
      };
    }
  }

  // Graceful development mode fallback if Stripe secret key is placeholder
  const subtotalCents = lineItems.reduce((sum, it) => sum + it.amount, 0);
  const mockTaxRate = country === "US" ? 0.0825 : country === "CA" ? 0.13 : 0.18;
  const mockTax = Number(((subtotalCents / 100) * mockTaxRate).toFixed(2));

  return {
    taxAmount: mockTax,
    taxCalculationId: `taxcalc_dev_${Date.now()}`,
    taxBreakdown: [
      {
        amount: Math.round(mockTax * 100),
        jurisdiction: { country, state: state || "STATE" },
        tax_rate_details: { percentage_decimal: mockTaxRate }
      }
    ],
    rate: mockTaxRate,
    isCalculatedViaStripe: false
  };
}

/**
 * ─── STRIPE PAYMENT: Create PaymentIntent with Tax Reference ─────────────
 */
export async function createStripePaymentIntent({
  order,
  customerEmail = null,
  customerName = null,
  metadata = {}
}) {
  const amountCents = Math.round(Number(order.total) * 100);
  const currency = (order.currencyCode || "USD").toLowerCase();

  if (stripeClient) {
    const params = {
      amount: amountCents,
      currency,
      metadata: {
        orderId: order.id,
        userId: order.userId || "",
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

    const paymentIntent = await stripeClient.paymentIntents.create(params);

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: Number(order.total),
      currency: order.currencyCode,
      publishableKey: env.stripePublishableKey
    };
  }

  // Developer mock client secret when no live key is set
  const mockId = `pi_dev_${Date.now()}_${order.id.slice(-6)}`;
  return {
    id: mockId,
    clientSecret: `${mockId}_secret_mock_${Math.random().toString(36).slice(2, 12)}`,
    status: "requires_payment_method",
    amount: Number(order.total),
    currency: order.currencyCode,
    publishableKey: env.stripePublishableKey || "pk_test_placeholder"
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
export async function refundStripePayment(paymentIntentId, { amount = null, reason = "requested_by_customer" } = {}) {
  if (stripeClient && paymentIntentId && !paymentIntentId.startsWith("pi_dev_")) {
    const params = {
      payment_intent: paymentIntentId,
      reason: reason || "requested_by_customer"
    };
    if (amount) {
      params.amount = Math.round(Number(amount) * 100);
    }
    const refund = await stripeClient.refunds.create(params);
    return {
      id: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      currency: refund.currency
    };
  }

  return {
    id: `re_mock_${Date.now()}`,
    status: "succeeded",
    amount: amount || 0,
    currency: "usd"
  };
}

/**
 * ─── STRIPE WEBHOOK: Verify Cryptographic Signature ──────────────────────
 */
export function verifyStripeWebhook(rawBody, signature) {
  if (!stripeClient || !env.stripeWebhookSecret || env.stripeWebhookSecret === "whsec_placeholder") {
    // If webhook secret is not set, parse payload directly for development
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

  return stripeClient.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret
  );
}
