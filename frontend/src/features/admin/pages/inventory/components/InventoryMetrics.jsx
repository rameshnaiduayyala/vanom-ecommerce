import React from "react";
import { CheckCircle2, Boxes, AlertTriangle, XCircle, Warehouse, Layers } from "lucide-react";

export function InventoryMetrics({ metrics = {} }) {
  const {
    totalProducts = 0,
    totalOnHand = 0,
    totalReserved = 0,
    totalAvailable = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    warehouseCount = 0,
  } = metrics;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* 1. Total Products */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
          Catalog Items
        </span>
        <div className="text-xl font-black text-slate-900">
          {totalProducts.toLocaleString()}
        </div>
        <p className="text-[10px] text-text-muted flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-400" /> Products
        </p>
      </div>

      {/* 2. Total Stock Units */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
          Total Physical Stock
        </span>
        <div className="text-xl font-black text-slate-900">
          {totalOnHand.toLocaleString()}
        </div>
        <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> On-hand units
        </p>
      </div>

      {/* 3. Reserved Units */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
          Reserved Units
        </span>
        <div className="text-xl font-black text-amber-600">
          {totalReserved.toLocaleString()}
        </div>
        <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
          <Boxes className="w-3 h-3" /> In checkouts
        </p>
      </div>

      {/* 4. Available Units */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-[#00875A] uppercase tracking-wider block">
          Available for Sale
        </span>
        <div className="text-xl font-black text-[#00875A]">
          {totalAvailable.toLocaleString()}
        </div>
        <p className="text-[10px] text-emerald-700 font-medium">
          Ready to ship
        </p>
      </div>

      {/* 5. Low Stock */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
          Low Stock Alerts
        </span>
        <div className="text-xl font-black text-orange-600">
          {lowStockCount.toLocaleString()}
        </div>
        <p className="text-[10px] text-orange-600 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Below reorder
        </p>
      </div>

      {/* 6. Out of Stock */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
          Out of Stock
        </span>
        <div className="text-xl font-black text-rose-600">
          {outOfStockCount.toLocaleString()}
        </div>
        <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Zero inventory
        </p>
      </div>

      {/* 7. Warehouses */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-1 col-span-2 sm:col-span-1">
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
          Active Depots
        </span>
        <div className="text-xl font-black text-purple-700">
          {warehouseCount.toLocaleString()}
        </div>
        <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
          <Warehouse className="w-3 h-3" /> Fulfillment hubs
        </p>
      </div>
    </div>
  );
}
