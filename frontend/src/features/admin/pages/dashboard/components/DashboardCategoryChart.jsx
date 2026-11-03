import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Layers } from "lucide-react";

const BRAND_PALETTE = ["#006B3C", "#008F5A", "#D97706", "#2563EB", "#7C3AED", "#64748B"];

export function DashboardCategoryChart({ distribution = [], totalCount }) {
  const totalVolume = useMemo(() => {
    if (typeof totalCount === "number" && totalCount > 0) return totalCount;
    return distribution.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [distribution, totalCount]);

  const hasData = Array.isArray(distribution) && distribution.length > 0 && totalVolume > 0;

  return (
    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Category Catalog Share
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Distribution across active departments
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006B3C] flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* ── Donut Chart with Centered Total or Empty State ── */}
      <div className="relative h-48 w-full flex items-center justify-center">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-slate-400 text-xs text-center px-4">
            <Layers className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No active category items</p>
            <p className="text-[11px] text-slate-400">Products assigned to categories will show here.</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((c, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={c.color || BRAND_PALETTE[i % BRAND_PALETTE.length]}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} Items`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 6px 12px -2px rgb(0 0 0 / 0.08)",
                    padding: "6px 10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {totalVolume.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Items
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Color Coded Legend & Percentages ── */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        {hasData ? (
          distribution.map((item, idx) => {
            const itemVal = Number(item.value) || 0;
            const pct = totalVolume > 0 ? ((itemVal / totalVolume) * 100).toFixed(0) : 0;
            const color = item.color || BRAND_PALETTE[idx % BRAND_PALETTE.length];

            return (
              <div key={idx} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-700 font-semibold truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400 font-mono">
                    {pct}%
                  </span>
                  <span className="font-bold text-slate-900 text-xs min-w-[28px] text-right">
                    {itemVal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-slate-400 text-xs py-1">No category distribution data.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardCategoryChart;
