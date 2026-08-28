import { create } from "zustand";
import { TokenStorage } from "@/services/storage/token.storage.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!TokenStorage.getAccessToken(),
  isLoading: false,
  activeCompany: null, // For B2B wholesale buyers

  setUser: (user) => {
    const primaryCompany = user?.companyMembers?.[0]?.company || user?.company || null;
    set({
      user,
      isAuthenticated: !!user,
      activeCompany: primaryCompany,
    });
  },

  setActiveCompany: (company) => set({ activeCompany: company }),

  login: (userData, tokens) => {
    if (tokens?.accessToken) TokenStorage.setAccessToken(tokens.accessToken);
    if (tokens?.refreshToken) TokenStorage.setRefreshToken(tokens.refreshToken);
    const primaryCompany = userData?.companyMembers?.[0]?.company || userData?.company || null;
    set({
      user: userData,
      isAuthenticated: true,
      activeCompany: primaryCompany,
    });
  },

  logout: () => {
    TokenStorage.clear();
    set({
      user: null,
      isAuthenticated: false,
      activeCompany: null,
    });
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;
    const roles = Array.isArray(user.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.name || r.role?.name))
      : [];
    return roles.includes(role) || roles.includes("SUPER_ADMIN");
  },

  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    if (get().hasRole("SUPER_ADMIN")) return true;
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  },

  isB2BApproved: () => {
    const { user, activeCompany } = get();
    if (user?.customerType === "B2B" && activeCompany?.status === "APPROVED") return true;
    if (activeCompany?.status === "APPROVED") return true;
    return false;
  },
}));
