import { apiClient } from "./axios.js";
import { MOCK_COMPANIES, MOCK_QUOTES } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const b2bService = {
  // ── Bulk Business Account Management ──
  getCompany: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_COMPANIES[0];
    }
    return apiClient.get("/bulk/business/me");
  },

  registerCompany: async (payload) => {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: { ...payload, id: `bulk-biz-${Date.now()}`, status: "PENDING" } };
    }
    return apiClient.post("/bulk/business/register", {
      businessName: payload.businessName || payload.legalName,
      businessEmail: payload.businessEmail || payload.email,
      businessPhone: payload.businessPhone || payload.phone,
      registrationNumber: payload.registrationNumber || null,
      taxRegistrationNumber: payload.taxRegistrationNumber || payload.taxId || null,
      countryCode: payload.countryCode || "US",
      address: typeof payload.address === "string" ? payload.address : `${payload.address?.line1 || ""}, ${payload.address?.city || ""}`.trim(),
      contactPersonName: payload.contactPersonName || `${payload.adminUser?.firstName || ""} ${payload.adminUser?.lastName || ""}`.trim() || "Contact Person",
    });
  },

  updateCompany: async (payload) => {
    if (USE_MOCK) {
      await delay(150);
      return { success: true };
    }
    return apiClient.put("/bulk/business/me", payload);
  },

  // ── Dedicated Bulk Catalog (Volume Tier Pricing) ──
  getBulkProducts: async (params = {}) => {
    const res = await apiClient.get("/bulk/products", { params });
    return Array.isArray(res) ? res : res?.items || [];
  },

  getBulkProductById: async (id) => {
    return apiClient.get(`/bulk/products/${id}`);
  },

  // ── Admin Bulk Product Management ──
  createBulkProduct: async (payload) => {
    return apiClient.post("/admin/bulk/products", payload);
  },

  updateBulkProduct: async (id, payload) => {
    return apiClient.put(`/admin/bulk/products/${id}`, payload);
  },

  deleteBulkProduct: async (id) => {
    return apiClient.delete(`/admin/bulk/products/${id}`);
  },

  // ── Bulk Cart ──
  getBulkCart: async (params = {}) => {
    return apiClient.get("/bulk/cart", { params });
  },

  addBulkCartItem: async (payload) => {
    return apiClient.post("/bulk/cart/items", payload);
  },

  updateBulkCartItem: async (itemId, payload) => {
    return apiClient.patch(`/bulk/cart/items/${itemId}`, payload);
  },

  removeBulkCartItem: async (itemId) => {
    return apiClient.delete(`/bulk/cart/items/${itemId}`);
  },

  // ── Bulk Orders & Checkout ──
  createBulkOrder: async (payload) => {
    return apiClient.post("/bulk/orders", payload);
  },

  listBulkOrders: async (params = {}) => {
    const res = await apiClient.get("/bulk/orders", { params });
    return Array.isArray(res) ? res : res?.items || [];
  },

  getBulkOrderById: async (id) => {
    return apiClient.get(`/bulk/orders/${id}`);
  },

  // ── Admin Bulk Review & Operations ──
  listAdminBusinesses: async (params = {}) => {
    return apiClient.get("/admin/bulk/businesses", { params });
  },

  getAdminBusinessById: async (id) => {
    return apiClient.get(`/admin/bulk/businesses/${id}`);
  },

  approveBusiness: async (id) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/approve`);
  },

  rejectBusiness: async (id, rejectionReason) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/reject`, { rejectionReason });
  },

  suspendBusiness: async (id) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/suspend`);
  },

  listAdminBulkOrders: async (params = {}) => {
    return apiClient.get("/admin/bulk/orders", { params });
  },

  getAdminBulkOrderById: async (id) => {
    return apiClient.get(`/admin/bulk/orders/${id}`);
  },

  updateBulkOrderStatus: async (id, statusData) => {
    const payload = typeof statusData === "string" ? { status: statusData } : statusData;
    return apiClient.patch(`/admin/bulk/orders/${id}/status`, payload);
  },

  // ── Business Addresses ──
  listAddresses: async () => {
    return apiClient.get("/bulk/addresses");
  },

  createAddress: async (payload) => {
    return apiClient.post("/bulk/addresses", payload);
  },
};

