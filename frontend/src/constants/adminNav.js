import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Building2,
  FileCheck2,
  Warehouse,
  FileText,
  Megaphone,
  Tag,
  BarChart3,
  CreditCard,
  RotateCcw,
  Globe,
  Settings,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { ROUTES } from "./routes.js";

/**
 * Admin Navigation Configuration
 * Defines menu hierarchy, icons, routes, badges, and RBAC permissions.
 */
export const ADMIN_NAV_CONFIG = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.ADMIN.DASHBOARD,
    permission: "admin.dashboard",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    path: ROUTES.ADMIN.ORDERS,
    badge: 12,
    badgeColor: "bg-rose-500",
    permission: "admin.orders",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    permission: "catalog.read",
    children: [
      {
        id: "all-products",
        label: "All Products",
        path: ROUTES.ADMIN.PRODUCTS,
        permission: "catalog.read",
      },
      {
        id: "add-product",
        label: "Add Product",
        path: `${ROUTES.ADMIN.PRODUCTS}#new`,
        permission: "catalog.create",
      },
      {
        id: "categories",
        label: "Categories",
        path: `${ROUTES.ADMIN.PRODUCTS}?tab=categories`,
        permission: "catalog.read",
      },
      {
        id: "brands",
        label: "Brands",
        path: `${ROUTES.ADMIN.PRODUCTS}?tab=brands`,
        permission: "catalog.read",
      },
      {
        id: "pricing-tiers",
        label: "Pricing & Tiers",
        path: ROUTES.ADMIN.PRICING,
        permission: "pricing.read",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    path: ROUTES.ADMIN.USERS,
    permission: "admin.users",
  },
  {
    id: "companies",
    label: "Sellers & B2B",
    icon: Building2,
    path: ROUTES.ADMIN.COMPANIES,
    permission: "admin.companies",
  },
  {
    id: "applications",
    label: "Applications",
    icon: FileCheck2,
    path: ROUTES.ADMIN.BUSINESS_APPLICATIONS,
    permission: "companies.approve",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    permission: "inventory.read",
    children: [
      {
        id: "warehouse-stock",
        label: "Warehouse Stock",
        path: ROUTES.ADMIN.INVENTORY,
        permission: "inventory.read",
      },
    ],
  },
  {
    id: "quotes",
    label: "Wholesale Quotes",
    icon: FileText,
    path: ROUTES.ADMIN.QUOTES,
    permission: "quotes.read",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    children: [
      {
        id: "hero-banners",
        label: "Hero Banners",
        path: `${ROUTES.ADMIN.DASHBOARD}#banners`,
      },
      {
        id: "promotions",
        label: "Promotions",
        path: `${ROUTES.ADMIN.DASHBOARD}#promotions`,
      },
    ],
  },
  {
    id: "discounts",
    label: "Discounts & Coupons",
    icon: Tag,
    path: ROUTES.ADMIN.PRICING,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    path: ROUTES.ADMIN.REPORTS,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    path: ROUTES.ADMIN.PAYMENTS,
    permission: "payments.read",
  },
  {
    id: "returns",
    label: "Returns & Refunds",
    icon: RotateCcw,
    path: ROUTES.ADMIN.ORDERS,
  },
  {
    id: "cms",
    label: "CMS",
    icon: Globe,
    children: [
      {
        id: "store-pages",
        label: "Store Pages",
        path: ROUTES.HOME,
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        path: ROUTES.ADMIN.AUDIT_LOGS,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: ROUTES.ADMIN.AUDIT_LOGS,
  },
];
