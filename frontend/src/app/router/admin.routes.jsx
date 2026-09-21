import React from "react";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "../../layouts/admin/AdminLayout.jsx";
import { AdminDashboardPage } from "../../features/admin/pages/dashboard/AdminDashboardPage.jsx";
import { BusinessApplications } from "../../features/admin/pages/BusinessApplications.jsx";
import { CompanyReviewPage } from "../../features/admin/pages/CompanyReviewPage.jsx";
import { AdminProductsPage } from "../../features/admin/pages/products/AdminProductsPage.jsx";
import { AdminAddProductPage } from "../../features/admin/pages/products/AdminAddProductPage.jsx";
import { AdminOrdersPage } from "../../features/admin/pages/orders/AdminOrdersPage.jsx";
import { AdminRetailOrdersPage } from "../../features/admin/pages/orders/AdminRetailOrdersPage.jsx";
import { AdminBulkOrdersPage } from "../../features/admin/pages/orders/AdminBulkOrdersPage.jsx";
import { AdminQuotesPage } from "../../features/admin/pages/quotes/AdminQuotesPage.jsx";
import { AdminPaymentsPage } from "../../features/admin/pages/payments/AdminPaymentsPage.jsx";
import { AdminReportsPage } from "../../features/admin/pages/reports/AdminReportsPage.jsx";
import { AdminUsersPage } from "../../features/admin/pages/users/AdminUsersPage.jsx";
import { AdminCompaniesPage } from "../../features/admin/pages/companies/AdminCompaniesPage.jsx";
import { AdminCategoriesPage } from "../../features/admin/pages/categories/AdminCategoriesPage.jsx";
import { AdminAuditLogsPage } from "../../features/admin/pages/audit/AdminAuditLogsPage.jsx";
import { AdminInventoryPage } from "../../features/admin/pages/inventory/AdminInventoryPage.jsx";
import { AdminInventoryPrintPage } from "../../features/admin/pages/inventory/AdminInventoryPrintPage.jsx";
import { AdminBulkProductsPage } from "../../features/admin/pages/bulk-products/AdminBulkProductsPage.jsx";
import { AdminBrandsPage } from "../../features/admin/pages/brands/AdminBrandsPage.jsx";
import { AdminBulkCategoriesPage } from "../../features/admin/pages/categories/AdminBulkCategoriesPage.jsx";
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
    { path: "dashboard", element: <AdminDashboardPage /> },
    { path: "users", element: <AdminUsersPage /> },
    { path: "companies", element: <AdminCompaniesPage /> },
    { path: "companies/:id", element: <CompanyReviewPage /> },
    { path: "business-applications", element: <BusinessApplications /> },
    { path: "products", element: <AdminProductsPage /> },
    { path: "products/new", element: <AdminAddProductPage /> },
    { path: "bulk-products", element: <AdminBulkProductsPage /> },
    { path: "categories", element: <AdminCategoriesPage /> },
    { path: "bulk-categories", element: <AdminBulkCategoriesPage /> },
    { path: "brands", element: <AdminBrandsPage /> },
    { path: "inventory", element: <AdminInventoryPage /> },
    { path: "inventory/print", element: <AdminInventoryPrintPage /> },
    { path: "orders", element: <AdminOrdersPage /> },
    { path: "retail-orders", element: <AdminRetailOrdersPage /> },
    { path: "bulk-orders", element: <AdminBulkOrdersPage /> },
    { path: "quotes", element: <AdminQuotesPage /> },
    { path: "payments", element: <AdminPaymentsPage /> },
    { path: "reports", element: <AdminReportsPage /> },
    { path: "audit-logs", element: <AdminAuditLogsPage /> },
  ],
};
