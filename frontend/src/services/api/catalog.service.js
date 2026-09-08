import { apiClient } from "./axios.js";
import { getLiveProducts, getLiveCategories } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const catalogService = {
  getProducts: async (params = {}) => {
    if (USE_MOCK) {
      await delay(150);
      let items = getLiveProducts();
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            (typeof p.category === "string" && p.category.toLowerCase().includes(q))
        );
      }
      if (params.category) {
        items = items.filter((p) => p.categoryId === params.category || p.slug?.includes(params.category));
      }
      return { items, total: items.length, page: 1, limit: 50 };
    }
    return apiClient.get("/products", { params });
  },

  getProductBySlug: async (slug) => {
    if (USE_MOCK) {
      await delay(150);
      const products = getLiveProducts();
      const norm = String(slug || "").toLowerCase().trim();
      const product =
        products.find((p) => p.slug?.toLowerCase() === norm || p.id?.toLowerCase() === norm) ||
        products.find((p) => p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(norm)) ||
        products[0];
      if (!product) throw new Error("Product not found");
      return product;
    }
    return apiClient.get(`/products/${slug}`);
  },

  getCategories: async () => {
    if (USE_MOCK) {
      await delay(100);
      return getLiveCategories();
    }
    return apiClient.get("/categories");
  },

  getFeaturedProducts: async (params = {}) => {
    if (USE_MOCK) {
      await delay(100);
      const items = getLiveProducts().slice(0, params.limit || 8);
      return items;
    }
    return apiClient.get("/products/featured", { params });
  },

  getBestSellers: async (params = {}) => {
    if (USE_MOCK) {
      await delay(100);
      const items = getLiveProducts().slice(0, params.limit || 8);
      return items;
    }
    return apiClient.get("/products/best-sellers", { params });
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
