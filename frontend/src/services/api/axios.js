import axios from "axios";
import { TokenStorage } from "../storage/token.storage.js";
import { useCountryStore } from "../../stores/country.store.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: Attach Auth Token + Regional Context
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const { country } = useCountryStore.getState();
    if (country) {
      config.headers["x-country-code"] = country.code;
      config.headers["x-currency-code"] = country.currency;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Refresh Rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Backend standard is ApiResponse.success(data) -> { success: true, data: { ... } }
    if (response.data && typeof response.data === "object" && "data" in response.data && "success" in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        TokenStorage.clear();
        isRefreshing = false;
        const apiError = error.response?.data?.error;
        if (apiError) {
          const customErr = new Error(apiError.message || apiError.code || "Unauthorized");
          customErr.code = apiError.code;
          customErr.details = apiError.details;
          customErr.requestId = error.response?.data?.requestId || apiError.requestId;
          return Promise.reject(customErr);
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        TokenStorage.setAccessToken(accessToken);
        if (newRefreshToken) TokenStorage.setRefreshToken(newRefreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        TokenStorage.clear();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError = error.response?.data?.error;
    if (apiError) {
      const customErr = new Error(apiError.message || apiError.code || "An unexpected error occurred");
      customErr.code = apiError.code;
      customErr.details = apiError.details;
      customErr.requestId = apiError.requestId;
      return Promise.reject(customErr);
    }

    return Promise.reject(error.response?.data || error);
  }
);
