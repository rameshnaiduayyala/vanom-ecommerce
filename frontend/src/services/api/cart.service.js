import { apiClient } from "./axios.js";
import { MOCK_ORDERS } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const cartService = {
  getCart: async () => {
    if (USE_MOCK) {
      await delay(100);
      return { items: [], itemCount: 0, subtotal: 0 };
    }
    return apiClient.get("/cart");
  },

  addItem: async (item) => {
    if (USE_MOCK) {
      await delay(150);
      return { success: true };
    }
    return apiClient.post("/cart/items", item);
  },

  updateItem: async (itemId, payload) => {
    if (USE_MOCK) {
      await delay(100);
      return { success: true };
    }
    return apiClient.put(`/cart/items/${itemId}`, payload);
  },

  removeItem: async (itemId) => {
    if (USE_MOCK) {
      await delay(100);
      return { success: true };
    }
    return apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    if (USE_MOCK) {
      await delay(100);
      return { success: true };
    }
    return apiClient.delete("/cart");
  },

  validateCheckout: async (payload) => {
    if (USE_MOCK) {
      await delay(200);
      const subtotal = payload.items?.reduce((sum, item) => sum + (item.price || 499) * item.quantity, 0) || 499;
      const taxAmount = Number((subtotal * 0.18).toFixed(2));
      const shippingCost = 50;
      return {
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount: subtotal + taxAmount + shippingCost,
      };
    }
    return apiClient.post("/checkout/validate", payload);
  },

  placeOrder: async (payload) => {
    if (USE_MOCK) {
      await delay(300);
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
        ...payload,
      };
      return newOrder;
    }
    return apiClient.post("/checkout/place-order", payload, {
      headers: { "Idempotency-Key": `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
    });
  },
};

export const orderService = {
  list: async (params = {}) => {
    if (USE_MOCK) {
      await delay(150);
      return { items: MOCK_ORDERS, total: MOCK_ORDERS.length };
    }
    return apiClient.get("/orders", { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      await delay(150);
      const order = MOCK_ORDERS.find((o) => o.id === id || o.orderNumber === id);
      if (!order) throw new Error("Order not found");
      return order;
    }
    return apiClient.get(`/orders/${id}`);
  },

  cancel: async (id, reason) => {
    if (USE_MOCK) {
      await delay(150);
      return { success: true, status: "CANCELLED" };
    }
    return apiClient.post(`/orders/${id}/cancel`, { reason });
  },
};
