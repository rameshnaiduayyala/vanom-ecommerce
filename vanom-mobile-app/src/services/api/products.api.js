import { api } from "../../lib/api";








































































export const productsApi = {
  getProducts: (params =






  {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.categoryId) query.append("categoryId", params.categoryId);
    if (params.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
    if (params.isBestSeller !== undefined) query.append("isBestSeller", String(params.isBestSeller));

    const qs = query.toString();
    return api.get(`/products${qs ? `?${qs}` : ""}`);
  },

  getFeatured: (limit = 8) =>
  api.get(`/products/featured?limit=${limit}`),

  getBestSellers: (limit = 8) =>
  api.get(`/products/best-sellers?limit=${limit}`),

  getProductByIdOrSlug: (idOrSlug) =>
  api.get(`/products/${idOrSlug}`)
};