import React, { lazy } from "react";
import { PublicLayout } from "../../layouts/public/PublicLayout.jsx";
import { RouteErrorBoundary } from "../../components/common/RouteErrorBoundary.jsx";

const HomePage = lazy(() =>
  import("../../features/storefront/pages/HomePage.jsx").then((m) => ({
    default: m.HomePage || m.default,
  }))
);
const ProductsPage = lazy(() =>
  import("../../features/storefront/pages/ProductsPage.jsx").then((m) => ({
    default: m.ProductsPage || m.default,
  }))
);
const ProductDetailsPage = lazy(() =>
  import("../../features/storefront/pages/ProductDetailsPage.jsx").then((m) => ({
    default: m.ProductDetailsPage || m.default,
  }))
);
const CartPage = lazy(() =>
  import("../../features/cart/pages/CartPage.jsx").then((m) => ({
    default: m.CartPage || m.default,
  }))
);
const CheckoutPage = lazy(() =>
  import("../../features/checkout/pages/CheckoutPage.jsx").then((m) => ({
    default: m.CheckoutPage || m.default,
  }))
);
const PaymentProcessingPage = lazy(() =>
  import("../../features/checkout/pages/PaymentPages.jsx").then((m) => ({
    default: m.PaymentProcessingPage,
  }))
);
const PaymentSuccessPage = lazy(() =>
  import("../../features/checkout/pages/PaymentPages.jsx").then((m) => ({
    default: m.PaymentSuccessPage,
  }))
);
const PaymentCancelledPage = lazy(() =>
  import("../../features/checkout/pages/PaymentPages.jsx").then((m) => ({
    default: m.PaymentCancelledPage,
  }))
);
const OrdersPage = lazy(() =>
  import("../../features/orders/pages/OrdersPage.jsx").then((m) => ({
    default: m.OrdersPage || m.default,
  }))
);
const OrderDetailsPage = lazy(() =>
  import("../../features/orders/pages/OrderDetailsPage.jsx").then((m) => ({
    default: m.OrderDetailsPage || m.default,
  }))
);
const WishlistPage = lazy(() =>
  import("../../features/wishlist/pages/WishlistPage.jsx").then((m) => ({
    default: m.WishlistPage || m.default,
  }))
);
const ContactPage = lazy(() =>
  import("../../features/storefront/pages/ContactPage.jsx").then((m) => ({
    default: m.ContactPage || m.default,
  }))
);
const ConsumerAccountPage = lazy(() =>
  import("../../features/account/pages/ConsumerAccountPage.jsx").then((m) => ({
    default: m.ConsumerAccountPage || m.default,
  }))
);
const LoginPage = lazy(() =>
  import("../../features/auth/pages/LoginPage.jsx").then((m) => ({
    default: m.LoginPage || m.default,
  }))
);
const RegisterPage = lazy(() =>
  import("../../features/auth/pages/RegisterPage.jsx").then((m) => ({
    default: m.RegisterPage || m.default,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import("../../features/auth/pages/ForgotPasswordPage.jsx").then((m) => ({
    default: m.ForgotPasswordPage || m.default,
  }))
);
const VerifyEmailPage = lazy(() =>
  import("../../features/auth/pages/VerifyEmailPage.jsx").then((m) => ({
    default: m.VerifyEmailPage || m.default,
  }))
);
const InvoiceVerificationPage = lazy(() =>
  import("../../features/storefront/pages/InvoiceVerificationPage.jsx").then((m) => ({
    default: m.InvoiceVerificationPage || m.default,
  }))
);

export const publicRoutes = {
  element: <PublicLayout />,
  errorElement: <RouteErrorBoundary />,
  children: [
    { path: "/", element: <HomePage /> },
    { path: "/products", element: <ProductsPage /> },
    { path: "/products/:slug", element: <ProductDetailsPage /> },
    { path: "/categories/:slug", element: <ProductsPage /> },
    { path: "/search", element: <ProductsPage /> },
    { path: "/contact", element: <ContactPage /> },
    { path: "/invoice/verify/:invoiceNumber", element: <InvoiceVerificationPage /> },
    { path: "/cart", element: <CartPage /> },
    { path: "/checkout", element: <CheckoutPage /> },
    { path: "/checkout/payment-processing", element: <PaymentProcessingPage /> },
    { path: "/checkout/payment-success", element: <PaymentSuccessPage /> },
    { path: "/checkout/payment-cancelled", element: <PaymentCancelledPage /> },
    { path: "/orders", element: <OrdersPage /> },
    { path: "/orders/:id", element: <OrderDetailsPage /> },
    { path: "/wishlist", element: <WishlistPage /> },
    { path: "/account", element: <ConsumerAccountPage /> },
    { path: "/account/profile", element: <ConsumerAccountPage /> },
    { path: "/account/addresses", element: <ConsumerAccountPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/verify-email", element: <VerifyEmailPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
  ],
};
