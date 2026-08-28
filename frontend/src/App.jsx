import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { RegionProvider } from "./context/RegionContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import StorefrontLayout from "./apps/storefront/layout/StorefrontLayout.jsx";
import HomePage from "./apps/storefront/pages/HomePage.jsx";
import ProductsPage from "./apps/storefront/pages/ProductsPage.jsx";
import ProductPage from "./apps/storefront/pages/ProductPage.jsx";
import CartPage from "./apps/storefront/pages/CartPage.jsx";
import CheckoutPage from "./apps/storefront/pages/CheckoutPage.jsx";

import B2BLayout from "./apps/b2b/layout/B2BLayout.jsx";
import BulkCatalogPage from "./apps/b2b/pages/BulkCatalogPage.jsx";
import WholesaleProductPage from "./apps/b2b/pages/WholesaleProductPage.jsx";
import CompanyRegisterPage from "./apps/b2b/pages/CompanyRegisterPage.jsx";
import CompanyDashboardPage from "./apps/b2b/pages/CompanyDashboardPage.jsx";
import QuoteRequestPage from "./apps/b2b/pages/QuoteRequestPage.jsx";
import B2BOrdersPage from "./apps/b2b/pages/B2BOrdersPage.jsx";
import B2BQuotesPage from "./apps/b2b/pages/B2BQuotesPage.jsx";

import AdminLayout from "./apps/admin/layout/AdminLayout.jsx";
import AdminDashboard from "./apps/admin/pages/DashboardPage.jsx";
import BusinessApplicationsPage from "./apps/admin/pages/BusinessApplicationsPage.jsx";
import CompanyReviewPage from "./apps/admin/pages/CompanyReviewPage.jsx";
import CustomersPage from "./apps/admin/pages/CustomersPage.jsx";
import AdminProductsPage from "./apps/admin/pages/ProductsPage.jsx";
import PricingPage from "./apps/admin/pages/PricingPage.jsx";
import InventoryPage from "./apps/admin/pages/InventoryPage.jsx";
import OrdersPage from "./apps/admin/pages/OrdersPage.jsx";
import ReportsPage from "./apps/admin/pages/ReportsPage.jsx";

function AuthGuard({ children }) {
  return children;
}

function B2BGuard({ children }) {
  // Production: verify authenticated user + approved company status from backend.
  return children;
}

function AdminGuard({ children }) {
  // Production: verify role + permissions from backend.
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          <Route path="/b2b" element={<AuthGuard><B2BGuard><B2BLayout /></B2BGuard></AuthGuard>}>
            <Route index element={<BulkCatalogPage />} />
            <Route path="product/:id" element={<WholesaleProductPage />} />
            <Route path="orders" element={<B2BOrdersPage />} />
            <Route path="quotes" element={<B2BQuotesPage />} />
          </Route>

          <Route path="/company/register" element={<StorefrontLayout />}><Route index element={<CompanyRegisterPage />} /></Route>
          <Route path="/company/dashboard" element={<AuthGuard><B2BGuard><B2BLayout /></B2BGuard></AuthGuard>}><Route index element={<CompanyDashboardPage />} /></Route>
          <Route path="/quote/request" element={<AuthGuard><B2BGuard><B2BLayout /></B2BGuard></AuthGuard>}><Route index element={<QuoteRequestPage />} /></Route>

          <Route path="/admin" element={<AuthGuard><AdminGuard><AdminLayout /></AdminGuard></AuthGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="business-applications" element={<BusinessApplicationsPage />} />
            <Route path="companies/:id" element={<CompanyReviewPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RegionProvider>
    </AuthProvider>
  );
}
