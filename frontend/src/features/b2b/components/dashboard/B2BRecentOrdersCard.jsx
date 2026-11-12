import React from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Clock, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Skeleton, EmptyState } from "@/components/ui/Alert.jsx";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { ROUTES } from "@/constants/routes.js";

const STATUS_BADGE_MAP = {
  PENDING: { variant: "amber", label: "Pending Verification" },
  CONFIRMED: { variant: "blue", label: "Order Confirmed" },
  PROCESSING: { variant: "indigo", label: "In Production" },
  SHIPPED: { variant: "purple", label: "Shipped / In Transit" },
  DELIVERED: { variant: "green", label: "Delivered" },
  CANCELLED: { variant: "red", label: "Cancelled" },
};

/**
 * Reusable recent purchase orders list card for the B2B dashboard.
 */
export function B2BRecentOrdersCard({
  orders = [],
  isLoading = false,
  currency = "USD",
  currencySymbol = "$",
}) {
  return (
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
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No purchase orders created yet"
          description="Place your first wholesale order using live tier pricing."
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
          {orders.map((order) => {
            const badge = STATUS_BADGE_MAP[order.status] || {
              variant: "gray",
              label: order.status,
            };
            const itemCount = order.items?.length || 0;
            const orderCurrency = order.currencyCode || currency;
            const totalFormatted = formatPrice(
              order.total,
              orderCurrency,
              orderCurrency === currency ? currencySymbol : undefined
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
                    <span>
                      {itemCount} line item{itemCount !== 1 ? "s" : ""}
                    </span>
                    {order.items?.[0]?.productName && (
                      <span className="text-slate-700 truncate max-w-[200px] hidden md:inline">
                        ({order.items[0].productName})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Total Value
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {totalFormatted}
                    </span>
                  </div>
                  <Link to={`${ROUTES.B2B.ORDERS}/${order.id}`}>
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
  );
}
