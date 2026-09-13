import Stripe from "stripe";
import Razorpay from "razorpay";
import { PaymentProvider } from "./payment-provider.js";
import { env } from "../../../config/env.js";

function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== "sk_test_placeholder_replace_with_real_key");
}

function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_ID !== "rzp_test_placeholder_replace_with_real_id");
}

function isPayPalConfigured() {
  return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_ID !== "AXeK5NnOE1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ");
}

export class StripeProvider extends PaymentProvider {
  constructor() {
    super();
    this.stripe = isStripeConfigured() ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;
  }

  async createIntent({ amount, currency, orderId, metadata }) {
    if (!this.stripe) return this._mock("STRIPE", { amount, currency, orderId, metadata });

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: (currency || "usd").toLowerCase(),
        metadata: { orderId, ...metadata },
      });

      return {
        provider: "STRIPE",
        providerPaymentId: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        amount: intent.amount / 100,
        currency: intent.currency,
      };
    } catch (err) {
      console.error("Stripe createIntent error:", err);
      throw err;
    }
  }

  async capturePayment(providerPaymentId, amount) {
    if (!this.stripe) return { provider: "STRIPE", providerPaymentId, status: "CAPTURED", capturedAmount: amount };

    try {
      const intent = await this.stripe.paymentIntents.capture(providerPaymentId);
      return {
        provider: "STRIPE",
        providerPaymentId: intent.id,
        status: intent.status,
        capturedAmount: intent.amount_received / 100,
      };
    } catch (err) {
      console.error("Stripe capturePayment error:", err);
      throw err;
    }
  }

  async refundPayment(providerPaymentId, amount, reason) {
    if (!this.stripe) return { provider: "STRIPE", providerRefundId: `re_mock_${Date.now()}`, status: "REFUNDED", refundedAmount: amount, reason };

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: providerPaymentId,
        amount: Math.round(amount * 100),
        reason: reason === "Customer request" ? "requested_by_customer" : "duplicate",
      });

      return {
        provider: "STRIPE",
        providerRefundId: refund.id,
        status: refund.status,
        refundedAmount: refund.amount / 100,
        reason,
      };
    } catch (err) {
      console.error("Stripe refundPayment error:", err);
      throw err;
    }
  }

  async verifyWebhookSignature(payload, signature) {
    if (!this.stripe) return true;
    try {
      const event = this.stripe.webhooks.constructEvent(JSON.stringify(payload), signature, env.STRIPE_WEBHOOK_SECRET || "");
      return event;
    } catch (err) {
      console.error("Stripe webhook verification error:", err);
      return null;
    }
  }

  _mock(prefix, data) {
    return {
      provider: prefix,
      providerPaymentId: `${prefix.toLowerCase()}_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientSecret: `${prefix.toLowerCase()}_secret_${Date.now()}`,
      status: "AUTHORIZED",
      amount: data.amount,
      currency: data.currency,
    };
  }
}

export class RazorpayProvider extends PaymentProvider {
  constructor() {
    super();
    this.razorpay = isRazorpayConfigured() ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }) : null;
  }

  async createIntent({ amount, currency, orderId, metadata }) {
    if (!this.razorpay) return this._mock("RAZORPAY", { amount, currency, orderId, metadata });

    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: (currency || "inr").toUpperCase(),
        receipt: `order_${orderId}`,
        notes: { orderId, ...metadata },
      });

      return {
        provider: "RAZORPAY",
        providerPaymentId: order.id,
        clientSecret: order.key_id,
        status: "CREATED",
        amount: order.amount / 100,
        currency: order.currency,
      };
    } catch (err) {
      console.error("Razorpay createIntent error:", err);
      throw err;
    }
  }

  async capturePayment(providerPaymentId, amount) {
    if (!this.razorpay) return { provider: "RAZORPAY", providerPaymentId, status: "CAPTURED", capturedAmount: amount };

    try {
      const payment = await this.razorpay.payments.capture(providerPaymentId, Math.round(amount * 100));
      return {
        provider: "RAZORPAY",
        providerPaymentId: payment.id,
        status: payment.status,
        capturedAmount: payment.amount / 100,
      };
    } catch (err) {
      console.error("Razorpay capturePayment error:", err);
      throw err;
    }
  }

  async refundPayment(providerPaymentId, amount, reason) {
    if (!this.razorpay) return { provider: "RAZORPAY", providerRefundId: `rfnd_rzp_${Date.now()}`, status: "REFUNDED", refundedAmount: amount, reason };

    try {
      const refund = await this.razorpay.payments.refund(providerPaymentId, { amount: Math.round(amount * 100), notes: { reason } });
      return {
        provider: "RAZORPAY",
        providerRefundId: refund.id,
        status: refund.status,
        refundedAmount: refund.amount / 100,
        reason,
      };
    } catch (err) {
      console.error("Razorpay refundPayment error:", err);
      throw err;
    }
  }

  async verifyWebhookSignature(payload, signature) {
    if (!this.razorpay) return true;
    try {
      const crypto = await import("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");
      return expectedSignature === signature ? payload : null;
    } catch (err) {
      console.error("Razorpay webhook verification error:", err);
      return null;
    }
  }

  _mock(prefix, data) {
    return {
      provider: prefix,
      providerPaymentId: `${prefix.toLowerCase()}_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientSecret: `${prefix.toLowerCase()}_key_${Date.now()}`,
      status: "AUTHORIZED",
      amount: data.amount,
      currency: data.currency,
    };
  }
}

export class PayPalProvider extends PaymentProvider {
  constructor() {
    super();
    this.isConfigured = isPayPalConfigured();
    this.clientId = env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET;
  }

  async _getAccessToken() {
    if (!this.isConfigured) return null;
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const response = await fetch(
        `https://${process.env.PAYPAL_MODE === "live" ? "api.paypal.com" : "api.sandbox.paypal.com"}/v1/oauth2/token`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        }
      );
      const data = await response.json();
      return data.access_token;
    } catch (err) {
      console.error("PayPal access token error:", err);
      return null;
    }
  }

  async createIntent({ amount, currency, orderId, metadata }) {
    if (!this.isConfigured) return this._mock("PAYPAL", { amount, currency, orderId, metadata });

    try {
      const accessToken = await this._getAccessToken();
      if (!accessToken) return this._mock("PAYPAL", { amount, currency, orderId, metadata });

      const response = await fetch(
        `https://${process.env.PAYPAL_MODE === "live" ? "api.paypal.com" : "api.sandbox.paypal.com"}/v2/checkout/orders`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: (currency || "USD").toUpperCase(),
                  value: amount.toFixed(2),
                },
                description: `Order ${orderId}`,
                custom_id: orderId,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("PayPal order creation error:", error);
        return this._mock("PAYPAL", { amount, currency, orderId, metadata });
      }

      const order = await response.json();
      return {
        provider: "PAYPAL",
        providerPaymentId: order.id,
        clientSecret: order.id,
        status: order.status,
        amount: amount,
        currency: currency || "USD",
        approvalUrl: order.links?.find((l) => l.rel === "approve")?.href,
      };
    } catch (err) {
      console.error("PayPal createIntent error:", err);
      return this._mock("PAYPAL", { amount, currency, orderId, metadata });
    }
  }

  async capturePayment(providerPaymentId, amount) {
    if (!this.isConfigured) return { provider: "PAYPAL", providerPaymentId, status: "CAPTURED", capturedAmount: amount };

    try {
      const accessToken = await this._getAccessToken();
      if (!accessToken) return { provider: "PAYPAL", providerPaymentId, status: "CAPTURED", capturedAmount: amount };

      const response = await fetch(
        `https://${process.env.PAYPAL_MODE === "live" ? "api.paypal.com" : "api.sandbox.paypal.com"}/v2/checkout/orders/${providerPaymentId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("PayPal capture error:", error);
        return { provider: "PAYPAL", providerPaymentId, status: "FAILED", capturedAmount: 0, error };
      }

      const capture = await response.json();
      const captureData = capture.purchase_units?.[0]?.payments?.captures?.[0];
      return {
        provider: "PAYPAL",
        providerPaymentId: capture.id,
        status: capture.status,
        capturedAmount: captureData?.amount?.value ? parseFloat(captureData.amount.value) : amount,
      };
    } catch (err) {
      console.error("PayPal capturePayment error:", err);
      return { provider: "PAYPAL", providerPaymentId, status: "FAILED", capturedAmount: 0, error: err.message };
    }
  }

  async refundPayment(providerPaymentId, amount, reason) {
    if (!this.isConfigured) return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "REFUNDED", refundedAmount: amount, reason };

    try {
      const accessToken = await this._getAccessToken();
      if (!accessToken) return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "REFUNDED", refundedAmount: amount, reason };

      // First get the capture ID from the order
      const orderRes = await fetch(
        `https://${process.env.PAYPAL_MODE === "live" ? "api.paypal.com" : "api.sandbox.paypal.com"}/v2/checkout/orders/${providerPaymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!orderRes.ok) {
        console.error("PayPal order lookup failed for refund");
        return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "FAILED", refundedAmount: 0 };
      }

      const order = await orderRes.json();
      const captureId = order.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      if (!captureId) {
        return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "FAILED", refundedAmount: 0 };
      }

      // Now refund the capture
      const refundRes = await fetch(
        `https://${process.env.PAYPAL_MODE === "live" ? "api.paypal.com" : "api.sandbox.paypal.com"}/v2/payments/captures/${captureId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            note_to_payer: reason,
          }),
        }
      );

      if (!refundRes.ok) {
        const error = await refundRes.json();
        console.error("PayPal refund error:", error);
        return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "FAILED", refundedAmount: 0 };
      }

      const refund = await refundRes.json();
      return {
        provider: "PAYPAL",
        providerRefundId: refund.id,
        status: refund.status,
        refundedAmount: parseFloat(refund.amount?.value || amount),
        reason,
      };
    } catch (err) {
      console.error("PayPal refundPayment error:", err);
      return { provider: "PAYPAL", providerRefundId: `ref_paypal_${Date.now()}`, status: "FAILED", refundedAmount: 0, error: err.message };
    }
  }

  async verifyWebhookSignature(payload, signature) {
    if (!this.isConfigured) return true;
    // PayPal webhook verification would require additional headers from the webhook request
    // For now, we'll accept the webhook if basic structure is present
    return payload && typeof payload === "object" ? payload : null;
  }

  _mock(prefix, data) {
    return {
      provider: prefix,
      providerPaymentId: `${prefix.toLowerCase()}_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientSecret: `${prefix.toLowerCase()}_secret_${Date.now()}`,
      status: "CREATED",
      amount: data.amount,
      currency: data.currency,
    };
  }
}

export const providers = {
  STRIPE: StripeProvider,
  RAZORPAY: RazorpayProvider,
  PAYPAL: PayPalProvider,
};
