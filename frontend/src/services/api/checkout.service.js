import { apiClient } from "./axios.js";

export const checkoutService = {
  processCheckout: async (payload) => {
    return apiClient.post("/checkout", payload);
  },

  calculateStripeTax: async (payload) => {
    return apiClient.post("/checkout/calculate-tax", payload, { silent: true });
  },
};
