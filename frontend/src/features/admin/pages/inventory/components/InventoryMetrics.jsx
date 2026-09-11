import React from "react";
import { CheckCircle2, Boxes, Layers } from "lucide-react";

export function InventoryMetrics({ metrics }) {
  const { totalOnHand, totalReserved, totalAvailable } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Total On-Hand Balance
        </span>
        <div className="text-2xl font-black text-slate-900">
          {totalOnHand.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">Units</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Total physical units in catalog
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Checkout Reserved
        </span>
        <div className="text-2xl font-black text-amber-600">
          {totalReserved.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">Units</span>
        </div>
        <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
          <Boxes className="w-3.5 h-3.5" /> Held in active carts & pending orders
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Available for Sale
        </span>
        <div className="text-2xl font-black text-[#00875A]">
          {totalAvailable.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">Units</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Direct B2B wholesale & B2C allocation
        </p>
      </div>
    </div>
  );
}
