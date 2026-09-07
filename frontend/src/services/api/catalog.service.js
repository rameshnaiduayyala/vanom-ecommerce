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
      const product = products.find((p) => p.slug === slug || p.id === slug);
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
};
