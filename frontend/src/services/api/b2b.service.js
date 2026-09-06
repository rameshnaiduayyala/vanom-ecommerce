import { apiClient } from "./axios.js";
import { MOCK_COMPANIES, MOCK_QUOTES } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const b2bService = {
  getCompany: async () => {
    if (USE_MOCK) {
      await delay(150);
      return MOCK_COMPANIES[0];
    }
    return apiClient.get("/companies/my");
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
