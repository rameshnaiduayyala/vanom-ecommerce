import { apiClient } from "./axios.js";

export const authService = {
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  register: async (payload) => {
    return apiClient.post("/auth/register", payload);
  },

  verifyEmail: async (token) => {
    return apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  forgotPassword: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token, password) => {
    return apiClient.post("/auth/reset-password", { token, password });
  },

  getMe: async () => {
    return apiClient.get("/auth/me");
  },
};
