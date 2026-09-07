import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  FolderTree,
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
  // ── CORE ──
  {
    header: "Main",
  },
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

  // ── CATALOG MANAGEMENT ──
  {
    header: "Catalog & Inventory",
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
        icon: PlusCircle,
        path: "/admin/products/new",
        permission: "catalog.create",
      },
      {
        id: "categories",
        label: "Categories",
        icon: FolderTree,
        path: `${ROUTES.ADMIN.PRODUCTS}?tab=categories`,
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
    id: "inventory",
    label: "Warehouse & Stock",
    icon: Warehouse,
    path: ROUTES.ADMIN.INVENTORY,
    permission: "inventory.read",
  },

  // ── B2B WHOLESALE & CUSTOMERS ──
  {
    header: "B2B & Customer CRM",
  },
  {
    id: "applications",
    label: "Business Approvals",
    icon: FileCheck2,
    path: ROUTES.ADMIN.BUSINESS_APPLICATIONS,
    badge: 3,
    badgeColor: "bg-amber-500",
    permission: "companies.approve",
  },
  {
    id: "companies",
    label: "Sellers & B2B Accounts",
    icon: Building2,
    path: ROUTES.ADMIN.COMPANIES,
    permission: "admin.companies",
  },
  {
    id: "customers",
    label: "Customers & Users",
    icon: Users,
    path: ROUTES.ADMIN.USERS,
    permission: "admin.users",
  },
  {
    id: "quotes",
    label: "Wholesale RFQ Quotes",
    icon: FileText,
    path: ROUTES.ADMIN.QUOTES,
    permission: "quotes.read",
  },

  // ── SALES & FINANCE ──
  {
    header: "Finance & Analytics",
  },
  {
    id: "payments",
    label: "Payments & Invoices",
    icon: CreditCard,
    path: ROUTES.ADMIN.PAYMENTS,
    permission: "payments.read",
  },
  {
    id: "reports",
    label: "Revenue & Tax Reports",
    icon: BarChart3,
    path: ROUTES.ADMIN.REPORTS,
  },

  // ── SYSTEM ──
  {
    header: "System & Governance",
  },
  {
    id: "audit-logs",
    label: "Audit Logs & Security",
    icon: ShieldCheck,
    path: ROUTES.ADMIN.AUDIT_LOGS,
  },
];

