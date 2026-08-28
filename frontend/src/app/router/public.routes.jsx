import React from "react";
import { PublicLayout } from "../../layouts/public/PublicLayout.jsx";
import { HomePage } from "../../features/storefront/pages/HomePage.jsx";
import { ProductsPage } from "../../features/storefront/pages/ProductsPage.jsx";
import { ProductDetailsPage } from "../../features/storefront/pages/ProductDetailsPage.jsx";
import { CartPage } from "../../features/cart/pages/CartPage.jsx";
import { CheckoutPage } from "../../features/checkout/pages/CheckoutPage.jsx";
import { OrdersPage } from "../../features/orders/pages/OrdersPage.jsx";
import { OrderDetailsPage } from "../../features/orders/pages/OrderDetailsPage.jsx";
import { WishlistPage } from "../../features/wishlist/pages/WishlistPage.jsx";
import { LoginPage } from "../../features/auth/pages/LoginPage.jsx";
import { RegisterPage, ForgotPasswordPage } from "../../features/auth/pages/RegisterPage.jsx";

export const publicRoutes = {
  element: <PublicLayout />,
  children: [
    { path: "/", element: <HomePage /> },
    { path: "/products", element: <ProductsPage /> },
    { path: "/products/:slug", element: <ProductDetailsPage /> },
    { path: "/categories/:slug", element: <ProductsPage /> },
    { path: "/search", element: <ProductsPage /> },
    { path: "/cart", element: <CartPage /> },
    { path: "/checkout", element: <CheckoutPage /> },
    { path: "/orders", element: <OrdersPage /> },
    { path: "/orders/:id", element: <OrderDetailsPage /> },
    { path: "/wishlist", element: <WishlistPage /> },
    { path: "/account", element: <OrdersPage /> },
    { path: "/account/profile", element: <OrdersPage /> },
    { path: "/account/addresses", element: <OrdersPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
  ],
};
