import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryProvider } from "./QueryProvider.jsx";
import { AuthProvider } from "./AuthProvider.jsx";
import { ToastContainer } from "../../components/ui/Toast.jsx";
import { PremiumGlobalLoader } from "../../components/common/PremiumGlobalLoader.jsx";
import { FloatingCartBubble } from "../../features/cart/components/FloatingCartBubble.jsx";

export function AppProviders({ children }) {
  return (
    <HelmetProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToastContainer />
          <PremiumGlobalLoader />
          <FloatingCartBubble />
        </AuthProvider>
      </QueryProvider>
    </HelmetProvider>
  );
}

