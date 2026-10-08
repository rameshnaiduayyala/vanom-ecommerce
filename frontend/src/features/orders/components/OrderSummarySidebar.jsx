import React from "react";
import { MapPin, FileText } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { formatPrice } from "../../../utils/formatters.js";

export function OrderSummarySidebar({ order, currencyCode, currencySymbol, onOpenInvoice }) {
  const shippingCost = Number(order.shippingCharges || order.shippingCost || order.shippingAmount || 0);
  const discountAmount = Number(order.discount || order.discountAmount || 0);
  const taxAmount = Number(order.tax || order.taxAmount || 0);
  const totalAmount = Number(order.total ?? order.totalAmount ?? 0);

  const shippingAddr =
    order.shippingAddress ||
    (Array.isArray(order.addresses)
      ? order.addresses.find((a) => a.type === "SHIPPING" || a.type === "DELIVERY") || order.addresses[0]
      : null);

  const formatCountryName = (addr) => {
    const raw = addr?.countryCode || addr?.country || order.country?.name;
    if (!raw) return "";
    const upper = String(raw).toUpperCase();
    if (upper === "US" || upper === "USA" || upper === "UNITED STATES") return "United States";
    if (upper === "CA" || upper === "CAN" || upper === "CANADA") return "Canada";
    return raw;
  };

  return (
    <div className="space-y-6">
      {/* Destination Address */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 pb-2 border-b border-border">
          <MapPin className="w-4 h-4 text-brand-600" />
          Delivery Destination
        </h4>
        <div className="text-xs text-text-secondary leading-relaxed space-y-1 pt-1">
          {shippingAddr ? (
            <>
              <p className="font-bold text-text-primary text-sm">
                {shippingAddr.fullName ||
                  shippingAddr.name ||
                  `${order.user?.firstName || "Customer"} ${order.user?.lastName || ""}`}
              </p>
              <p>
                {shippingAddr.addressLine1 ||
                  shippingAddr.streetAddress ||
                  shippingAddr.line1 ||
                  shippingAddr.address ||
                  ""}
              </p>
              {(shippingAddr.addressLine2 || shippingAddr.line2) && (
                <p>{shippingAddr.addressLine2 || shippingAddr.line2}</p>
              )}
              <p>
                {[shippingAddr.city, shippingAddr.state].filter(Boolean).join(", ")}{" "}
                <span className="font-mono font-bold text-text-primary">
                  {shippingAddr.postalCode || shippingAddr.pinCode || shippingAddr.zip || ""}
                </span>
              </p>
              {formatCountryName(shippingAddr) && (
                <p className="font-semibold text-brand-700 pt-1">
                  {formatCountryName(shippingAddr)}
                </p>
              )}
              {shippingAddr.phone && (
                <p className="text-text-muted pt-1">Contact: {shippingAddr.phone}</p>
              )}
            </>
          ) : (
            <p className="text-text-muted italic">No delivery destination provided</p>
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
              {formatPrice(order.subtotal || 0, currencyCode, currencySymbol)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-medium">
              <span>Wholesale / Promo Discount</span>
              <span>- {formatPrice(discountAmount, currencyCode, currencySymbol)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between items-center">
              <span>Tax / VAT Included</span>
              <span className="font-semibold text-text-primary">
                {formatPrice(taxAmount, currencyCode, currencySymbol)}
              </span>
            </div>
          )}

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
              {formatPrice(totalAmount, currencyCode, currencySymbol)}
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
