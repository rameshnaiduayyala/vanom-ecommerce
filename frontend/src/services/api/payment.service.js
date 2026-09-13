import { apiClient } from "./axios.js";
import { getBackendProvider, isRedirectProvider } from "../../features/checkout/config/paymentProviders.config.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentService = {
  createPaymentIntent: async (orderId, checkoutProvider) => {
    if (USE_MOCK) {
      await delay(150);
      return {
        paymentId: `pay_mock_${Date.now()}`,
        providerPaymentId: `pp_mock_${Date.now()}`,
        clientSecret: `cs_mock_${Date.now()}`,
        amount: 0,
        currency: "USD",
        provider: getBackendProvider(checkoutProvider),
        approvalUrl: null,
      };
    }
    const res = await apiClient.post("/payments/create", {
      orderId,
      provider: getBackendProvider(checkoutProvider),
    });
    return res;
  },

  capturePayment: async (paymentId, amount) => {
    if (USE_MOCK) {
      await delay(150);
      return { status: "CAPTURED", capturedAmount: amount };
    }
    const res = await apiClient.post(`/payments/${paymentId}/capture`, { amount });
    return res;
  },

  refundPayment: async (paymentId, { amount, reason }) => {
    if (USE_MOCK) {
      await delay(150);
      return { status: "REFUNDED" };
    }
    const res = await apiClient.post(`/payments/${paymentId}/refund`, { amount, reason });
    return res;
  },

  processWebhook: async (payload) => {
    if (USE_MOCK) {
      await delay(100);
      return { status: "PROCESSED" };
    }
    const res = await apiClient.post("/payments/webhook", payload);
    return res;
  },
};
