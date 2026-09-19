import { apiClient } from "./axios.js";
import { formatAdminProducts, formatAdminCategories } from "./admin-formatters.js";
import { userService } from "./user.service.js";
import { companyService } from "./company.service.js";

export const adminService = {
  // Metrics & Reports
  getDashboardMetrics: async () => {
    return apiClient.get("/admin/metrics");
  },

  getReports: async () => {
    return apiClient.get("/admin/reports");
  },

  getAuditLogs: async () => {
    return apiClient.get("/admin/audit-logs");
  },

  getPayments: async () => {
    return apiClient.get("/admin/payments");
  },

  // Orders
  getOrders: async () => {
    return apiClient.get("/orders");
  },

  updateOrderStatus: async (id, status) => {
    return apiClient.put(`/orders/${id}/status`, { status });
  },

  // Inventory
  getInventory: async () => {
    return apiClient.get("/admin/inventory");
  },

  adjustInventory: async (payload) => {
    return apiClient.post("/admin/inventory/adjust", payload);
  },

  // Quotes
  getAdminQuotes: async () => {
    return apiClient.get("/admin/quotes");
  },

  // Product Management (formatted for Admin Table/Grid)
  getProducts: async () => {
    const res = await apiClient.get("/products");
    return formatAdminProducts(res);
  },

  createProduct: async (productData) => {
    return apiClient.post("/products", productData);
  },

  getProductById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  updateProduct: async (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  // Category Management (formatted for Admin UI)
  getCategories: async () => {
    const res = await apiClient.get("/categories");
    return formatAdminCategories(res);
  },

  createCategory: async (categoryData) => {
    return apiClient.post("/categories", categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  },

  // Delegate Company & Business Applications
  getCompanies: companyService.getCompanies,
  createCompany: companyService.createCompany,
  updateCompany: companyService.updateCompany,
  deleteCompany: companyService.deleteCompany,
  getBusinessApplications: companyService.getBusinessApplications,
  approveApplication: companyService.approveApplication,
  rejectApplication: companyService.rejectApplication,

  // Delegate User Management
  getUsers: userService.getUsers,
  createUser: userService.createUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
};
