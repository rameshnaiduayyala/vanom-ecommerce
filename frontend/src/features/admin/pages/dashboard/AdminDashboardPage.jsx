import React from "react";
import { Calendar, Loader2 } from "lucide-react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics.js";
import { DashboardKpiCards } from "./components/DashboardKpiCards.jsx";
import { DashboardRevenueChart } from "./components/DashboardRevenueChart.jsx";
import { DashboardCategoryChart } from "./components/DashboardCategoryChart.jsx";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity.jsx";

const DATE_RANGE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "3 Days", value: "3d" },
  { label: "7 Days", value: "7d" },
  { label: "15 Days", value: "15d" },
  { label: "30 Days", value: "30d" },
  { label: "60 Days", value: "60d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "1y" },
];

export function AdminDashboardPage() {
  const {
    metrics,
    isLoading,
    isFetching,
    timeRange,
    setTimeRange,
    productsCount,
    revenueData,
    categoryData,
    recentOrders,
    topProducts,
    pendingApps,
  } = useDashboardMetrics();

  return (
    <div className="space-y-6 pb-8">
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-[11px] font-bold border border-emerald-200/80 shadow-2xs animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-[#006B3C]" />
                <span>Refreshing...</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor sales, orders, buyers and catalog performance across B2B & B2C.
          </p>
        </div>

        {/* ── Date Range Filters ── */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs text-xs shrink-0">
            <span className="hidden md:flex items-center pl-2 pr-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            {DATE_RANGE_OPTIONS.map((opt) => {
              const active = timeRange === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeRange(opt.value)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[#006B3C] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5 KPI Cards Responsive Grid ── */}
      <DashboardKpiCards
        metrics={metrics}
        productsCount={productsCount}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      {/* ── Analytics Section: Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <DashboardRevenueChart
          series={revenueData}
          isLoading={isLoading}
          isFetching={isFetching}
        />
        <DashboardCategoryChart
          distribution={categoryData}
          totalCount={productsCount}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </div>

      {/* ── Additional Sections: Recent Orders & Top Selling Products ── */}
      <DashboardRecentActivity
        recentOrders={recentOrders}
        topProducts={topProducts}
        pendingApps={pendingApps}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </div>
  );
}

export default AdminDashboardPage;
