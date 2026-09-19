import { apiClient } from "./axios.js";

export const companyService = {
  getCompanies: async (params = {}) => {
    return apiClient.get("/admin/companies", { params });
  },

  getCompanyById: async (id) => {
    return apiClient.get(`/companies/${id}`);
  },

  createCompany: async (companyData) => {
    return apiClient.post("/companies", companyData);
  },

  updateCompany: async (id, companyData) => {
    return apiClient.patch(`/companies/${id}`, companyData);
  },

  deleteCompany: async (id) => {
    return apiClient.delete(`/companies/${id}`);
  },

  getBusinessApplications: async (params = {}) => {
    return apiClient.get("/admin/business-applications", { params });
  },

  approveApplication: async (id, notes) => {
    return apiClient.post(`/admin/business-applications/${id}/approve`, { notes });
  },

  rejectApplication: async (id, reason) => {
    return apiClient.post(`/admin/business-applications/${id}/reject`, { reason });
  },
};
