import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { Api, TokenStorage } from "@/services/index.js";
import { Spinner } from "../../components/ui/Alert.jsx";

export function AuthProvider({ children }) {
  const { setUser, logout } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = TokenStorage.getAccessToken();
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const data = await Api.auth.getMe();
        if (data?.user) {
          setUser(data.user);
          // Sync live cart from API on refresh
          fetchCart();
        }
      } catch (err) {
        console.warn("Auth initialization token check failed:", err.message);
        if (import.meta.env.VITE_USE_MOCK_API !== "true") {
          logout();
        }
      } finally {
        setInitializing(false);
      }
    }

    initAuth();
  }, [setUser, logout, fetchCart]);

  return children;
}
