import { api } from "../../lib/api";
import { setAccessToken, setRefreshToken, clearTokens, setStoredUser, getStoredUser } from "../../lib/secure-store";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  customerType?: "CUSTOMER" | "BUSINESS";
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>("/auth/login", credentials);
    if (res.data?.accessToken) {
      await setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) await setRefreshToken(res.data.refreshToken);
      await setStoredUser(res.data.user);
    }
    return res;
  },

  register: async (payload: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    if (res.data?.accessToken) {
      await setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) await setRefreshToken(res.data.refreshToken);
      await setStoredUser(res.data.user);
    }
    return res;
  },

  getMe: async () => {
    return api.get<{ success: boolean; data: User }>("/auth/me");
  },

  logout: async () => {
    await clearTokens();
  },
};
