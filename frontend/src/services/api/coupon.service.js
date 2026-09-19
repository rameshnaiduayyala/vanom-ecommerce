import { apiClient } from "./axios.js";

export const couponService = {
  list: async (params = {}) => {
    return apiClient.get("/coupons", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/coupons/${id}`);
  },

  create: async (payload) => {
    return apiClient.post("/coupons", payload);
  },

  update: async (id, payload) => {
    return apiClient.put(`/coupons/${id}`, payload);
  },

  delete: async (id) => {
    return apiClient.delete(`/coupons/${id}`);
  },
};
