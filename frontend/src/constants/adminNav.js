import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  FolderTree,
  Users,
  Building2,
  FileCheck2,
  Boxes,
  FileText,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Briefcase,
  Store,
  Tag,
  BadgePercent,
  Bookmark,
} from "lucide-react";
import { ROUTES } from "./routes.js";

/**
 * Admin Navigation Configuration
 * Dedicated sections for:
 * 1. Overview (Dashboard)
 * 2. Retail (B2C) -> Products, Orders, Categories, Brands
 * 3. B2B (Wholesale) -> Products, Categories, Orders, Companies
 * 4. Operations & System -> Inventory, Retail Customers, Finance, Audit & Security
 */
export const ADMIN_NAV_CONFIG = [
  // ── OVERVIEW ──
  {
    header: "Overview",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.ADMIN.DASHBOARD,
  },

  // ── RETAIL (B2C) ──
  {
    header: "Retail",
  },
  {
    id: "retail-products-group",
    label: "Products",
    icon: Package,
    children: [
      {
        id: "retail-products-list",
        label: "All Products",
        path: ROUTES.ADMIN.PRODUCTS,
      },
      {
        id: "retail-products-add",
        label: "Add Product",
        icon: PlusCircle,
        path: ROUTES.ADMIN.PRODUCT_NEW,
      },
    ],
  },
  {
    id: "retail-orders-group",
    label: "Orders",
    icon: ShoppingBag,
    children: [
      {
        id: "retail-orders-all",
        label: "Master Orders Hub",
        path: ROUTES.ADMIN.ORDERS,
      },
      {
        id: "retail-orders-list",
        label: "Retail Orders",
        path: ROUTES.ADMIN.RETAIL_ORDERS,
      },
    ],
  },
  {
    id: "retail-categories",
    label: "Categories",
    icon: FolderTree,
    path: ROUTES.ADMIN.CATEGORIES,
  },
  {
    id: "retail-brands",
    label: "Brands",
    icon: Tag,
    path: `${ROUTES.ADMIN.CATEGORIES}?tab=brands`,
  },

  // ── B2B (WHOLESALE) ──
  {
    header: "B2B",
  },
  {
    id: "b2b-products-group",
    label: "Products",
    icon: Boxes,
    children: [
      {
        id: "b2b-products-list",
        label: "Bulk Products & Tiers",
        path: ROUTES.ADMIN.BULK_PRODUCTS,
      },
      {
        id: "b2b-quotes",
        label: "Custom Quotes / RFQ",
        icon: FileText,
        path: ROUTES.ADMIN.QUOTES,
      },
    ],
  },
  {
    id: "b2b-categories",
    label: "Categories",
    icon: FolderTree,
    path: `${ROUTES.ADMIN.CATEGORIES}?channel=b2b`,
  },
  {
    id: "b2b-orders",
    label: "Orders",
    icon: Briefcase,
    path: ROUTES.ADMIN.BULK_ORDERS,
  },
  {
    id: "b2b-companies-group",
    label: "Companies",
    icon: Building2,
    children: [
      {
        id: "companies-directory",
        label: "Company Directory",
        path: ROUTES.ADMIN.COMPANIES,
      },
      {
        id: "companies-add",
        label: "Register Company",
        icon: PlusCircle,
        path: `${ROUTES.ADMIN.COMPANIES}?action=new`,
      },
      {
        id: "companies-verification",
        label: "Verification Queue",
        icon: FileCheck2,
        path: ROUTES.ADMIN.BUSINESS_APPLICATIONS,
        badge: "Review",
        badgeColor: "bg-amber-500",
      },
    ],
  },

  // ── OPERATIONS & SYSTEM ──
  {
    header: "Operations & Admin",
  },
  {
    id: "inventory",
    label: "Inventory & Stock",
    icon: Boxes,
    path: ROUTES.ADMIN.INVENTORY,
  },
  {
    id: "customers-group",
    label: "Retail Customers",
    icon: Users,
    children: [
      {
        id: "users-list",
        label: "Customer Directory",
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
    id: "finance-group",
    label: "Finance & Invoices",
    icon: CreditCard,
    children: [
      {
        id: "payments",
        label: "Payments & Transactions",
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
    id: "system-audit",
    label: "Audit & Security",
    icon: ShieldCheck,
    path: ROUTES.ADMIN.AUDIT_LOGS,
  },
];



