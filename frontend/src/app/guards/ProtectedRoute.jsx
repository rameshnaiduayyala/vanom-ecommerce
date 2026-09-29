import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { ROUTES } from "../../constants/routes.js";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function B2BRoute({ children }) {
  const { isAuthenticated, user, isB2BApproved } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN") || hasRole("SUPERADMIN");

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (isAuthenticated && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
