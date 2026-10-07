import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "vanom_access_token";
const REFRESH_TOKEN_KEY = "vanom_refresh_token";
const USER_KEY = "vanom_user_data";

export async function getAccessToken() {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  }
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  }
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearTokens() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function setStoredUser(user) {
  const json = JSON.stringify(user);
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") localStorage.setItem(USER_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, json);
}

export async function getStoredUser() {
  let json = null;
  if (Platform.OS === "web") {
    json = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
  } else {
    json = await SecureStore.getItemAsync(USER_KEY);
  }
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}