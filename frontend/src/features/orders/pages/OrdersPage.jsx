import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { Package, ArrowRight, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

export function OrdersPage() {
  const { country } = useCountryStore();

  const { data, isLoading } = useQuery({
    queryKey: ["b2c-orders"],
    queryFn: () => Api.orders.list(),
  });

  const orders = data?.items?.filter((o) => o.type === "B2C") || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="You haven't placed any retail orders yet."
          action={
            <Link to={ROUTES.PRODUCTS}>
              <Button variant="primary" size="sm">
                Shop Now
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "gray" };

            return (
              <div key={order.id} className="p-5 rounded-xl bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text-primary font-mono">{order.orderNumber}</span>
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Placed on {formatDate(order.createdAt, true)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {order.items?.length || 1} item(s) • Total:{" "}
                    <span className="font-bold text-brand-700">
                      {formatPrice(order.totalAmount, order.currency, order.symbol)}
                    </span>
                  </p>
                </div>

                <Link to={`${ROUTES.ORDERS}/${order.id}`}>
                  <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                    View Details & Tracking
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
