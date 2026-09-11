import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryProvider } from "./QueryProvider.jsx";
import { AuthProvider } from "./AuthProvider.jsx";
import { ToastContainer } from "../../components/ui/Toast.jsx";

export function AppProviders({ children }) {
  return (
    <HelmetProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </QueryProvider>
    </HelmetProvider>
  );
}

