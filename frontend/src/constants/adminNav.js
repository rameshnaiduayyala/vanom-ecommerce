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
  BarChart3,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "./routes.js";

/**
 * Admin Navigation Configuration
 * Simple, clean structure with intuitive sub-items.
 */
export const ADMIN_NAV_CONFIG = [
  // ── MAIN ──
  {
    header: "Main",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.ADMIN.DASHBOARD,
  },
  {
    id: "orders-group",
    label: "Orders",
    icon: ShoppingCart,
    badge: 43,
    badgeColor: "bg-emerald-600",
    children: [
      {
        id: "all-orders",
        label: "All Orders",
        path: ROUTES.ADMIN.ORDERS,
      },
      {
        id: "orders-retail",
        label: "Retail Orders",
        path: `${ROUTES.ADMIN.ORDERS}?type=B2C`,
      },
      {
        id: "orders-wholesale",
        label: "Wholesale Orders",
        path: `${ROUTES.ADMIN.ORDERS}?type=B2B`,
      },
    ],
  },

  // ── CATALOG & INVENTORY ──
  {
    header: "Catalog & Stock",
  },
  {
    id: "products-group",
    label: "Products",
    icon: Package,
    children: [
      {
        id: "all-products",
        label: "All Products",
        path: ROUTES.ADMIN.PRODUCTS,
      },
      {
        id: "add-product",
        label: "Add Product",
        icon: PlusCircle,
        path: ROUTES.ADMIN.PRODUCT_NEW,
      },
      {
        id: "categories",
        label: "Categories",
        icon: FolderTree,
        path: `${ROUTES.ADMIN.PRODUCTS}?tab=categories`,
      },
      {
        id: "pricing-tiers",
        label: "Pricing & Tiers",
        path: ROUTES.ADMIN.PRICING,
      },
    ],
  },
  {
    id: "inventory-group",
    label: "Inventory",
    icon: Warehouse,
    children: [
      {
        id: "stock-overview",
        label: "Stock Overview",
        path: ROUTES.ADMIN.INVENTORY,
      },
      {
        id: "warehouses",
        label: "Warehouses",
        path: `${ROUTES.ADMIN.INVENTORY}?tab=warehouses`,
      },
    ],
  },

  // ── ACCOUNTS & CORPORATE ──
  {
    header: "Accounts & Directory",
  },
  {
    id: "customers-group",
    label: "Customers",
    icon: Users,
    children: [
      {
        id: "users-list",
        label: "List Customers",
        path: ROUTES.ADMIN.USERS,
      },
      {
        id: "users-add",
        label: "Add Customer",
        icon: PlusCircle,
        path: `${ROUTES.ADMIN.USERS}?action=new`,
      },
    ],
  },
  {
    id: "companies-group",
    label: "Companies",
    icon: Building2,
    children: [
      {
        id: "companies-list",
        label: "List Companies",
        path: ROUTES.ADMIN.COMPANIES,
      },
      {
        id: "companies-add",
        label: "Add Company",
        icon: PlusCircle,
        path: `${ROUTES.ADMIN.COMPANIES}?action=new`,
      },
      {
        id: "companies-approvals",
        label: "Verification Queue",
        icon: FileCheck2,
        path: ROUTES.ADMIN.BUSINESS_APPLICATIONS,
        badge: 3,
        badgeColor: "bg-amber-500",
      },
      {
        id: "quotes",
        label: "Wholesale Quotes",
        icon: FileText,
        path: ROUTES.ADMIN.QUOTES,
      },
    ],
  },

  // ── FINANCE & SYSTEM ──
  {
    header: "Finance & Security",
  },
  {
    id: "finance-group",
    label: "Finance",
    icon: CreditCard,
    children: [
      {
        id: "payments",
        label: "Payments & Invoices",
        path: ROUTES.ADMIN.PAYMENTS,
      },
      {
        id: "reports",
        label: "Revenue Reports",
        icon: BarChart3,
        path: ROUTES.ADMIN.REPORTS,
      },
    ],
  },
  {
    id: "system-group",
    label: "System",
    icon: ShieldCheck,
    children: [
      {
        id: "audit-logs",
        label: "Audit Logs & Security",
        path: ROUTES.ADMIN.AUDIT_LOGS,
      },
    ],
  },
];

