import { apiClient } from "./axios.js";

export const catalogService = {
  getProducts: async (params = {}) => {
    return apiClient.get("/products", { params });
  },

  getProductBySlug: async (slug) => {
    return apiClient.get(`/products/${slug}`);
  },

  getCategories: async () => {
    return apiClient.get("/categories");
  },

  getFeaturedProducts: async (params = {}) => {
    return apiClient.get("/products/highlights/featured", { params });
  },

  getBestSellers: async (params = {}) => {
    return apiClient.get("/products/highlights/best-seller", { params });
  },

  // --- Product CRUD ---
  createProduct: (data) => apiClient.post("/products", data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // --- Category CRUD ---
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post("/categories", data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}?hard=true`),
};
