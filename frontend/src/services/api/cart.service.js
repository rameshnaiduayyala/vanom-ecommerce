import { apiClient } from "./axios.js";

export const cartService = {
  getCart: async () => {
    return apiClient.get("/cart");
  },

  addItem: async (item) => {
    return apiClient.post("/cart/items", item);
  },

  updateItem: async (itemId, payload) => {
    return apiClient.put(`/cart/items/${itemId}`, payload);
  },

  removeItem: async (itemId) => {
    return apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    return apiClient.delete("/cart");
  },

  validateCheckout: async (payload) => {
    return apiClient.post("/checkout/validate", payload);
  },

  placeOrder: async (payload) => {
    return apiClient.post("/orders", payload, {
      headers: { "Idempotency-Key": `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
    });
  },
};
