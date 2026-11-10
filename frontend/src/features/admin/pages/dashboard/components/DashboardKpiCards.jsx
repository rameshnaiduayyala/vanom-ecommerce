import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Building2,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/Alert.jsx";
import { ROUTES } from "@/constants/routes.js";

/**
 * Mini Sparkline Trend Chart using Recharts
 */
function MiniSparkline({ data, dataKey, color, id }) {
  if (!Array.isArray(data) || data.length < 2) return null;

  return (
    <div className="h-9 w-24 shrink-0 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#spark-${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * KPI Card Skeleton Loader
 */
function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 animate-pulse">
      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 bg-slate-200 rounded w-24" />
        <div className="w-9 h-9 rounded-xl bg-slate-100" />
      </div>

      {/* Middle Row: Large Value & Mini Sparkline placeholder */}
      <div className="flex items-end justify-between gap-3">
        <div className="h-8 bg-slate-200 rounded w-28" />
        <div className="h-9 w-20 bg-slate-100 rounded-lg" />
      </div>

      {/* Bottom Row: Percentage & Description */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded w-28" />
        <div className="h-3.5 bg-slate-100 rounded w-14" />
      </div>
    </div>
  );
}

/**
 * Individual KPI Card
 */
function KpiCard({
  title,
  icon,
  iconBg,
  iconColor,
  value,
  percentageChange,
  percentageType,
  description,
  trendData,
  trendDataKey,
  trendColor,
  trendId,
  actionLink,
  actionText,
}) {
  const hasPercentage = typeof percentageChange === "number" && !Number.isNaN(percentageChange);
  const isPositive = hasPercentage && percentageChange >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
      {/* ── Top Row: Metric Title & Icon with Subtle Colored Background ── */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} border border-black/5 shadow-2xs`}
        >
          {icon}
        </div>
      </div>

      {/* ── Middle Row: Large Numerical Value & Trend Sparkline ── */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
            {value}
          </p>
        </div>

        {trendData && trendData.length > 1 && (
          <MiniSparkline
            data={trendData}
            dataKey={trendDataKey}
            color={trendColor}
            id={trendId}
          />
        )}
      </div>

      {/* ── Bottom Row: Percentage Change (where valid) & Supporting Description ── */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {hasPercentage ? (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[11px] ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 shrink-0" />
              )}
              {isPositive ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </span>
          ) : percentageType ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-bold text-[11px] bg-slate-100 text-slate-700">
              {percentageType}
            </span>
          ) : null}

          {description && (
            <span className="text-[11px] font-medium text-slate-500 truncate">
              {description}
            </span>
          )}
        </div>

        {actionLink && actionText && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#006B3C] hover:text-emerald-800 transition-colors shrink-0"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Responsive KPI Grid (5 Cards)
 */
export function DashboardKpiCards({ metrics, productsCount, isLoading, isFetching }) {
  if (isLoading || (!metrics && isFetching)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Derive trend series from existing API response
  const revenueSeries = metrics?.revenueSeries || [];

  // Calculate real percentage changes strictly from existing revenueSeries buckets (if at least 2 points exist)
  const revenueChange = useMemo(() => {
    if (revenueSeries.length >= 2) {
      const current = revenueSeries[revenueSeries.length - 1]?.revenue;
      const prev = revenueSeries[revenueSeries.length - 2]?.revenue;
      if (typeof current === "number" && typeof prev === "number" && prev > 0) {
        return ((current - prev) / prev) * 100;
      }
    }
    return null;
  }, [revenueSeries]);

  const ordersChange = useMemo(() => {
    if (revenueSeries.length >= 2) {
      const current = revenueSeries[revenueSeries.length - 1]?.orders;
      const prev = revenueSeries[revenueSeries.length - 2]?.orders;
      if (typeof current === "number" && typeof prev === "number" && prev > 0) {
        return ((current - prev) / prev) * 100;
      }
    }
    return null;
  }, [revenueSeries]);

  // Total Revenue formatted
  const totalRevenueFormatted =
    metrics?.totalRevenue != null
      ? `$${Number(metrics.totalRevenue).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "$0.00";

  // Total Orders
  const totalOrdersCount = metrics?.totalOrders ?? 0;

  // Active Buyers (registered users)
  const activeBuyersCount = (metrics?.activeCustomers ?? 0).toLocaleString();

  // B2B Companies (approved businesses)
  const b2bCompaniesCount = (metrics?.activeCompanies ?? 0).toLocaleString();
  const pendingApplicationsCount = metrics?.pendingApplications ?? 0;

  // Catalog Items
  const catalogCount = (
    metrics?.activeCatalogItems ??
    productsCount ??
    0
  ).toLocaleString();

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 transition-opacity duration-200 ${
        isFetching ? "opacity-75" : "opacity-100"
      }`}
    >
      {/* 1. Total Revenue */}
      <KpiCard
        title="Total Revenue"
        icon={<DollarSign className="w-5 h-5" />}
        iconBg="bg-emerald-50"
        iconColor="text-[#00875A]"
        value={totalRevenueFormatted}
        percentageChange={revenueChange}
        description={
          metrics?.today?.revenue
            ? `+$${Number(metrics.today.revenue).toLocaleString()} today`
            : "gross sales"
        }
        trendData={revenueSeries}
        trendDataKey="revenue"
        trendColor="#00875A"
        trendId="rev"
      />

      {/* 2. Total Orders */}
      <KpiCard
        title="Total Orders"
        icon={<ShoppingBag className="w-5 h-5" />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        value={Number(totalOrdersCount).toLocaleString()}
        percentageChange={ordersChange}
        description={
          metrics?.today?.orders
            ? `${metrics.today.orders} placed today`
            : "completed & live"
        }
        trendData={revenueSeries}
        trendDataKey="orders"
        trendColor="#2563EB"
        trendId="orders"
      />

      {/* 3. Active Buyers */}
      <KpiCard
        title="Active Buyers"
        icon={<Users className="w-5 h-5" />}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
        value={activeBuyersCount}
        percentageChange={null}
        percentageType={
          metrics?.today?.newCustomers
            ? `+${metrics.today.newCustomers} today`
            : "Active"
        }
        description="registered accounts"
      />

      {/* 4. B2B Companies */}
      <KpiCard
        title="B2B Companies"
        icon={<Building2 className="w-5 h-5" />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        value={b2bCompaniesCount}
        percentageChange={null}
        percentageType={
          pendingApplicationsCount > 0
            ? `${pendingApplicationsCount} Pending`
            : "Verified"
        }
        description="commercial entities"
        actionLink={
          pendingApplicationsCount > 0
            ? ROUTES.ADMIN.BUSINESS_APPLICATIONS
            : undefined
        }
        actionText="Review"
      />

      {/* 5. Catalog Items */}
      <KpiCard
        title="Catalog Items"
        icon={<Package className="w-5 h-5" />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        value={catalogCount}
        percentageChange={null}
        percentageType="Active"
        description="in master database"
        actionLink={ROUTES.ADMIN.PRODUCTS}
        actionText="Catalog"
      />
    </div>
  );
}

export default DashboardKpiCards;
