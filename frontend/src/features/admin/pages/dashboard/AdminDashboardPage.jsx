import React from "react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics.js";
import { DashboardKpiCards } from "./components/DashboardKpiCards.jsx";
import { DashboardRevenueChart } from "./components/DashboardRevenueChart.jsx";
import { DashboardCategoryChart } from "./components/DashboardCategoryChart.jsx";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity.jsx";

export function AdminDashboardPage() {
  const {
    metrics,
    isLoading,
    timeRange,
    setTimeRange,
    productsCount,
    revenueData,
    categoryData,
    recentOrders,
    pendingApps,
  } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs text-xs">
            {["today", "7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#204B38] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <DashboardKpiCards
        metrics={metrics}
        productsCount={productsCount}
        isLoading={isLoading}
      />

      {/* ── Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardRevenueChart series={revenueData} />
        <DashboardCategoryChart distribution={categoryData} />
      </div>

      {/* ── Recent Orders & Verification Queue ── */}
      <DashboardRecentActivity
        recentOrders={recentOrders}
        pendingApps={pendingApps}
      />
    </div>
  );
}

export default AdminDashboardPage;
