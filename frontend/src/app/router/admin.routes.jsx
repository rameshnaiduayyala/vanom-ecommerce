import React from "react";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/admin/AdminLayout.jsx";
import { Dashboard, BusinessApplications } from "../../features/admin/pages/Dashboard.jsx";
import { CompanyReviewPage } from "../../features/admin/pages/CompanyReviewPage.jsx";
import { Products, Pricing } from "../../features/admin/pages/Products.jsx";
import { Inventory, Orders } from "../../features/admin/pages/Inventory.jsx";
import {
  AdminQuotes,
  AdminPayments,
  AdminReports,
  AdminAuditLogs,
  AdminUsers,
  AdminCompanies,
} from "../../features/admin/pages/Quotes.jsx";
import { AdminRoute } from "../guards/ProtectedRoute.jsx";

export const adminRoutes = {
  path: "/admin",
  element: (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  ),
  children: [
    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
    { path: "dashboard", element: <Dashboard /> },
    { path: "users", element: <AdminUsers /> },
    { path: "companies", element: <AdminCompanies /> },
    { path: "companies/:id", element: <CompanyReviewPage /> },
    { path: "business-applications", element: <BusinessApplications /> },
    { path: "products", element: <Products /> },
    { path: "pricing", element: <Pricing /> },
    { path: "inventory", element: <Inventory /> },
    { path: "orders", element: <Orders /> },
    { path: "quotes", element: <AdminQuotes /> },
    { path: "payments", element: <AdminPayments /> },
    { path: "reports", element: <AdminReports /> },
    { path: "audit-logs", element: <AdminAuditLogs /> },
  ],
};
