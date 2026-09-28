import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { publicRoutes } from "./public.routes.jsx";
import { b2bRoutes } from "./b2b.routes.jsx";
import { adminRoutes } from "./admin.routes.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";
import { PageLoader } from "../../components/common/PageLoader.jsx";

const RegisterBusinessPage = lazy(() =>
  import("../../features/auth/pages/RegisterBusinessPage.jsx").then((m) => ({
    default: m.RegisterBusinessPage || m.default,
  }))
);

const BusinessPendingApprovalPage = lazy(() =>
  import("../../features/auth/pages/BusinessPendingApprovalPage.jsx").then((m) => ({
    default: m.BusinessPendingApprovalPage || m.default,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/register-business",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterBusinessPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register-business/pending-approval",
    element: (
      <Suspense fallback={<PageLoader />}>
        <BusinessPendingApprovalPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  publicRoutes,
  b2bRoutes,
  adminRoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);

