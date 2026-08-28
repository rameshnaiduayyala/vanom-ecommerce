import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

export function OrderDetailsPage() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => Api.orders.getById(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary">Order Not Found</h2>
        <Link to={ROUTES.ORDERS} className="mt-4 inline-block">
          <Button variant="primary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "gray" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link to={ROUTES.ORDERS} className="text-xs text-brand-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary font-mono">{order.orderNumber}</h1>
            <Badge variant={statusConfig.color} size="md">
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-text-muted">Placed on {formatDate(order.createdAt, true)}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-text-muted block">Total Paid Amount</span>
          <span className="text-2xl font-black text-brand-700">
            {formatPrice(order.totalAmount, order.currency, order.symbol)}
          </span>
        </div>
      </div>

      {/* Order Fulfillment Progress Timeline */}
      <div className="p-6 rounded-xl bg-white border border-border space-y-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-600" />
          Fulfillment Timeline & Tracking
        </h3>

        <div className="relative border-l-2 border-brand-200 ml-4 space-y-6 py-2">
          {order.timeline?.map((step, index) => (
            <div key={index} className="relative pl-6">
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <h5 className="text-xs font-bold text-text-primary">{step.label}</h5>
              <p className="text-[11px] text-text-muted">{step.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items & Shipping Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 p-6 rounded-xl bg-white border border-border space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Items in this Package
          </h3>
          <div className="divide-y divide-border">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-muted border border-border overflow-hidden shrink-0">
                    <img src={item.image || "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-text-primary">{item.name}</h5>
                    <p className="text-[11px] text-text-muted font-mono">{item.sku}</p>
                    <p className="text-[11px] text-text-muted">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary">
                    {formatPrice(item.subtotal, order.currency, order.symbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Financials */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Destination
            </h4>
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-semibold text-text-primary">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.line1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p className="font-medium text-text-muted mt-1">{order.shippingAddress?.country}</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-border space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-text-primary">{formatPrice(order.subtotal, order.currency, order.symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST / VAT)</span>
              <span className="font-semibold text-text-primary">{formatPrice(order.taxAmount, order.currency, order.symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Cost</span>
              <span className="font-semibold text-text-primary">{formatPrice(order.shippingCost, order.currency, order.symbol)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-text-primary">
              <span>Total Paid</span>
              <span className="text-brand-700">{formatPrice(order.totalAmount, order.currency, order.symbol)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
