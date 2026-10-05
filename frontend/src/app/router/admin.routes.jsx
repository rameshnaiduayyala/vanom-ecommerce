import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AdminRoute } from "../guards/ProtectedRoute.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";
import { PageLoader } from "../../components/common/PageLoader.jsx";

const AdminLayout = lazy(() => import("../../layouts/admin/AdminLayout.jsx"));


const AdminDashboardPage = lazy(() =>
  import("../../features/admin/pages/dashboard/AdminDashboardPage.jsx").then((m) => ({
    default: m.AdminDashboardPage || m.default,
  }))
);
const BusinessApplications = lazy(() =>
  import("../../features/admin/pages/BusinessApplications.jsx").then((m) => ({
    default: m.BusinessApplications || m.default,
  }))
);
const CompanyReviewPage = lazy(() =>
  import("../../features/admin/pages/CompanyReviewPage.jsx").then((m) => ({
    default: m.CompanyReviewPage || m.default,
  }))
);
const AdminProductsPage = lazy(() =>
  import("../../features/admin/pages/products/AdminProductsPage.jsx").then((m) => ({
    default: m.AdminProductsPage || m.default,
  }))
);
const AdminAddProductPage = lazy(() =>
  import("../../features/admin/pages/products/AdminAddProductPage.jsx").then((m) => ({
    default: m.AdminAddProductPage || m.default,
  }))
);
const AdminOrdersPage = lazy(() =>
  import("../../features/admin/pages/orders/AdminOrdersPage.jsx").then((m) => ({
    default: m.AdminOrdersPage || m.default,
  }))
);
const AdminRetailOrdersPage = lazy(() =>
  import("../../features/admin/pages/orders/AdminRetailOrdersPage.jsx").then((m) => ({
    default: m.AdminRetailOrdersPage || m.default,
  }))
);
const AdminBulkOrdersPage = lazy(() =>
  import("../../features/admin/pages/orders/AdminBulkOrdersPage.jsx").then((m) => ({
    default: m.AdminBulkOrdersPage || m.default,
  }))
);
const AdminQuotesPage = lazy(() =>
  import("../../features/admin/pages/quotes/AdminQuotesPage.jsx").then((m) => ({
    default: m.AdminQuotesPage || m.default,
  }))
);
const AdminPaymentsPage = lazy(() =>
  import("../../features/admin/pages/payments/AdminPaymentsPage.jsx").then((m) => ({
    default: m.AdminPaymentsPage || m.default,
  }))
);
const AdminReportsPage = lazy(() =>
  import("../../features/admin/pages/reports/AdminReportsPage.jsx").then((m) => ({
    default: m.AdminReportsPage || m.default,
  }))
);
const AdminUsersPage = lazy(() =>
  import("../../features/admin/pages/users/AdminUsersPage.jsx").then((m) => ({
    default: m.AdminUsersPage || m.default,
  }))
);
const AdminCompaniesPage = lazy(() =>
  import("../../features/admin/pages/companies/AdminCompaniesPage.jsx").then((m) => ({
    default: m.AdminCompaniesPage || m.default,
  }))
);
const AdminCategoriesPage = lazy(() =>
  import("../../features/admin/pages/categories/AdminCategoriesPage.jsx").then((m) => ({
    default: m.AdminCategoriesPage || m.default,
  }))
);
const AdminAuditLogsPage = lazy(() =>
  import("../../features/admin/pages/audit/AdminAuditLogsPage.jsx").then((m) => ({
    default: m.AdminAuditLogsPage || m.default,
  }))
);
const AdminInventoryPage = lazy(() =>
  import("../../features/admin/pages/inventory/AdminInventoryPage.jsx").then((m) => ({
    default: m.AdminInventoryPage || m.default,
  }))
);
const AdminInventoryPrintPage = lazy(() =>
  import("../../features/admin/pages/inventory/AdminInventoryPrintPage.jsx").then((m) => ({
    default: m.AdminInventoryPrintPage || m.default,
  }))
);
const AdminBulkProductsPage = lazy(() =>
  import("../../features/admin/pages/bulk-products/AdminBulkProductsPage.jsx").then((m) => ({
    default: m.AdminBulkProductsPage || m.default,
  }))
);
const AdminBrandsPage = lazy(() =>
  import("../../features/admin/pages/brands/AdminBrandsPage.jsx").then((m) => ({
    default: m.AdminBrandsPage || m.default,
  }))
);
const AdminBulkCategoriesPage = lazy(() =>
  import("../../features/admin/pages/categories/AdminBulkCategoriesPage.jsx").then((m) => ({
    default: m.AdminBulkCategoriesPage || m.default,
  }))
);
const AdminStoreSettingsPage = lazy(() =>
  import("../../features/admin/pages/store/AdminStoreSettingsPage.jsx").then((m) => ({
    default: m.AdminStoreSettingsPage || m.default,
  }))
);
const AdminContactMessagesPage = lazy(() =>
  import("../../features/admin/pages/messages/AdminContactMessagesPage.jsx").then((m) => ({
    default: m.AdminContactMessagesPage || m.default,
  }))
);
const AdminShipmentsPage = lazy(() =>
  import("../../features/admin/pages/shipping/AdminShipmentsPage.jsx").then((m) => ({
    default: m.AdminShipmentsPage || m.default,
  }))
);
const AdminFilesPage = lazy(() =>
  import("../../features/admin/pages/files/AdminFilesPage.jsx").then((m) => ({
    default: m.AdminFilesPage || m.default,
  }))
);

export const adminRoutes = {
  path: "/admin",
  element: (
    <AdminRoute>
      <Suspense fallback={<PageLoader />}>
        <AdminLayout />
      </Suspense>
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
    { path: "shipments", element: <AdminShipmentsPage /> },
    { path: "store", element: <AdminStoreSettingsPage /> },
    { path: "messages", element: <AdminContactMessagesPage /> },
    { path: "files", element: <AdminFilesPage /> },
  ],
};
