import { apiClient } from "./axios.js";

export const brandService = {
  getBrands: async (params = {}) => {
    const res = await apiClient.get("/brands", { params });
    // Normalize response from API
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
  },

  getBrandById: async (id) => {
    const res = await apiClient.get(`/brands/${id}`);
    return res?.data || res;
  },

  createBrand: async (data) => {
    return apiClient.post("/brands", data);
  },

  updateBrand: async (id, data) => {
    return apiClient.put(`/brands/${id}`, data);
  },

  deleteBrand: async (id) => {
    return apiClient.delete(`/brands/${id}`);
  },
};
