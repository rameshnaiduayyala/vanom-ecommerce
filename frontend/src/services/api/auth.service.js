import { apiClient } from "./axios.js";

export const authService = {
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  register: async (payload) => {
    return apiClient.post("/auth/register", payload);
  },

  getMe: async () => {
    return apiClient.get("/auth/me");
  },
};
