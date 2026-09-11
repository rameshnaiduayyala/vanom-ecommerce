import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { publicRoutes } from "./public.routes.jsx";
import { b2bRoutes } from "./b2b.routes.jsx";
import { adminRoutes } from "./admin.routes.jsx";
import { RegisterBusinessPage } from "../../features/auth/pages/RegisterBusinessPage.jsx";
import { BusinessPendingApprovalPage } from "../../features/auth/pages/BusinessPendingApprovalPage.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";

export const router = createBrowserRouter([
  {
    path: "/register-business",
    element: <RegisterBusinessPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register-business/pending-approval",
    element: <BusinessPendingApprovalPage />,
    errorElement: <RouteErrorBoundary />,
  },
  publicRoutes,
  b2bRoutes,
  adminRoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);
