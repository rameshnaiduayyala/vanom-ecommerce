import { apiClient } from "./axios.js";

export const storeService = {
  /**
   * Get full store settings (Superadmin)
   */
  getStoreSettings: async () => {
    const res = await apiClient.get("/admin/store");
    return res?.data ?? res;
  },

  /**
   * Create store settings (Strictly Superadmin, single store)
   */
  createStoreSettings: async (payload) => {
    const res = await apiClient.post("/admin/store", payload);
    return res?.data ?? res;
  },

  /**
   * Update store settings (Strictly Superadmin)
   */
  updateStoreSettings: async (payload) => {
    const res = await apiClient.put("/admin/store", payload);
    return res?.data ?? res;
  },

  /**
   * Delete / reset store settings (Strictly Superadmin)
   */
  deleteStoreSettings: async () => {
    const res = await apiClient.delete("/admin/store");
    return res?.data ?? res;
  },

  /**
   * Public store info for storefront
   */
  getPublicStore: async () => {
    const res = await apiClient.get("/store");
    return res?.data ?? res;
  }
};
