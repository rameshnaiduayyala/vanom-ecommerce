import { apiClient } from "./axios.js";

export const catalogService = {
  getProducts: async (params = {}) => {
    return apiClient.get("/products", { params });
  },

  getProductBySlug: async (slug) => {
    return apiClient.get(`/products/${slug}`);
  },

  searchProducts: async (params = {}, options = {}) => {
    return apiClient.get("/products/search", {
      params,
      silent: true,
      ...options,
    });
  },

  getCategories: async (params = {}) => {
    const res = await apiClient.get("/categories", { params });
    const sortByOrder = (items) => {
      if (!Array.isArray(items)) return items;
      return [...items].sort((a, b) => {
        const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 0;
        const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
    };
    if (res?.data && Array.isArray(res.data)) {
      res.data = sortByOrder(res.data);
    } else if (res?.items && Array.isArray(res.items)) {
      res.items = sortByOrder(res.items);
    } else if (Array.isArray(res)) {
      return sortByOrder(res);
    }
    return res;
  },

  getCategoryTree: async () => {
    const res = await apiClient.get("/categories/tree");
    const sortTree = (items) => {
      if (!Array.isArray(items)) return items;
      return [...items]
        .sort((a, b) => {
          const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 0;
          const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 0;
          if (orderA !== orderB) return orderA - orderB;
          return (a.name || "").localeCompare(b.name || "");
        })
        .map((item) => ({
          ...item,
          children: item.children ? sortTree(item.children) : []
        }));
    };

    if (res?.data && Array.isArray(res.data)) {
      res.data = sortTree(res.data);
    } else if (Array.isArray(res)) {
      return sortTree(res);
    }
    return res;
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
