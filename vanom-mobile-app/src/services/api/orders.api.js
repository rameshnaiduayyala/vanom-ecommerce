import { api } from "../../lib/api";






































export const ordersApi = {
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status) query.append("status", params.status);
    const qs = query.toString();
    return api.get(`/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderById: (id) =>
  api.get(`/orders/${id}`),

  createOrder: (payload) =>





  api.post("/orders", payload),

  checkout: (payload) =>



  api.post("/checkout", payload)
};