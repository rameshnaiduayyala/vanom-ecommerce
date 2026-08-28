import React from "react";
import { Navigate } from "react-router-dom";
import { B2BLayout } from "../../layouts/b2b/B2BLayout.jsx";
import { B2BDashboard } from "../../features/b2b/pages/B2BDashboard.jsx";
import { B2BCatalog } from "../../features/b2b/pages/B2BCatalog.jsx";
import { B2BProductDetails } from "../../features/b2b/pages/B2BProductDetails.jsx";
import { BulkOrder } from "../../features/b2b/pages/BulkOrder.jsx";
import { Quotes, QuoteDetails } from "../../features/b2b/pages/Quotes.jsx";
import {
  B2BOrders,
  CompanyProfile,
  CompanyDocuments,
  CompanyMembers,
} from "../../features/b2b/pages/B2BOrders.jsx";
import { B2BRoute } from "../guards/ProtectedRoute.jsx";

export const b2bRoutes = {
  path: "/b2b",
  element: (
    <B2BRoute>
      <B2BLayout />
    </B2BRoute>
  ),
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
