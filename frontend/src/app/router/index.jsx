import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { publicRoutes } from "./public.routes.jsx";
import { b2bRoutes } from "./b2b.routes.jsx";
import { adminRoutes } from "./admin.routes.jsx";

export const router = createBrowserRouter([
  publicRoutes,
  b2bRoutes,
  adminRoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);
