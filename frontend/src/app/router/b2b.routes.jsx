import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { B2BRoute } from "../guards/ProtectedRoute.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";
import { PageLoader } from "../../components/common/PageLoader.jsx";

const B2BLayout = lazy(() => import("../../layouts/b2b/B2BLayout.jsx"));


const B2BDashboard = lazy(() =>
  import("../../features/b2b/pages/B2BDashboard.jsx").then((m) => ({
    default: m.B2BDashboard || m.default,
  }))
);
const B2BCatalog = lazy(() =>
  import("../../features/b2b/pages/B2BCatalog.jsx").then((m) => ({
    default: m.B2BCatalog || m.default,
  }))
);
const B2BProductDetails = lazy(() =>
  import("../../features/b2b/pages/B2BProductDetails.jsx").then((m) => ({
    default: m.B2BProductDetails || m.default,
  }))
);
const BulkOrder = lazy(() =>
  import("../../features/b2b/pages/BulkOrder.jsx").then((m) => ({
    default: m.BulkOrder || m.default,
  }))
);
const Quotes = lazy(() =>
  import("../../features/b2b/pages/Quotes.jsx").then((m) => ({
    default: m.Quotes,
  }))
);
const QuoteDetails = lazy(() =>
  import("../../features/b2b/pages/Quotes.jsx").then((m) => ({
    default: m.QuoteDetails,
  }))
);
const B2BOrders = lazy(() =>
  import("../../features/b2b/pages/orders/B2BOrdersPage.jsx").then((m) => ({
    default: m.B2BOrdersPage || m.default,
  }))
);
const CompanyProfile = lazy(() =>
  import("../../features/b2b/pages/company/B2BCompanyProfilePage.jsx").then((m) => ({
    default: m.B2BCompanyProfilePage || m.default,
  }))
);
const CompanyDocuments = lazy(() =>
  import("../../features/b2b/pages/company/B2BCompanyDocumentsPage.jsx").then((m) => ({
    default: m.B2BCompanyDocumentsPage || m.default,
  }))
);
const CompanyMembers = lazy(() =>
  import("../../features/b2b/pages/company/B2BCompanyMembersPage.jsx").then((m) => ({
    default: m.B2BCompanyMembersPage || m.default,
  }))
);

export const b2bRoutes = {
  path: "/b2b",
  element: (
    <B2BRoute>
      <Suspense fallback={<PageLoader />}>
        <B2BLayout />
      </Suspense>
    </B2BRoute>
  ),
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="/b2b/dashboard" replace /> },
    { path: "dashboard", element: <B2BDashboard /> },
    { path: "catalog", element: <B2BCatalog /> },
    { path: "catalog/:slug", element: <B2BProductDetails /> },
    { path: "bulk-order", element: <BulkOrder /> },
    { path: "quotes", element: <Quotes /> },
    { path: "quotes/:id", element: <QuoteDetails /> },
    { path: "orders", element: <B2BOrders /> },
    { path: "orders/:id", element: <B2BOrders /> },
    { path: "company", element: <CompanyProfile /> },
    { path: "company/profile", element: <CompanyProfile /> },
    { path: "company/documents", element: <CompanyDocuments /> },
    { path: "company/members", element: <CompanyMembers /> },
    { path: "account", element: <CompanyProfile /> },
  ],
};
