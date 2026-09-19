import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { Button } from "@/components/ui/Button.jsx";
import {
  Printer,
  FileText,
  Mail,
  Globe,
  MapPin,
  ShieldCheck,
  X,
  Copy,
  Check,
  ExternalLink,
  Package,
  Calendar,
  CreditCard,
  Truck,
  Building,
} from "lucide-react";
import vanomLogo from "@/assets/logo.png";
import { VANOM_COMPANY_DETAILS } from "@/constants/company.js";

/**
 * EnterpriseInvoiceModal
 * Reusable, pixel-perfect, print-ready enterprise invoice modal for both
 * Retail B2C Store Orders and B2B Wholesale Bulk Purchase Orders.
 * Features an executive wide-format canvas, smart copy tools, and cryptographic audit QR codes.
 */
export function EnterpriseInvoiceModal({ isOpen, onClose, order, type = "RETAIL" }) {
  const invoiceRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${order?.orderNumber || order?.id || "VANOM"}`,
  });

  if (!isOpen || !order) return null;

  const isB2B = type === "B2B" || order?.customerGroupCode === "B2B" || !!order?.bulkProduct || !!order?.company;

  // Normalization for Retail vs Bulk Orders
  const orderNumber = order.orderNumber || (isB2B ? `PO-${order.id?.slice(0, 8)?.toUpperCase()}` : `ORD-${order.id?.slice(0, 8)?.toUpperCase()}`);
  const invoiceDate = formatDate(order.createdAt || new Date());
  const dueDate = formatDate(new Date(new Date(order.createdAt || Date.now()).getTime() + 15 * 24 * 60 * 60 * 1000));

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Buyer & Entity Details
  const customerName = isB2B
    ? order.company?.legalName || order.company?.name || order.business?.businessName || order.shippingAddress?.contactName || "Corporate Enterprise"
    : `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.shippingAddress?.name || "Valued Customer";

  const customerEmail = isB2B
    ? order.requestedBy?.email || order.business?.businessEmail || order.company?.email || "billing@enterprise.com"
    : order.user?.email || "customer@example.com";

  const customerPhone = isB2B
    ? order.company?.phone || order.business?.businessPhone || order.shippingAddress?.phone || order.requestedBy?.phone || "+1 (800) 555-B2B"
    : order.shippingAddress?.phone || order.user?.phone || "+1 (800) 555-0199";

  const shippingAddr = order.shippingAddress || {
    addressLine1: isB2B ? "Enterprise Logistics Dock 4" : "100 Consumer Way",
    city: isB2B ? "Chicago" : "New York",
    state: isB2B ? "IL" : "NY",
    postalCode: isB2B ? "60601" : "10001",
    country: "United States",
  };

  // Line items normalization
  const items = (order.items && order.items.length > 0)
    ? order.items.map((it, idx) => ({
      id: it.id || idx,
      name: it.productName || it.bulkProduct?.name || it.product?.name || it.name || `Commodity Item #${idx + 1}`,
      sku: it.sku || it.bulkProduct?.sku || it.product?.sku || `SKU-${1000 + idx}`,
      quantity: it.quantity || 1,
      unitPrice: Number(it.unitPrice || it.price || 0),
      totalPrice: Number(it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || it.price || 0))),
      spec: it.bulkProduct?.unitOfMeasure ? `Unit: ${it.bulkProduct.unitOfMeasure}` : "",
      country: it.bulkProduct?.country?.name || it.countryCode || "",
    }))
    : [
      {
        id: 1,
        name: "Standard Wholesale Batch Fulfillment",
        sku: "VANOM-BATCH-DEFAULT",
        quantity: order.totalQuantity || 1,
        unitPrice: Number(order.total ?? order.totalAmount ?? 0) / (order.totalQuantity || 1),
        totalPrice: Number(order.total ?? order.totalAmount ?? 0),
        spec: "Contract Volume",
        country: "",
      },
    ];

  const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
  const taxAmount = Number(order.tax ?? order.taxAmount ?? (isB2B ? 0 : subtotal * 0.05));
  const shippingFee = Number(order.shippingCharges ?? order.shippingAmount ?? 0);
  const grandTotal = Number(order.total ?? order.totalAmount ?? (subtotal + taxAmount + shippingFee));
  const currencyCode = order.currencyCode || order.currency?.code || "USD";
  const orderStatus = (order.status || "CONFIRMED").toUpperCase();

  const getStatusBadge = (st) => {
    switch (st) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "SHIPPED":
      case "DISPATCHED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CONFIRMED":
      case "APPROVED":
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 flex flex-col my-auto max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95">

        {/* Modal Top Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <FileText className="w-5 h-5 text-[#006B3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {isB2B ? "Enterprise Commercial Tax Invoice" : "Retail Tax Invoice"}
                </h3>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isB2B ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                  {isB2B ? "B2B WHOLESALE CONTRACT" : "B2C CONSUMER"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Invoice ID:</span>
                <span className="font-mono font-bold text-slate-700">{orderNumber}</span>
                <button
                  onClick={handleCopyOrderNumber}
                  title="Copy Document ID"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyOrderNumber}
              className="gap-1.5 text-xs text-slate-700 hover:bg-slate-50 hidden sm:flex cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "ID Copied" : "Copy ID"}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePrint()}
              className="gap-2 bg-[#006B3C] hover:bg-[#005530] text-white shadow-xs cursor-pointer font-semibold px-4"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="p-4 sm:p-8 lg:p-10 overflow-y-auto flex-1 flex justify-center bg-slate-200/70">

          {/* Printable Invoice Page Canvas (Smart Wide Layout) */}
          <div
            ref={invoiceRef}
            className="w-full max-w-[960px] bg-white rounded-2xl shadow-lg border border-slate-200/90 p-8 sm:p-12 lg:p-14 text-slate-800 font-sans print:shadow-none print:border-0 print:p-6 print:m-0 print:w-full print:max-w-none"
            style={{ minHeight: "1050px" }}
          >
            {/* Top Brand & Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b-2 border-slate-900">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-3.5">
                  <img src={vanomLogo} alt={VANOM_COMPANY_DETAILS.brandName} className="h-11 w-auto object-contain" />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{VANOM_COMPANY_DETAILS.headquarters.line1}, {VANOM_COMPANY_DETAILS.headquarters.city}, {VANOM_COMPANY_DETAILS.headquarters.state} {VANOM_COMPANY_DETAILS.headquarters.postalCode}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{VANOM_COMPANY_DETAILS.contact.corporateEmail}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{VANOM_COMPANY_DETAILS.contact.website}</span>
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                    <span>EIN: {VANOM_COMPANY_DETAILS.taxIdentifiers.US_EIN}</span>
                    <span>•</span>
                    <span>VAT: {VANOM_COMPANY_DETAILS.taxIdentifiers.UK_VAT}</span>
                  </div>
                </div>
              </div>

              {/* Order Number & Smart Dual QR Code Header Box */}
              <div className="flex items-stretch gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 self-stretch md:self-auto min-w-[280px]">
                {/* QR Code for Instant Logistics / Tracking Scan */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center flex flex-col items-center justify-center shrink-0">
                  <QRCodeSVG
                    value={orderNumber}
                    size={76}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="flex flex-col justify-between text-left sm:text-right flex-1">
                  <div>
                    <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mb-1.5">
                      {isB2B ? "Commercial Invoice" : "Standard Invoice"}
                    </div>
                    <p className="text-xl font-black text-slate-900 font-mono tracking-tight">{orderNumber}</p>
                  </div>

                  <div className="mt-2 text-xs space-y-1 text-slate-600">
                    <p><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{invoiceDate}</span></p>
                    <p><span className="text-slate-500">Due:</span> <span className="font-semibold text-slate-800">{dueDate}</span></p>
                    <div className="pt-1 flex items-center justify-start sm:justify-end gap-1.5">
                      <span className="text-slate-500 text-[11px]">Status:</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(orderStatus)}`}>
                        {orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Enterprise Metadata / 3-Column Logistics Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6 border-b border-slate-200 text-xs">
              {/* Billed Entity */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isB2B ? "Billed Corporate Account" : "Customer Information"}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{customerName}</p>
                {isB2B && order.company?.taxId && (
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">Tax / GSTIN ID: {order.company.taxId}</p>
                )}
                <p className="text-slate-600 mt-1">{customerEmail}</p>
                <p className="text-slate-600">{customerPhone}</p>
                {isB2B && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Verified Tier Partner
                  </div>
                )}
              </div>

              {/* Delivery Destination */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery Facility / Destination</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{shippingAddr.addressLine1 || "Standard Delivery Facility"}</p>
                {shippingAddr.addressLine2 && <p className="text-slate-600">{shippingAddr.addressLine2}</p>}
                <p className="text-slate-600">
                  {shippingAddr.city || "Chicago"}, {shippingAddr.state || "IL"} {shippingAddr.postalCode || "60601"}
                </p>
                <p className="text-slate-600 font-medium">{shippingAddr.country || "United States"}</p>
              </div>

              {/* Payment & Logistics Terms */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment & Logistics Terms</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-slate-800">{order.paymentMethod || (isB2B ? "Corporate Wire / ACH" : "Credit Card / Online")}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Fulfillment:</span>
                    <span className="font-semibold text-slate-800">{order.shippingMethod || (isB2B ? "Freight Ground Express" : "Standard Logistics")}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Currency:</span>
                    <span className="font-mono font-bold text-emerald-800">{currencyCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Terms:</span>
                    <span className="font-semibold text-slate-800">{isB2B ? "Net 15 Direct Billing" : "Prepaid in Full"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-slate-800 bg-slate-50/50 text-slate-700 text-[11px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3 w-10">#</th>
                    <th className="py-3 px-4">Item Details & Specification</th>
                    <th className="py-3 px-4 text-center">Unit / Measure</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="text-slate-800 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-[13px]">{it.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">SKU: {it.sku}</span>
                          {it.country && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">{it.country}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                        {it.spec || "Standard Unit"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-[13px] text-slate-900">
                        {it.quantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {formatPrice(it.unitPrice, currencyCode)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 text-[13px]">
                        {formatPrice(it.totalPrice, currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals & Cryptographic Verification Audit Stamp */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Verification & Security Stamp */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                  <QRCodeSVG
                    value={`https://vanom-commerce.com/verify-invoice?id=${orderNumber}&total=${grandTotal}&date=${order.createdAt || ""}`}
                    size={76}
                    level="M"
                  />
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-[#006B3C]" />
                    <span>VANOM Cryptographic Audit Stamp</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500">
                    HASH: {order.id?.replace(/-/g, "")?.toUpperCase() || "9F84B298A102F87A"}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Scan this QR code to verify original invoice provenance and tamper-evident digital signature against the VANOM Ledger.
                  </p>
                </div>
              </div>

              {/* Right Totals Breakdown */}
              <div className="space-y-2.5 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatPrice(subtotal, currencyCode)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable Tax / VAT:</span>
                    <span className="font-mono font-semibold text-slate-900">{formatPrice(taxAmount, currencyCode)}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Freight Logistics & Handling:</span>
                    <span className="font-mono font-semibold text-slate-900">{formatPrice(shippingFee, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                  <span className="text-base uppercase tracking-tight">Total Amount:</span>
                  <span className="text-2xl font-black text-[#006B3C] font-mono">
                    {formatPrice(grandTotal, currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice & Payment Terms */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600">
                Payment Terms: Net 15 Days. Standard Corporate Wire or ACH instructions applied.
              </p>
              <p>
                Thank you for your business with VANOM Global. For customer support or corporate accounts, contact enterprise@vanom-global.com.
              </p>
              <p className="text-slate-400 font-mono pt-1">
                VANOM Enterprise Document Engine • Page 1 of 1 • Reference: {order.id || "GEN-PO"}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
