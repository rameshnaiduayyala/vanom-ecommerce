import React from "react";
import { Truck, ExternalLink, PackageCheck, MapPin, Calendar, Clock, Copy, Check } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";

const STATUS_CONFIG = {
  PENDING: { label: "Order Placed", color: "amber" },
  LABEL_CREATED: { label: "Label Created", color: "blue" },
  READY_TO_SHIP: { label: "Ready to Ship", color: "indigo" },
  SHIPPED: { label: "Shipped", color: "emerald" },
  IN_TRANSIT: { label: "In Transit", color: "emerald" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "purple" },
  DELIVERED: { label: "Delivered", color: "emerald" },
  EXCEPTION: { label: "Delivery Exception", color: "rose" },
  CANCELLED: { label: "Cancelled", color: "gray" },
  RETURNED: { label: "Returned", color: "rose" },
};

export function OrderShipmentCard({ order }) {
  const [copied, setCopied] = React.useState(false);

  // Read shipment from order relations or order root fields
  const shipment = order?.shipments?.[0] || null;
  const carrier = shipment?.carrier || order?.shippingCarrier || "USPS";
  const service = shipment?.service || order?.shippingMethod || "Standard Shipping";
  const trackingNumber = shipment?.trackingNumber || order?.trackingNumber || null;
  const trackingUrl = shipment?.trackingUrl || (trackingNumber ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}` : null);
  const statusKey = shipment?.status || (order?.status === "DELIVERED" ? "DELIVERED" : order?.status === "SHIPPED" ? "IN_TRANSIT" : "LABEL_CREATED");
  const statusCfg = STATUS_CONFIG[statusKey] || { label: statusKey?.replace(/_/g, " "), color: "blue" };

  const handleCopy = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Shipment & Delivery Details</h3>
              <Badge variant={statusCfg.color} size="sm">
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {carrier} • {service}
              {shipment?.warehouse?.name ? ` • Fulfilled from ${shipment.warehouse.name}` : ""}
            </p>
          </div>
        </div>

        {/* Tracking CTA Button */}
        {trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Track Shipment</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Tracking Number Bar */}
      {trackingNumber ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tracking Number
            </p>
            <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 select-all">
              {trackingNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            {shipment?.labelUrl && (
              <a
                href={shipment.labelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-xs"
              >
                <span>View Label PDF</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Fulfillment in progress. Carrier tracking number will appear once the shipping label is printed.
          </span>
        </div>
      )}

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
          <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-gray-400" />
            Carrier & Service
          </p>
          <p className="font-semibold text-gray-900">{carrier} {service}</p>
        </div>

        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
          <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            Estimated Delivery
          </p>
          <p className="font-semibold text-gray-900">
            {shipment?.estimatedDeliveryDate
              ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })
              : "2–4 Business Days"}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
          <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            Fulfillment Hub
          </p>
          <p className="font-semibold text-gray-900">
            {shipment?.warehouse?.city
              ? `${shipment.warehouse.city}, ${shipment.warehouse.state || shipment.warehouse.country}`
              : "Central Distribution Center"}
          </p>
        </div>
      </div>
    </div>
  );
}
