import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function DashboardRevenueChart({ series }) {
  return (
    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Revenue Analytics</h3>
          <p className="text-xs text-slate-500">Monthly wholesale and retail revenue performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#358B5B]" />
            <span className="text-slate-600 font-medium">B2B Wholesale</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D9A514]" />
            <span className="text-slate-600 font-medium">Total Volume</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#358B5B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#358B5B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9A514" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D9A514" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              stroke="#94A3B8"
            />
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`,
                name === "b2b" ? "B2B Wholesale" : "Total Revenue",
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area type="monotone" dataKey="b2b" stroke="#358B5B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorB2B)" />
            <Area type="monotone" dataKey="revenue" stroke="#D9A514" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
