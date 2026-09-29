import { apiClient } from "./axios.js";

export const companyService = {
  getCompanies: async (params = {}) => {
    const res = await apiClient.get("/admin/bulk/businesses", { params });
    return Array.isArray(res) ? res : res?.items || [];
  },

  getCompanyById: async (id) => {
    return apiClient.get(`/admin/bulk/businesses/${id}`);
  },

  createCompany: async (companyData) => {
    return apiClient.post("/admin/bulk/businesses", companyData);
  },

  updateCompany: async (id, companyData) => {
    return apiClient.put(`/admin/bulk/businesses/${id}`, companyData);
  },

  deleteCompany: async (id) => {
    return apiClient.delete(`/admin/bulk/businesses/${id}`);
  },

  getBusinessApplications: async (params = {}) => {
    const res = await apiClient.get("/admin/bulk/businesses", { params });
    return Array.isArray(res) ? res : res?.items || [];
  },

  approveApplication: async (id, notes) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/approve`, { notes });
  },

  rejectApplication: async (id, reason) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/reject`, { rejectionReason: reason });
  },

  suspendApplication: async (id) => {
    return apiClient.patch(`/admin/bulk/businesses/${id}/suspend`);
  },

  changeStatus: async (id, status, reason) => {
    if (status === "APPROVED") {
      return apiClient.patch(`/admin/bulk/businesses/${id}/approve`);
    }
    if (status === "REJECTED") {
      return apiClient.patch(`/admin/bulk/businesses/${id}/reject`, { rejectionReason: reason });
    }
    if (status === "SUSPENDED") {
      return apiClient.patch(`/admin/bulk/businesses/${id}/suspend`);
    }
    return apiClient.put(`/admin/bulk/businesses/${id}`, { status });
  },
};
