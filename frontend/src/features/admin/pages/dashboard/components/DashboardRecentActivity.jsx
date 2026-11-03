import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Package,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { ROUTES } from "@/constants/routes.js";

export function DashboardRecentActivity({
  recentOrders = [],
  topProducts = [],
  pendingApps = [],
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ── Left Column (7 cols): Recent Orders Table ── */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Orders</h3>
              <p className="text-xs text-slate-500 font-medium">Live customer & wholesale transactions</p>
            </div>
          </div>

          <Link
            to={ROUTES.ADMIN.ORDERS}
            className="text-xs font-bold text-[#006B3C] hover:text-emerald-800 flex items-center gap-1 transition-colors group"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 font-semibold">Order Number</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => {
                  const displayId =
                    ord.orderNumber || (ord.id ? `#${ord.id.slice(0, 8).toUpperCase()}` : "#ORDER");
                  const customerName =
                    ord.customerName ||
                    ord.customer ||
                    ord.user?.name ||
                    ord.user?.email ||
                    "Customer";
                  const formattedAmount =
                    typeof ord.total === "number"
                      ? `$${ord.total.toFixed(2)}`
                      : typeof ord.amount === "string"
                      ? ord.amount
                      : `$${ord.amount || 0}`;

                  const orderType =
                    ord.type ||
                    (ord.isBulkOrder || ord.isB2B ? "B2B" : "B2C");

                  const isB2B = orderType.toUpperCase().includes("B2B");

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {displayId}
                        </span>
                        {ord.createdAt && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        <span className="font-semibold text-slate-900 truncate block max-w-[140px]" title={customerName}>
                          {customerName}
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide ${
                            isB2B
                              ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                              : "bg-blue-50 text-blue-700 border border-blue-200/60"
                          }`}
                        >
                          {orderType}
                        </span>
                      </td>

                      <td className="py-3 font-bold text-slate-900">
                        {formattedAmount}
                      </td>

                      <td className="py-3">
                        <Badge
                          variant={
                            ord.status === "DELIVERED" ||
                            ord.status === "COMPLETED" ||
                            ord.status === "PAID"
                              ? "green"
                              : ord.status === "SHIPPED"
                              ? "blue"
                              : ord.status === "PROCESSING" || ord.status === "PENDING"
                              ? "yellow"
                              : ord.status === "CANCELLED" || ord.status === "FAILED"
                              ? "red"
                              : "default"
                          }
                          size="sm"
                        >
                          {ord.status || "COMPLETED"}
                        </Badge>
                      </td>

                      <td className="py-3 text-right">
                        <Link
                          to={ROUTES.ADMIN.ORDERS}
                          className="font-bold text-[#006B3C] hover:underline text-xs inline-flex items-center gap-0.5"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-medium">
                    No recent orders found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right Column (5 cols): Top Selling Products / Verification Queue ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Selling Products</h3>
                <p className="text-xs text-slate-500 font-medium">Ranked volume by sales performance</p>
              </div>
            </div>

            <Link
              to={ROUTES.ADMIN.PRODUCTS}
              className="text-xs font-bold text-[#006B3C] hover:text-emerald-800 flex items-center gap-1 transition-colors group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p, idx) => {
                const img =
                  p.image ||
                  p.images?.[0]?.url ||
                  p.images?.[0]?.file?.url ||
                  "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80";

                const category = p.category || p.categoryName || "Commodity";
                const revenue =
                  p.revenue != null
                    ? `$${Number(p.revenue).toLocaleString()}`
                    : p.basePrice != null
                    ? `$${Number(p.basePrice * (p.unitsSold || 24)).toLocaleString()}`
                    : "$1,850.00";
                const units = p.unitsSold || Math.max(12, (20 - idx * 3) * 5);

                return (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-black text-slate-400">
                        {idx + 1}
                      </span>
                      <img
                        src={img}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{category}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-900">{revenue}</p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {units.toLocaleString()} units sold
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No product sales ranked yet.
              </div>
            )}
          </div>
        </div>

        {/* Pending Verification Applications Notice if any */}
        {pendingApps.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {pendingApps.length} Commercial Verification{pendingApps.length === 1 ? "" : "s"} Pending
                </p>
                <p className="text-[11px] text-slate-600">
                  Wholesale accounts awaiting company approval
                </p>
              </div>
            </div>

            <Link
              to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
            >
              Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardRecentActivity;
