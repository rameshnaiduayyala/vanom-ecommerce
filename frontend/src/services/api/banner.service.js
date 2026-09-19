import { apiClient } from "./axios.js";

export const bannerService = {
  list: async (params = {}) => {
    return apiClient.get("/banners", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/banners/${id}`);
  },

  create: async (payload) => {
    return apiClient.post("/banners", payload);
  },

  update: async (id, payload) => {
    return apiClient.put(`/banners/${id}`, payload);
  },

  delete: async (id) => {
    return apiClient.delete(`/banners/${id}`);
  },
};
