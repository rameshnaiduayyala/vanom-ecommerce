import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { ROUTES } from "@/constants/routes.js";

export function DashboardRecentActivity({ recentOrders = [], pendingApps = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Recent Orders (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
            <p className="text-xs text-slate-500">Live purchases from database</p>
          </div>

          <Link
            to={ROUTES.ADMIN.ORDERS}
            className="text-xs font-bold text-[#358B5B] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3">
                      <span className="font-mono font-bold text-slate-800 text-xs block truncate max-w-[140px]" title={ord.id}>
                        {ord.id}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-sans font-normal">
                          {ord.date}
                        </span>
                        {ord.type && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {ord.type}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={ord.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                          {ord.customer}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-slate-600 truncate max-w-[150px]">
                      {ord.items}
                    </td>

                    <td className="py-3 font-bold text-slate-900">
                      {ord.amount}
                    </td>

                    <td className="py-3">
                      <Badge
                        variant={
                          ord.status === "DELIVERED" || ord.status === "COMPLETED" || ord.status === "PAID"
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
                        {ord.status}
                      </Badge>
                    </td>

                    <td className="py-3 text-right">
                      <Link
                        to={ROUTES.ADMIN.ORDERS}
                        className="font-bold text-[#358B5B] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No recent orders found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Verification Applications (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Verification Queue</h3>
            <p className="text-xs text-slate-500">Pending B2B company applications</p>
          </div>

          <Link
            to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
            className="text-xs font-bold text-[#358B5B] hover:underline"
          >
            All →
          </Link>
        </div>

        <div className="space-y-3">
          {pendingApps.length > 0 ? (
            pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[160px]">
                    {app.companyName}
                  </span>
                  <Badge variant="yellow" size="sm">
                    {app.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tax ID: {app.taxId}</span>
                  <span>{app.country}</span>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <Link
                    to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
                    className="inline-flex items-center gap-1 font-bold text-[#358B5B] hover:underline text-[11px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Review Application →</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No pending applications to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
