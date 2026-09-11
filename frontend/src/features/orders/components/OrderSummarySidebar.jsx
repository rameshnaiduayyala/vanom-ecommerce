import React from "react";
import { MapPin, FileText } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { formatPrice } from "../../../utils/formatters.js";

export function OrderSummarySidebar({ order, currencyCode, currencySymbol, onOpenInvoice }) {
  const shippingCost = Number(order.shippingCost || order.shippingAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);

  return (
    <div className="space-y-6">
      {/* Destination Address */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 pb-2 border-b border-border">
          <MapPin className="w-4 h-4 text-brand-600" />
          Delivery Destination
        </h4>
        <div className="text-xs text-text-secondary leading-relaxed space-y-1 pt-1">
          <p className="font-bold text-text-primary text-sm">
            {order.shippingAddress?.fullName ||
              order.shippingAddress?.name ||
              `${order.user?.firstName || "Customer"} ${order.user?.lastName || ""}`}
          </p>
          <p>
            {order.shippingAddress?.streetAddress ||
              order.shippingAddress?.line1 ||
              order.shippingAddress?.address ||
              "Address Line 1"}
          </p>
          {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress?.city || "City"},{" "}
            {order.shippingAddress?.state || "State"}{" "}
            <span className="font-mono font-bold text-text-primary">
              {order.shippingAddress?.postalCode || order.shippingAddress?.pinCode || ""}
            </span>
          </p>
          <p className="font-semibold text-brand-700 pt-1">
            {order.shippingAddress?.country || order.country?.name || "India"}
          </p>
          {order.shippingAddress?.phone && (
            <p className="text-text-muted pt-1">Contact: {order.shippingAddress.phone}</p>
          )}
        </div>
      </div>

      {/* Payment Breakdown Card */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary pb-2 border-b border-border">
          Order Summary
        </h4>

        <div className="space-y-2.5 text-xs text-text-secondary">
          <div className="flex justify-between items-center">
            <span>Items Subtotal</span>
            <span className="font-semibold text-text-primary">
              {formatPrice(order.subtotal, currencyCode, currencySymbol)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-medium">
              <span>Wholesale / Promo Discount</span>
              <span>- {formatPrice(discountAmount, currencyCode, currencySymbol)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span>Tax (GST / VAT Included)</span>
            <span className="font-semibold text-text-primary">
              {formatPrice(order.taxAmount, currencyCode, currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Shipping & Handling</span>
            <span className="font-semibold text-text-primary">
              {shippingCost === 0 ? (
                <span className="text-emerald-600 font-bold uppercase text-[11px]">Free Shipping</span>
              ) : (
                formatPrice(shippingCost, currencyCode, currencySymbol)
              )}
            </span>
          </div>

          <div className="border-t border-border pt-3 mt-2 flex justify-between items-baseline">
            <span className="font-bold text-sm text-text-primary">Grand Total</span>
            <span className="text-xl font-black text-brand-700">
              {formatPrice(order.totalAmount, currencyCode, currencySymbol)}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center gap-2 mt-4"
          onClick={onOpenInvoice}
        >
          <FileText className="w-4 h-4" />
          Download / Print Invoice
        </Button>
      </div>
    </div>
  );
}
