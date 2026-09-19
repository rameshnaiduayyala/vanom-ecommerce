import { apiClient } from "./axios.js";

export const orderService = {
  list: async (params = {}) => {
    return apiClient.get("/orders", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  cancel: async (id, reason) => {
    return apiClient.post(`/orders/${id}/cancel`, { reason });
  },
};
