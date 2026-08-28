import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store.js";
import { Api } from "../../services/api/api-client.js";
import { TokenStorage } from "../../services/storage/token.storage.js";
import { Spinner } from "../../components/ui/Alert.jsx";

export function AuthProvider({ children }) {
  const { setUser, logout } = useAuthStore();
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
        }
      } catch (err) {
        console.warn("Auth initialization token check failed:", err.message);
        // Do not force logout in mock mode
        if (import.meta.env.VITE_USE_MOCK_API !== "true") {
          logout();
        }
      } finally {
        setInitializing(false);
      }
    }

    initAuth();
  }, [setUser, logout]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  return children;
}
