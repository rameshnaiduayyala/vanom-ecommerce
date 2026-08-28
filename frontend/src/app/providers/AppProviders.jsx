import React from "react";
import { QueryProvider } from "./QueryProvider.jsx";
import { AuthProvider } from "./AuthProvider.jsx";
import { ToastContainer } from "../../components/ui/Toast.jsx";

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </QueryProvider>
  );
}
