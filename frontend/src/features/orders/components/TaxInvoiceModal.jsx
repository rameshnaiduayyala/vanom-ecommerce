import React from "react";
import { FileText, Printer, X, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import vanomLogo from "../../../assets/logo.png";

export function TaxInvoiceModal({
  order,
  isOpen,
  onClose,
  onPrint,
  currencyCode,
  currencySymbol,
  statusConfig,
}) {
  if (!isOpen) return null;

  const resolvedStatus = statusConfig || {
    label: order.status?.replace(/_/g, " ") || "Confirmed",
    color: "emerald",
  };
  const shippingCost = Number(order.shippingCost || order.shippingAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-border max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Header (Hidden on print) */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-text-primary">
              Tax Invoice - {order.orderNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrint}
              className="flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 space-y-8 overflow-y-auto print:overflow-visible print:p-0" id="tax-invoice-view">
          {/* Invoice Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-brand-600 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={vanomLogo}
                  alt="Vanom Enterprise Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div className="text-[11px] text-text-muted mt-2 space-y-0.5 pl-1">
                <p>GSTIN: 27AABCV1234F1Z9</p>
                <p>Vanom Logistics Park, Sector 18, Gurugram, Haryana - 122015, India</p>
                <p>Support: support@vanom.com | +91 1800-123-VANOM</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="flex items-center sm:justify-end gap-2">
                <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-md border border-brand-200 uppercase tracking-wider">
                  Tax Invoice
                </span>
                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200 uppercase tracking-wider">
                  {resolvedStatus.label}
                </span>
              </div>
              <p className="text-xs font-bold text-text-primary pt-2">
                Invoice #:{" "}
                <span className="font-mono">
                  {order.invoice?.invoiceNumber || `INV-${order.orderNumber}`}
                </span>
              </p>
              <p className="text-xs text-text-muted">
                Order Ref: <span className="font-mono">{order.orderNumber}</span>
              </p>
              <p className="text-xs text-text-muted">
                Invoice Date: {formatDate(order.createdAt, true)}
              </p>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-text-secondary">
            <div className="p-4 rounded-xl bg-surface-muted/50 border border-border space-y-1.5">
              <h5 className="font-bold text-text-primary uppercase text-[11px] text-brand-700">
                Billed To / Buyer Details:
              </h5>
              <p className="font-bold text-text-primary text-sm">
                {order.user?.firstName} {order.user?.lastName}
              </p>
              {order.company && (
                <p className="font-semibold text-text-primary flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Company: {order.company.name}
                </p>
              )}
              <p>
                {order.billingAddress?.line1 ||
                  order.shippingAddress?.streetAddress ||
                  order.shippingAddress?.line1 ||
                  "Customer Address"}
              </p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="font-medium text-text-primary">
                {order.shippingAddress?.country || "India"}
              </p>
              <p className="text-text-muted pt-1">Email: {order.user?.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted/50 border border-border space-y-1.5">
              <h5 className="font-bold text-text-primary uppercase text-[11px] text-brand-700">
                Shipped To / Delivery Address:
              </h5>
              <p className="font-bold text-text-primary text-sm">
                {order.shippingAddress?.fullName ||
                  order.shippingAddress?.name ||
                  `${order.user?.firstName || "Customer"} ${order.user?.lastName || ""}`}
              </p>
              <p>
                {order.shippingAddress?.streetAddress ||
                  order.shippingAddress?.line1 ||
                  "Customer Shipping Address"}
              </p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="font-medium text-text-primary">
                {order.shippingAddress?.country || "India"}
              </p>
              {order.shippingAddress?.phone && (
                <p className="text-text-muted pt-1">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-text-secondary font-bold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items?.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-surface-muted/30">
                    <td className="py-3 px-4 text-text-muted">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-text-primary">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                      {item.sku || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatPrice(item.unitPrice, currencyCode, currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-primary">
                      {formatPrice(
                        item.subtotal || item.unitPrice * item.quantity,
                        currencyCode,
                        currencySymbol
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="text-[11px] text-text-muted max-w-sm space-y-1">
              <p className="font-bold text-text-primary">Terms & Declaration:</p>
              <p>
                This is a computer-generated commercial tax invoice. All supplies are guaranteed
                genuine and inspected in accordance with international quality standards.
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(order.subtotal, currencyCode, currencySymbol)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- {formatPrice(discountAmount, currencyCode, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax Amount (GST):</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(order.taxAmount, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges:</span>
                <span className="font-semibold text-text-primary">
                  {shippingCost === 0
                    ? "₹0.00 (Free)"
                    : formatPrice(shippingCost, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="border-t-2 border-brand-600 pt-2 flex justify-between text-sm font-black text-brand-700">
                <span>Total Payable:</span>
                <span>{formatPrice(order.totalAmount, currencyCode, currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
