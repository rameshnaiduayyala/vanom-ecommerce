import { apiClient } from "./axios.js";

export const reviewService = {
  listByProduct: async (productId, params = {}) => {
    return apiClient.get(`/products/${productId}/reviews`, { params });
  },

  getById: async (id) => {
    return apiClient.get(`/reviews/${id}`);
  },

  create: async (productId, payload) => {
    return apiClient.post(`/products/${productId}/reviews`, payload);
  },

  update: async (id, payload) => {
    return apiClient.put(`/reviews/${id}`, payload);
  },

  delete: async (id) => {
    return apiClient.delete(`/reviews/${id}`);
  },
};
