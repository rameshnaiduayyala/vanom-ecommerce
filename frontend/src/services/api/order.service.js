import { apiClient } from "./axios.js";
import { MOCK_ORDERS } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

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
