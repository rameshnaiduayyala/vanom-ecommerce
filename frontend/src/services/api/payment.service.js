import { apiClient } from "./axios.js";
import { getBackendProvider } from "../../features/checkout/config/paymentProviders.config.js";

export const paymentService = {
  createPaymentIntent: async (orderId, checkoutProvider) => {
    const res = await apiClient.post("/payments/create", {
      orderId,
      provider: getBackendProvider(checkoutProvider),
    });
    return res;
  },

  createCheckoutSession: async ({ orderId, successUrl, cancelUrl } = {}) => {
    const res = await apiClient.post("/payments/checkout-session", {
      orderId,
      successUrl,
      cancelUrl,
    });
    return res;
  },

  capturePayment: async (paymentId, payload = {}) => {
    const body = typeof payload === "object" ? payload : { amount: payload };
    const res = await apiClient.post(`/payments/${paymentId}/capture`, body);
    return res;
  },

  refundPayment: async (paymentId, { amount, reason }) => {
    const res = await apiClient.post(`/payments/${paymentId}/refund`, { amount, reason });
    return res;
  },

  processWebhook: async (payload) => {
    const res = await apiClient.post("/payments/webhook", payload);
    return res;
  },
};
