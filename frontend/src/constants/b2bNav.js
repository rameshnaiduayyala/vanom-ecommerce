import {
  LayoutDashboard,
  Layers,
  Boxes,
  FileSpreadsheet,
  PackageCheck,
  Building2,
  FileText,
  Users,
} from "lucide-react";
import { ROUTES } from "./routes.js";

/**
 * B2B Wholesale Navigation Configuration
 * Structured into clean enterprise navigation groups.
 */
export const B2B_NAV_CONFIG = [
  // ── CORE COMMERCE ──
  {
    header: "Wholesale Commerce",
  },
  {
    id: "b2b-dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    path: ROUTES.B2B.DASHBOARD,
  },
  {
    id: "b2b-catalog",
    label: "Product Catalog",
    icon: Layers,
    path: ROUTES.B2B.CATALOG,
  },
  {
    id: "b2b-bulk-order",
    label: "Bulk & Pallet Order",
    icon: Boxes,
    path: ROUTES.B2B.BULK_ORDER,
    badge: "Matrix",
    badgeColor: "bg-amber-500",
  },
  {
    id: "b2b-quotes",
    label: "Quotes & RFQ",
    icon: FileSpreadsheet,
    path: ROUTES.B2B.QUOTES,
  },
  {
    id: "b2b-orders",
    label: "Wholesale Orders",
    icon: PackageCheck,
    path: ROUTES.B2B.ORDERS,
  },

  // ── ORGANIZATION & COMPLIANCE ──
  {
    header: "Enterprise Account",
  },
  {
    id: "b2b-company",
    label: "Organization",
    icon: Building2,
    children: [
      {
        id: "b2b-company-profile",
        label: "Company Profile",
        path: ROUTES.B2B.COMPANY_PROFILE,
        icon: Building2,
      },
      {
        id: "b2b-company-documents",
        label: "Compliance & GST/Tax",
        path: ROUTES.B2B.COMPANY_DOCUMENTS,
        icon: FileText,
      },
      {
        id: "b2b-company-members",
        label: "Authorized Buyers",
        path: ROUTES.B2B.COMPANY_MEMBERS,
        icon: Users,
      },
    ],
  },
];
