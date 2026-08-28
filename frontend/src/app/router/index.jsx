import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { publicRoutes } from "./public.routes.jsx";
import { b2bRoutes } from "./b2b.routes.jsx";
import { admUSDoutes } from "./admin.routes.jsx";

export const router = createBrowserRouter([
  publicRoutes,
  b2bRoutes,
  admUSDoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);
