import React from "react";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/admin/AdminLayout.jsx";
import { Dashboard } from "../../features/admin/pages/Dashboard.jsx";
import { BusinessApplications } from "../../features/admin/pages/BusinessApplications.jsx";
import { CompanyReviewPage } from "../../features/admin/pages/CompanyReviewPage.jsx";
import { Products } from "../../features/admin/pages/Products.jsx";
import { AddProductPage } from "../../features/admin/pages/AddProductPage.jsx";
import { Orders } from "../../features/admin/pages/Inventory.jsx";
import {
  AdminQuotes,
  AdminPayments,
  AdminReports,
} from "../../features/admin/pages/Quotes.jsx";
import { AdminUsersPage } from "../../features/admin/pages/users/AdminUsersPage.jsx";
import { AdminCompaniesPage } from "../../features/admin/pages/companies/AdminCompaniesPage.jsx";
import { AdminCategoriesPage } from "../../features/admin/pages/categories/AdminCategoriesPage.jsx";
import { AdminAuditLogsPage } from "../../features/admin/pages/audit/AdminAuditLogsPage.jsx";
import { AdminInventoryPage } from "../../features/admin/pages/inventory/AdminInventoryPage.jsx";
import { AdminInventoryPrintPage } from "../../features/admin/pages/inventory/AdminInventoryPrintPage.jsx";
import { AdminBulkProductsPage } from "../../features/admin/pages/bulk-products/AdminBulkProductsPage.jsx";
import { AdminRoute } from "../guards/ProtectedRoute.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";

export const adminRoutes = {
  path: "/admin",
  element: (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  ),
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
    { path: "dashboard", element: <Dashboard /> },
    { path: "users", element: <AdminUsersPage /> },
    { path: "companies", element: <AdminCompaniesPage /> },
    { path: "companies/:id", element: <CompanyReviewPage /> },
    { path: "business-applications", element: <BusinessApplications /> },
    { path: "products", element: <Products /> },
    { path: "products/new", element: <AddProductPage /> },
    { path: "bulk-products", element: <AdminBulkProductsPage /> },
    { path: "categories", element: <AdminCategoriesPage /> },
    { path: "inventory", element: <AdminInventoryPage /> },
    { path: "inventory/print", element: <AdminInventoryPrintPage /> },
    { path: "orders", element: <Orders /> },
    { path: "quotes", element: <AdminQuotes /> },
    { path: "payments", element: <AdminPayments /> },
    { path: "reports", element: <AdminReports /> },
    { path: "audit-logs", element: <AdminAuditLogsPage /> },
  ],
};
