import React from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingCart, Boxes, Layers } from "lucide-react";
import { Accordion, Badge } from "@/components/ui";
import { AdminRetailOrdersPage } from "./AdminRetailOrdersPage.jsx";
import { AdminBulkOrdersPage } from "./AdminBulkOrdersPage.jsx";

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawType = (searchParams.get("type") || "B2C").toUpperCase();
  const defaultOpen = rawType === "B2B" || rawType === "BULK" ? ["B2B"] : ["B2C"];

  const orderSections = [
    {
      id: "B2C",
      title: "Retail Orders",
      subtitle: "B2C storefront consumer orders, fulfillment & invoices",
      icon: ShoppingCart,
      badge: (
        <Badge variant="green" size="sm" className="font-semibold">
          B2C
        </Badge>
      ),
      content: (
        <div className="pt-2">
          <AdminRetailOrdersPage />
        </div>
      ),
    },
    {
      id: "B2B",
      title: "Bulk Orders",
      subtitle: "Wholesale B2B purchase orders, pallet dispatches & tax invoices",
      icon: Boxes,
      badge: (
        <Badge variant="amber" size="sm" className="font-semibold">
          B2B
        </Badge>
      ),
      content: (
        <div className="pt-2">
          <AdminBulkOrdersPage />
        </div>
      ),
    },
  ];

  const handleAccordionChange = (openIds) => {
    if (Array.isArray(openIds) && openIds.length === 1) {
      setSearchParams({ type: openIds[0] });
    }
  };

  return (
    <Accordion
      items={orderSections}
      multiple
      allowToggleAll
      defaultValue={defaultOpen}
      onChange={handleAccordionChange}
      variant="card"
      size="md"
      headerContent={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Orders Hub</h1>
            <p className="text-xs text-slate-500">
              Manage Retail (B2C) and Bulk (B2B) order workspaces from one place
            </p>
          </div>
        </div>
      }
    />
  );
}

export default AdminOrdersPage;
