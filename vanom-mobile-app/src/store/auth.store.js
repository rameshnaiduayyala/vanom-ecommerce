import { create } from "zustand";
import { authApi } from "../services/api/auth.api";
import { getStoredUser } from "../lib/secure-store";












export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accountType: "CUSTOMER",

  initialize: async () => {
    try {
      const stored = await getStoredUser();
      if (stored) {
        set({
          user: stored,
          isAuthenticated: true,
          accountType: stored.customerType === "BUSINESS" ? "BUSINESS" : "CUSTOMER",
          isLoading: false
        });
        return;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) =>
  set({
    user,
    isAuthenticated: Boolean(user),
    accountType: user?.customerType === "BUSINESS" ? "BUSINESS" : "CUSTOMER"
  }),

  setAccountType: (type) => set({ accountType: type }),

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, accountType: "CUSTOMER" });
  }
}));