import React from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  PackageCheck,
  Truck,
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { formatPrice } from "@/utils/formatters.js";
import { ROUTES } from "@/constants/routes.js";
import { B2BStatusCard } from "./B2BStatusCard.jsx";
import { useB2BDashboard } from "../hooks/useB2BDashboard.js";
import { B2BStatCard } from "../components/dashboard/B2BStatCard.jsx";
import { B2BRecentOrdersCard } from "../components/dashboard/B2BRecentOrdersCard.jsx";
import { B2BFeaturedProductsCard } from "../components/dashboard/B2BFeaturedProductsCard.jsx";
import { B2BCompanyProfileCard } from "../components/dashboard/B2BCompanyProfileCard.jsx";
import { B2BProcurementDeskCard } from "../components/dashboard/B2BProcurementDeskCard.jsx";

export function B2BDashboard() {
  const {
    user,
    country,
    business,
    status,
    stats,
    recentOrders,
    featuredProducts,
    currency,
    currencySymbol,
    isLoading,
    isError,
    refetch,
  } = useB2BDashboard();

  // Show status gate for non-APPROVED accounts (PENDING, REJECTED, SUSPENDED)
  if (status && status !== "APPROVED") {
    return <B2BStatusCard status={status} activeCompany={business} user={user} />;
  }

  const representativeName = user?.firstName
    ? `${user.firstName} ${user?.lastName || ""}`.trim()
    : user?.email || "—";

  const businessName =
    business?.businessName || business?.legalName || "—";

  return (
    <div className="space-y-6">
      {/* ── Enterprise Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale Portal Dashboard
            </h1>
            {status === "APPROVED" && (
              <Badge variant="green" size="sm" className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Commercial Account
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center flex-wrap gap-2">
            <span>
              Authorized Representative:{" "}
              <strong className="text-slate-800 font-semibold">{representativeName}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Entity:{" "}
              <strong className="text-emerald-700 font-bold">{businessName}</strong>
            </span>
            {business?.countryCode && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-mono text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  ISO: {business.countryCode.toUpperCase()}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="primary" size="sm" icon={Boxes} className="font-bold shadow-xs">
              Bulk Order Sheet
            </Button>
          </Link>
          <Link to={ROUTES.B2B.CATALOG}>
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingBag}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Browse Catalog
            </Button>
          </Link>
          <Link to={ROUTES.B2B.ORDERS}>
            <Button
              variant="ghost"
              size="sm"
              icon={PackageCheck}
              className="text-slate-600 hover:text-slate-900"
            >
              All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Live Fetch Error Banner ──────────────────────────────────────── */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Unable to load live B2B dashboard metrics.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <B2BStatCard
          label="Total Purchase Orders"
          icon={<PackageCheck className="w-4 h-4" />}
          iconBg="bg-blue-50 text-blue-600"
          isLoading={isLoading}
          skeletonWidth="w-16"
          value={stats.totalOrders}
          sub={
            stats.completedOrders > 0
              ? `${stats.completedOrders} delivered${stats.cancelledOrders > 0 ? ` • ${stats.cancelledOrders} cancelled` : ""}`
              : "All-time procurement transactions"
          }
        />

        <B2BStatCard
          label="Total Procurement Spend"
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
          isLoading={isLoading}
          skeletonWidth="w-24"
          value={formatPrice(stats.totalSpend, currency, currencySymbol)}
          sub="Excluding cancelled orders"
        />

        <B2BStatCard
          label="Active Fulfillment / Open POs"
          icon={<Truck className="w-4 h-4" />}
          iconBg="bg-amber-50 text-amber-600"
          isLoading={isLoading}
          skeletonWidth="w-16"
          value={`${stats.activeOrders} Active`}
          sub={stats.activeOrders > 0 ? "Under processing / transit" : "No orders awaiting dispatch"}
        />

        <B2BStatCard
          label="Active Bulk Cart"
          icon={<ShoppingCart className="w-4 h-4" />}
          iconBg="bg-purple-50 text-purple-600"
          isLoading={isLoading}
          skeletonWidth="w-20"
          value={`${stats.cartItemsCount} Units`}
          sub={
            stats.cartLineItemsCount > 0
              ? `${stats.cartLineItemsCount} SKU${stats.cartLineItemsCount !== 1 ? "s" : ""} staged for checkout`
              : "No items staged in bulk cart"
          }
        />
      </div>

      {/* ── Main Dashboard Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <B2BRecentOrdersCard
            orders={recentOrders}
            isLoading={isLoading}
            currency={currency}
            currencySymbol={currencySymbol}
          />

          <B2BFeaturedProductsCard
            products={featuredProducts}
            isLoading={isLoading}
            country={country}
          />
        </div>

        <div className="space-y-6">
          <B2BCompanyProfileCard
            business={business}
            user={user}
            isLoading={isLoading}
          />

          <B2BProcurementDeskCard
            cartItemsCount={stats.cartItemsCount}
            cartLineItemsCount={stats.cartLineItemsCount}
            catalogCount={stats.catalogCount}
          />
        </div>
      </div>
    </div>
  );
}

export default B2BDashboard;
