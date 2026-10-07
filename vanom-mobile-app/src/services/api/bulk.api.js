import { api } from "../../lib/api";




































export const bulkApi = {
  registerBusiness: (payload) =>
  api.post("/bulk/business/register", payload),

  getBusinessProfile: () =>
  api.get("/bulk/business/me"),

  getBusinessDashboard: () =>
  api.get("/bulk/business/dashboard"),

  getBulkProducts: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", String(params.page));
    if (params.limit) qs.append("limit", String(params.limit));
    const s = qs.toString();
    return api.get(`/bulk/products${s ? `?${s}` : ""}`);
  },

  getBulkCart: () => api.get("/bulk/cart"),

  addBulkCartItem: (payload) =>
  api.post("/bulk/cart/items", payload)
};