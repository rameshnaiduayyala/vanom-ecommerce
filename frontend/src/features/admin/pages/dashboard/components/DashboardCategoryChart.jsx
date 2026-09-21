import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardCategoryChart({ distribution }) {
  return (
    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">Category Catalog Share</h3>
        <p className="text-xs text-slate-500">Distribution across active departments</p>
      </div>

      <div className="h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {distribution.map((c, i) => (
                <Cell key={i} fill={c.color || "#358B5B"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v} Items`, "Count"]}
              contentStyle={{ borderRadius: "8px", fontSize: "11px", border: "1px solid #E2E8F0" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        {distribution.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || "#358B5B" }} />
              <span className="text-slate-600 font-medium truncate max-w-[150px]">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
