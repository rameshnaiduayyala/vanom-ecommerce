import { apiClient } from "./axios.js";
import { MOCK_COMPANIES, MOCK_QUOTES } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const b2bService = {
  getCompany: async (id) => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_COMPANIES[0];
    }
    if (id) return apiClient.get(`/companies/${id}`);
    const res = await apiClient.get("/companies");
    return Array.isArray(res) ? res[0] : res?.items?.[0] || MOCK_COMPANIES[0];
  },

  listCompanies: async () => {
    if (USE_MOCK) {
      await delay(100);
      return MOCK_COMPANIES;
    }
    return apiClient.get("/companies");
  },

  registerCompany: async (payload) => {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: { id: `comp-${Date.now()}`, ...payload, status: "PENDING" } };
    }
    return apiClient.post("/companies", payload);
  },

  updateCompany: async (id, payload) => {
    if (USE_MOCK) {
      await delay(150);
      return { success: true };
    }
    return apiClient.put(`/companies/${id}`, payload);
  },

  uploadDocument: async (companyId, formData) => {
    if (USE_MOCK) {
      await delay(250);
      return { success: true, status: "UNDER_REVIEW" };
    }
    return apiClient.post(`/companies/${companyId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  submitVerification: async (companyId) => {
    if (USE_MOCK) {
      await delay(150);
      return { success: true, status: "UNDER_REVIEW" };
    }
    return apiClient.post(`/companies/${companyId}/submit-verification`);
  },

  getQuotes: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_QUOTES;
    }
    return apiClient.get("/quotes");
  },

  requestQuote: async (payload) => {
    if (USE_MOCK) {
      await delay(250);
      return {
        id: `qte-${Date.now()}`,
        quoteNumber: `QTE-${Date.now().toString().slice(-8)}`,
        status: "REQUESTED",
        createdAt: new Date().toISOString(),
        ...payload,
      };
    }
    return apiClient.post("/quotes", payload);
  },

  acceptQuote: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      return { status: "ACCEPTED" };
    }
    return apiClient.post(`/quotes/${id}/accept`);
  },
};
