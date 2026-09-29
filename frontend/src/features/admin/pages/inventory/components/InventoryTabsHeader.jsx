import React from "react";
import {
  Boxes,
  ArrowRightLeft,
  Warehouse,
  History,
  AlertTriangle,
  ScanBarcode,
} from "lucide-react";

export function InventoryTabsHeader({
  activeTab,
  onTabChange,
  catalogCount = 0,
  warehouseCount = 0,
  alertCount = 0,
}) {
  const tabs = [
    {
      id: "catalog",
      label: "Stock Catalog",
      icon: Boxes,
      badge: catalogCount,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "operations",
      label: "Stock Operations",
      icon: ArrowRightLeft,
      subtitle: "Inward, Transfer, Adjust",
    },
    {
      id: "warehouses",
      label: "Depot Hubs",
      icon: Warehouse,
      badge: warehouseCount,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "alerts",
      label: "Reorder Alerts",
      icon: AlertTriangle,
      badge: alertCount,
      badgeColor: alertCount > 0 ? "bg-rose-500 text-white font-bold" : "bg-slate-100 text-slate-600",
      highlight: alertCount > 0,
    },
    {
      id: "history",
      label: "Audit Trail",
      icon: History,
      subtitle: "Ledger",
    },
    {
      id: "barcodes",
      label: "Barcode Studio",
      icon: ScanBarcode,
      subtitle: "Terminal & QR",
    },
  ];

  return (
    <div className="border-b border-border bg-white rounded-2xl p-1.5 shadow-2xs">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "bg-[#00875A] text-white shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? "text-white scale-105" : tab.highlight ? "text-rose-500" : "text-text-muted"
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${
                    isActive ? "bg-white/25 text-white" : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InventoryTabsHeader;
