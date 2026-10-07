import { api } from "../../lib/api";

export const productsApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
    if (params.isBestSeller !== undefined) query.append("isBestSeller", String(params.isBestSeller));

    const qs = query.toString();
    const res = await api.get(`/products${qs ? `?${qs}` : ""}`);
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    return {
      success: res?.success ?? true,
      data: {
        items,
        meta: res?.data?.meta || { total: items.length },
      },
    };
  },

  getFeatured: async (limit = 8) => {
    try {
      const res = await api.get(`/products/highlights/featured?limit=${limit}`);
      const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      return { success: true, data: items };
    } catch {
      // Fallback to query param filter if highlights route fails
      const fallback = await productsApi.getProducts({ isFeatured: true, limit });
      return { success: true, data: fallback.data.items };
    }
  },

  getBestSellers: async (limit = 8) => {
    try {
      const res = await api.get(`/products/highlights/best-seller?limit=${limit}`);
      const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      return { success: true, data: items };
    } catch {
      const fallback = await productsApi.getProducts({ isBestSeller: true, limit });
      return { success: true, data: fallback.data.items };
    }
  },

  getProductByIdOrSlug: async (idOrSlug) => {
    const res = await api.get(`/products/${idOrSlug}`);
    return {
      success: true,
      data: res?.data || res,
    };
  },
};
