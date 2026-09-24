import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCountryStore } from "@/stores/country.store.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { resolveProductImageUrl } from "@/utils/image.js";
import { ROUTES } from "@/constants/routes.js";
import {
  Building2,
  Boxes,
  PackageCheck,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Clock,
  Plus,
  Truck,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Skeleton, EmptyState } from "@/components/ui/Alert.jsx";
import { B2BStatusCard } from "./B2BStatusCard.jsx";

const STATUS_BADGE_MAP = {
  PENDING: { variant: "amber", label: "Pending Verification" },
  CONFIRMED: { variant: "blue", label: "Order Confirmed" },
  PROCESSING: { variant: "indigo", label: "In Production" },
  SHIPPED: { variant: "purple", label: "Shipped / In Transit" },
  DELIVERED: { variant: "green", label: "Delivered" },
  CANCELLED: { variant: "red", label: "Cancelled" },
};

export function B2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  // Live dashboard summary query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["b2b-dashboard-summary"],
    queryFn: async () => {
      try {
        const res = await Api.b2b.getDashboard();
        return res?.data || res;
      } catch (err) {
        console.warn("Failed to load aggregated dashboard, fetching fallback", err);
        const [company, ordersRes, cartRes, productsRes] = await Promise.allSettled([
          Api.b2b.getCompany(),
          Api.b2b.listBulkOrders(),
          Api.b2b.getBulkCart(),
          Api.b2b.getBulkProducts({ limit: 6 })
        ]);
        const orders = ordersRes.status === "fulfilled" ? (ordersRes.value?.items || ordersRes.value || []) : [];
        const cart = cartRes.status === "fulfilled" ? cartRes.value : null;
        const products = productsRes.status === "fulfilled" ? (productsRes.value?.items || productsRes.value || []) : [];
        const business = company.status === "fulfilled" ? (company.value?.data || company.value) : null;

        const totalOrders = orders.length;
        const totalSpend = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const activeOrders = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "DELIVERED").length;
        const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
        const cartItemsCount = cart?.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;

        return {
          business,
          stats: {
            totalOrders,
            totalSpend,
            activeOrders,
            completedOrders,
            cartItemsCount,
            currencyCode: orders[0]?.currencyCode || "USD"
          },
          recentOrders: orders.slice(0, 5),
          featuredProducts: products.slice(0, 6),
          cart
        };
      }
    },
    staleTime: 30000,
  });

  const business = dashboardData?.business || activeCompany;
  const status = business?.status || activeCompany?.status;

  // Show status gate for non-APPROVED accounts (PENDING, REJECTED, SUSPENDED)
  if (status && status !== "APPROVED") {
    return <B2BStatusCard status={status} activeCompany={business} user={user} />;
  }

  const stats = dashboardData?.stats || {
    totalOrders: 0,
    totalSpend: 0,
    activeOrders: 0,
    completedOrders: 0,
    cartItemsCount: 0,
    currencyCode: country.currency || "USD"
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const featuredProducts = dashboardData?.featuredProducts || [];
  const currency = stats.currencyCode || country.currency || "USD";
  const currencySymbol = country.currency === currency ? country.symbol : "$";

  return (
    <div className="space-y-6">
      {/* ── Enterprise Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale Portal Dashboard
            </h1>
            <Badge variant="green" size="sm" className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved Commercial Account
            </Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center flex-wrap gap-2">
            <span>
              Authorized Representative:{" "}
              <strong className="text-slate-800 font-semibold">
                {user?.firstName ? `${user.firstName} ${user?.lastName || ""}`.trim() : "Wholesale Buyer"}
              </strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Entity:{" "}
              <strong className="text-emerald-700 font-bold">
                {business?.businessName || business?.legalName || activeCompany?.businessName || "Your Wholesale Business"}
              </strong>
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

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Purchase Orders"
          icon={<PackageCheck className="w-4 h-4" />}
          iconBg="bg-blue-50 text-blue-600"
          value={isLoading ? <Skeleton className="h-7 w-16" /> : stats.totalOrders}
          sub={
            stats.completedOrders > 0
              ? `${stats.completedOrders} orders fulfilled & delivered`
              : "All-time procurement transactions"
          }
        />

        <SummaryCard
          label="Total Procurement Spend"
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
          value={
            isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              formatPrice(stats.totalSpend, currency, currencySymbol)
            )
          }
          sub="Cumulative wholesale volume"
        />

        <SummaryCard
          label="Active Fulfillment / Open POs"
          icon={<Truck className="w-4 h-4" />}
          iconBg="bg-amber-50 text-amber-600"
          value={
            isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              `${stats.activeOrders} Active`
            )
          }
          sub={stats.activeOrders > 0 ? "Under processing / transit" : "No orders awaiting dispatch"}
        />

        <SummaryCard
          label="Tax Compliance & Invoicing"
          icon={<ShieldCheck className="w-4 h-4" />}
          iconBg="bg-purple-50 text-purple-600"
          value={
            business?.taxRegistrationNumber ? (
              <span className="text-sm font-bold font-mono text-slate-900 truncate block">
                {business.taxRegistrationNumber}
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-700">Verified Business</span>
            )
          }
          sub={
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Validated for Commercial Invoicing
            </span>
          }
        />
      </div>

      {/* ── Main Dashboard Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 2 Columns: Recent Orders ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Purchase Orders
                </h2>
              </div>
              <Link
                to={ROUTES.B2B.ORDERS}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                View Full Order History <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="No purchase orders created yet"
                description="Start ordering high-volume palletized commodities with real-time tier pricing."
                action={
                  <Link to={ROUTES.B2B.BULK_ORDER}>
                    <Button variant="primary" size="sm" icon={Plus} className="font-bold">
                      Create First Wholesale Order
                    </Button>
                  </Link>
                }
                className="py-10 bg-slate-50 border border-slate-100 rounded-xl"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const badge = STATUS_BADGE_MAP[order.status] || {
                    variant: "gray",
                    label: order.status,
                  };
                  const itemCount = order.items?.length || 0;
                  const totalFormatted = formatPrice(
                    order.total,
                    order.currencyCode || currency,
                    currencySymbol
                  );

                  return (
                    <div
                      key={order.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2.5 rounded-xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-black font-mono text-slate-900">
                            {order.orderNumber || order.id}
                          </span>
                          <Badge variant={badge.variant} size="sm" className="font-semibold">
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Placed on {formatDate(order.createdAt)}</span>
                          <span>•</span>
                          <span>{itemCount} line item{itemCount !== 1 ? "s" : ""}</span>
                          {order.items?.[0]?.productName && (
                            <span className="text-slate-700 truncate max-w-[200px] hidden md:inline">
                              ({order.items[0].productName})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block text-[10px] uppercase font-bold">
                            Total Value
                          </span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {totalFormatted}
                          </span>
                        </div>
                        <Link to={ROUTES.B2B.ORDERS}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold"
                          >
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Wholesale Commodities Spotlight ────────────────────────── */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Wholesale Commodities & Fast Reorder
                </h2>
              </div>
              <Link
                to={ROUTES.B2B.CATALOG}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                Browse All Commodities <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No wholesale commodities currently cataloged.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredProducts.map((product) => {
                  const targetCountryCode = (country.code || "US").toUpperCase();
                  const countryPrice = Array.isArray(product.countryPrices)
                    ? product.countryPrices.find((cp) => cp.countryCode?.toUpperCase() === targetCountryCode) ||
                      product.countryPrices[0]
                    : null;

                  const tiers = countryPrice?.tiers || [];
                  const lowestPrice =
                    tiers.length > 0
                      ? Math.min(...tiers.map((t) => Number(t.price || 0)))
                      : null;

                  const imgUrl = resolveProductImageUrl(product);
                  const moq = countryPrice?.moq || product.moq || 1;

                  return (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-600/40 hover:shadow-xs transition-all flex items-start gap-3.5"
                    >
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/assets/placeholder.png";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                          <span>MOQ: {moq} units</span>
                          {product.brand && (
                            <>
                              <span>•</span>
                              <span className="truncate text-slate-700">{product.brand}</span>
                            </>
                          )}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-emerald-800 font-mono">
                            {lowestPrice
                              ? `From ${formatPrice(lowestPrice, countryPrice?.currencyCode || country.currency, country.symbol)}`
                              : "Tiered Pricing"}
                          </span>
                          <Link to={`/b2b/catalog/${product.slug || product.id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[10px] py-1 px-2.5 h-auto font-bold"
                            >
                              Configure
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Business Profile & Quick Actions ─────────────── */}
        <div className="space-y-6">
          {/* Company Dossier Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Company Profile & Compliance
                </h3>
              </div>
              <Link
                to={ROUTES.B2B.COMPANY.PROFILE}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Legal Business Name
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {business?.businessName || business?.legalName || "Wholesale Commercial Client"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Tax / GST / VAT ID
                  </span>
                  <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                    {business?.taxRegistrationNumber || "Not registered"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Reg. Number
                  </span>
                  <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                    {business?.registrationNumber || "Standard B2B"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Procurement Email & Phone
                </span>
                <p className="text-slate-700 mt-0.5 font-mono text-[11px]">
                  {business?.businessEmail || user?.email || "—"}
                </p>
                {business?.businessPhone && (
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                    {business.businessPhone}
                  </p>
                )}
              </div>

              {business?.address && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Registered Headquarters
                  </span>
                  <p className="text-slate-700 text-xs mt-0.5 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{business.address}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Wholesale Links */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#00281C] text-white shadow-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Boxes className="w-4 h-4" />
              <span>Commercial Procurement Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access the high-speed bulk spreadsheet ordering tool to purchase full pallet loads, apply tiered volume discounts, and dispatch consolidated freight.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to={ROUTES.B2B.BULK_ORDER}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Boxes}
                  className="w-full justify-center font-bold bg-emerald-600 hover:bg-emerald-500 border-0"
                >
                  Open Bulk Order Matrix
                </Button>
              </Link>
              <Link to={ROUTES.B2B.CATALOG}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs font-semibold border-slate-700 text-slate-200 hover:bg-white/10"
                >
                  Wholesale Commodities Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Private sub-components ────────────────────────────────────────────────────

function SummaryCard({ label, icon, iconBg, value, sub }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}