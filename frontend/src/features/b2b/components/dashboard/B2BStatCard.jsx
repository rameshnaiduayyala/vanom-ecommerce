import React from "react";
import { Skeleton } from "@/components/ui/Alert.jsx";

/**
 * Reusable KPI metric card for B2B portal views.
 */
export function B2BStatCard({
  label,
  icon,
  iconBg = "bg-slate-100 text-slate-600",
  value,
  sub,
  isLoading = false,
  skeletonWidth = "w-20",
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
        {isLoading ? <Skeleton className={`h-7 ${skeletonWidth}`} /> : value}
      </div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}
