import { apiClient } from "./axios.js";
import { MOCK_COMPANIES, MOCK_ORDERS } from "./mock-data.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  login: async (credentials) => {
    if (USE_MOCK) {
      await delay(200);
      if (credentials.email?.includes("admin")) {
        return {
          user: {
            id: "usr-admin",
            email: credentials.email,
            firstName: "Admin",
            lastName: "User",
            customerType: "B2C",
            roles: ["ADMIN", "SUPER_ADMIN"],
            permissions: ["catalog.create", "catalog.update", "orders.read", "companies.verify"],
          },
          tokens: { accessToken: "mock-admin-token", refreshToken: "mock-refresh-token" },
        };
      }
      if (credentials.email?.includes("apex") || credentials.email?.includes("agro") || credentials.email?.includes("b2b") || credentials.email?.includes("wholesale")) {
        return {
          user: {
            id: "usr-b2b-buyer",
            email: credentials.email,
            firstName: "Rajesh",
            lastName: "Kulkarni",
            customerType: "B2B",
            roles: ["CUSTOMER"],
            companyMembers: [{ company: MOCK_COMPANIES[0], role: "COMPANY_ADMIN" }],
          },
          tokens: { accessToken: "mock-b2b-token", refreshToken: "mock-refresh-token" },
        };
      }
      return {
        user: {
          id: "usr-b2c-1",
          email: credentials.email,
          firstName: "Ramesh",
          lastName: "Sharma",
          customerType: "B2C",
          roles: ["CUSTOMER"],
        },
        tokens: { accessToken: "mock-b2c-token", refreshToken: "mock-refresh-token" },
      };
    }
    return apiClient.post("/auth/login", credentials);
  },

  register: async (payload) => {
    if (USE_MOCK) {
      await delay(200);
      return {
        user: {
          id: `usr-${Date.now()}`,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          customerType: payload.customerType || "B2C",
          roles: ["CUSTOMER"],
        },
        tokens: { accessToken: "mock-reg-token", refreshToken: "mock-reg-refresh" },
      };
    }
    return apiClient.post("/auth/register", payload);
  },

  getMe: async () => {
    if (USE_MOCK) {
      await delay(100);
      return null;
    }
    return apiClient.get("/auth/me");
  },
};
