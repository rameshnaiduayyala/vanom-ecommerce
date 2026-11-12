import React from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingCart, Boxes } from "lucide-react";
import { AdminRetailOrdersPage } from "./AdminRetailOrdersPage.jsx";
import { AdminBulkOrdersPage } from "./AdminBulkOrdersPage.jsx";

const ORDER_TABS = [
  {
    id: "B2C",
    label: "Retail Orders",
    description: "B2C storefront consumer orders",
    icon: ShoppingCart,
  },
  {
    id: "B2B",
    label: "Bulk Orders",
    description: "Wholesale B2B purchase orders",
    icon: Boxes,
  },
];

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawType = (searchParams.get("type") || "B2C").toUpperCase();
  const activeTab = rawType === "B2B" || rawType === "BULK" ? "B2B" : "B2C";

  const handleTabChange = (tabId) => {
    setSearchParams({ type: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Orders Hub Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="px-3 py-1">
          <h2 className="text-sm font-bold text-slate-900">Orders Hub</h2>
          <p className="text-[11px] text-slate-500">
            Switch between Retail (B2C) and Bulk (B2B) order workspaces
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {ORDER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? tab.id === "B2B"
                        ? "text-amber-600"
                        : "text-emerald-600"
                      : "text-slate-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the selected existing page directly */}
      {activeTab === "B2B" ? <AdminBulkOrdersPage /> : <AdminRetailOrdersPage />}
    </div>
  );
}

export default AdminOrdersPage;
