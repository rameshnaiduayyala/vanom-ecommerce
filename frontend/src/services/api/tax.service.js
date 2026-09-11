import { apiClient } from "./axios.js";

export const taxService = {
  calculateTax: async (payload) => {
    return apiClient.post("/tax/calculate", payload);
  },
};
