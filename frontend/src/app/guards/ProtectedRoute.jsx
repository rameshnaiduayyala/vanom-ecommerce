import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated && import.meta.env.VITE_USE_MOCK_API !== "true") {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function B2BRoute({ children }) {
  const { isAuthenticated, user, isB2BApproved } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated && import.meta.env.VITE_USE_MOCK_API !== "true") {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN");

  if (!isAuthenticated && import.meta.env.VITE_USE_MOCK_API !== "true") {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
