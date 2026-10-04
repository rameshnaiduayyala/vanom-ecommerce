import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ExternalLink,
  Tag,
  Boxes,
  Truck,
  Building,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Printer,
  X,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { resolveProductImageUrl } from "@/utils/image.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { openDirectInvoicePdf } from "@/utils/invoice.js";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80";

export function AdminOrderDetailsModal({ order, isOpen, onClose, onStatusChange }) {
  if (!isOpen || !order) return null;

  const isB2B = Boolean(
    order.bulkProduct ||
    order.company ||
    order.orderNumber?.startsWith("BULK") ||
    order.business ||
    order.type === "B2B"
  );

  const currencyCode = order.currencyCode || order.currency?.code || (order.currency === "USD" ? "USD" : "USD");
  const orderNumber = order.orderNumber || (order.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : "ORDER");

  const customerName =
    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
    order.requestedBy?.firstName ||
    order.user?.email ||
    order.company?.legalName ||
    order.shippingAddress?.name ||
    order.shippingAddress?.fullName ||
    "Customer";

  const customerEmail = order.user?.email || order.requestedBy?.email || order.company?.email;

  const shippingAddr =
    order.shippingAddress ||
    (Array.isArray(order.addresses) ? order.addresses.find((a) => a.type === "SHIPPING" || a.type === "DELIVERY") : null) ||
    (Array.isArray(order.addresses) && order.addresses[0]) ||
    null;

  // Extract items list
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : Array.isArray(order.commodityLines) && order.commodityLines.length > 0
      ? order.commodityLines
      : [];

  const subtotal = Number(order.subtotal ?? 0);
  const tax = Number(order.tax ?? 0);
  const shippingCharges = Number(order.shippingCharges ?? 0);
  const grandTotal = Number(order.total ?? order.totalAmount ?? (subtotal + tax + shippingCharges));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-extrabold text-slate-900 font-mono tracking-tight">
                  {orderNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  {isB2B ? "Enterprise Wholesale PO" : "Consumer Retail Order"}
                </span>
                <Badge
                  variant={
                    order.status === "DELIVERED"
                      ? "green"
                      : order.status === "SHIPPED"
                        ? "blue"
                        : order.status === "CANCELLED"
                          ? "red"
                          : order.status === "PROCESSING" || order.status === "CONFIRMED"
                            ? "brand"
                            : "amber"
                  }
                  size="sm"
                >
                  {order.status || "PENDING"}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(order.createdAt || new Date())}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  ID: {order.id}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Customer & Delivery Context Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            {/* Buyer / Customer */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Customer & Contact
              </span>
              <p className="font-bold text-slate-900 text-sm">{customerName}</p>
              {customerEmail && (
                <p className="text-slate-500 font-mono text-[11px]">{customerEmail}</p>
              )}
              {order.company?.legalName && (
                <p className="text-emerald-700 font-medium text-[11px]">
                  Company: {order.company.legalName}
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Delivery Destination
              </span>
              {shippingAddr ? (
                <div className="text-slate-800 leading-tight space-y-0.5">
                  <p className="font-semibold text-slate-900">
                    {shippingAddr.fullName || shippingAddr.name || customerName}
                  </p>
                  <p className="text-slate-600">
                    {shippingAddr.addressLine1 || shippingAddr.street || shippingAddr.address}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {[
                      shippingAddr.city,
                      shippingAddr.state,
                      shippingAddr.postalCode || shippingAddr.zip,
                      shippingAddr.country || shippingAddr.countryCode
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No delivery address specified</p>
              )}
            </div>
          </div>

          {/* ── DETAILED ORDERED ITEMS LIST WITH PRODUCT IMAGES ── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                Ordered Line Items ({items.length})
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-slate-400 italic">
                No individual item records found for this order.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {items.map((it, idx) => {
                  const product = it.product || {};
                  const variant = it.variant || {};
                  const name = it.name || it.productName || product.name || `Ordered Item #${idx + 1}`;
                  const sku = it.sku || variant.sku || product.sku || "SKU-N/A";
                  const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
                  const qty = Number(it.quantity ?? 1);
                  const lineTotal = Number(it.total ?? it.subtotal ?? (unitPrice * qty));

                  // Extract image
                  const imgUrl =
                    resolveProductImageUrl(product) ||
                    (Array.isArray(product.images) && product.images[0]?.url) ||
                    (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
                    it.image ||
                    it.imageUrl ||
                    product.image ||
                    DEFAULT_IMAGE;

                  return (
                    <div
                      key={it.id || idx}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Product Thumbnail & Identity */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          <img
                            src={imgUrl}
                            alt={name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = DEFAULT_IMAGE;
                            }}
                          />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {name}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {sku}
                            </span>

                            {variant.name && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                Variant: {variant.name}
                              </span>
                            )}

                            {product.category?.name && (
                              <span className="text-[10px] text-slate-500">
                                • {product.category.name}
                              </span>
                            )}
                          </div>

                          {it.notes && (
                            <p className="text-[10px] text-slate-400 italic">{it.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Pricing */}
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                          {formatPrice(lineTotal, currencyCode)}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {qty} × {formatPrice(unitPrice, currencyCode)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── FINANCIALS BREAKDOWN ── */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatPrice(subtotal || grandTotal - tax - shippingCharges, currencyCode)}
              </span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Calculated Tax (Stripe Tax):</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatPrice(tax, currencyCode)}
                </span>
              </div>
            )}

            {shippingCharges > 0 && (
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Shipping & Handling:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatPrice(shippingCharges, currencyCode)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Grand Total Amount:</span>
              <span className="text-base font-black text-emerald-800 font-mono">
                {formatPrice(grandTotal, currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => openDirectInvoicePdf(order.id, isB2B, orderNumber)}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer font-semibold shadow-2xs"
            >
              Print Tax Invoice
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onStatusChange && (
              <select
                value={order.status || "PROCESSING"}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 focus:outline-none focus:border-[#00875A] cursor-pointer shadow-2xs"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="cursor-pointer font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailsModal;
