import { getAccessToken, clearTokens } from "./secure-store";

export const API_BASE_URL =
process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";






async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-country-code": "IN",
    "x-currency-code": "INR",
    ...(options.headers || {})
  };

  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
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
    const message = errorData?.message || errorData?.error || `API error: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  get: (path, options) =>
  request(path, { method: "GET", ...options }),
  post: (path, body, options) =>
  request(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options
  }),
  put: (path, body, options) =>
  request(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options
  }),
  patch: (path, body, options) =>
  request(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options
  }),
  delete: (path, options) =>
  request(path, { method: "DELETE", ...options })
};