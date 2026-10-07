import { api } from "../../lib/api";
import { setAccessToken, setRefreshToken, clearTokens, setStoredUser } from "../../lib/secure-store";





















export const authApi = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.accessToken) {
      await setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) await setRefreshToken(res.data.refreshToken);
      await setStoredUser(res.data.user);
    }
    return res;
  },

  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    if (res.data?.accessToken) {
      await setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) await setRefreshToken(res.data.refreshToken);
      await setStoredUser(res.data.user);
    }
    return res;
  },

  getMe: async () => {
    return api.get("/auth/me");
  },

  logout: async () => {
    await clearTokens();
  }
};