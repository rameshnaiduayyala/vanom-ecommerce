import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";

export function DashboardRevenueChart({ series = [] }) {
  const totalB2B = series.reduce((sum, item) => sum + (Number(item.b2b) || 0), 0);
  const totalGross = series.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Analytics</h3>
          <p className="text-xs text-slate-500 font-medium">
            Wholesale B2B & retail gross performance across selected timeline
          </p>
        </div>

        {/* Dynamic Legend / Volume indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00875A]" />
            <span className="text-slate-700 font-semibold text-[11px]">B2B Wholesale</span>
            <span className="font-bold text-[#006B3C] text-[11px] ml-1">
              ${totalB2B.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span className="text-slate-700 font-semibold text-[11px]">Total Volume</span>
            <span className="font-bold text-amber-700 text-[11px] ml-1">
              ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Chart or Clean Empty State ── */}
      <div className="h-72 w-full pt-1">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No revenue data available</p>
            <p className="text-[11px] text-slate-400">Transactions within this period will appear here.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00875A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00875A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
              />

              <YAxis
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />

              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "b2b" ? "B2B Wholesale" : "Total Gross Revenue",
                ]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)",
                  padding: "8px 12px",
                }}
                labelStyle={{ fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}
              />

              <Area
                type="monotone"
                dataKey="b2b"
                stroke="#00875A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorB2B)"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default DashboardRevenueChart;
