import { create } from "zustand";
import { User, authApi } from "../services/api/auth.api";
import { getStoredUser, clearTokens } from "../lib/secure-store";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accountType: "CUSTOMER" | "BUSINESS";
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAccountType: (type: "CUSTOMER" | "BUSINESS") => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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
          isLoading: false,
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
      accountType: user?.customerType === "BUSINESS" ? "BUSINESS" : "CUSTOMER",
    }),

  setAccountType: (type) => set({ accountType: type }),

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, accountType: "CUSTOMER" });
  },
}));
