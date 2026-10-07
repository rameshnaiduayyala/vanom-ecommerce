import { getAccessToken, clearTokens } from "./secure-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.1.44:3000/api/v1";

async function request(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // secure store fallback
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await clearTokens();
    }

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      const message =
        errorData?.message || errorData?.error || `API error: ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return await response.json();
  } catch (err) {
    console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  get: (path, options) => request(path, { method: "GET", ...options }),
  post: (path, body, options) =>
    request(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: (path, body, options) =>
    request(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: (path, body, options) =>
    request(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: (path, options) => request(path, { method: "DELETE", ...options }),
};
