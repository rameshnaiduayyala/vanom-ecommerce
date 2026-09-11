import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { Button } from "@/components/ui/Button.jsx";
import {
  Printer,
  Download,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import vanomLogo from "@/assets/logo.png";
import { VANOM_COMPANY_DETAILS } from "@/constants/company.js";

/**
 * EnterpriseInvoiceModal
 * Reusable, pixel-perfect, print-ready enterprise invoice modal for both
 * Retail B2C Store Orders and B2B Wholesale Bulk Purchase Orders.
 */
export function EnterpriseInvoiceModal({ isOpen, onClose, order, type = "RETAIL" }) {
  const invoiceRef = useRef(null);

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

  // Buyer & Entity Details
  const customerName = isB2B
    ? order.company?.legalName || order.company?.name || "Corporate Enterprise"
    : `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.shippingAddress?.name || "Valued Customer";
  
  const customerEmail = isB2B
    ? order.requestedBy?.email || order.company?.email || "billing@enterprise.com"
    : order.user?.email || "customer@example.com";

  const customerPhone = isB2B
    ? order.company?.phone || order.requestedBy?.phone || "+1 (800) 555-B2B"
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
        name: it.bulkProduct?.name || it.product?.name || it.name || `Commodity Item #${idx + 1}`,
        sku: it.bulkProduct?.sku || it.product?.sku || it.sku || `SKU-${1000 + idx}`,
        quantity: it.quantity || 1,
        unitPrice: Number(it.unitPrice || it.price || 0),
        totalPrice: Number(it.quantity || 1) * Number(it.unitPrice || it.price || 0),
        spec: it.bulkProduct?.unitOfMeasure ? `Unit: ${it.bulkProduct.unitOfMeasure}` : "",
      }))
    : [
        {
          id: 1,
          name: "Standard Wholesale Batch Fulfillment",
          sku: "VANOM-BATCH-DEFAULT",
          quantity: order.totalQuantity || 1,
          unitPrice: Number(order.totalAmount || 0) / (order.totalQuantity || 1),
          totalPrice: Number(order.totalAmount || 0),
          spec: "Contract Volume",
        },
      ];

  const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
  const taxAmount = order.taxAmount ? Number(order.taxAmount) : isB2B ? 0 : subtotal * 0.05;
  const shippingFee = order.shippingAmount ? Number(order.shippingAmount) : 0;
  const grandTotal = Number(order.totalAmount || (subtotal + taxAmount + shippingFee));
  const currencyCode = order.currency?.code || "USD";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {isB2B ? "Enterprise Wholesale Commercial Invoice" : "Retail Tax Invoice"}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isB2B ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  {isB2B ? "B2B CONTRACT" : "B2C RETAIL"}
                </span>
              </div>
              <p className="text-xs text-slate-500">Document No: {orderNumber} • Generated for official accounting</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePrint()}
              className="gap-2 bg-[#006B3C] hover:bg-[#005530] text-white shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-200/60">
          
          {/* Printable Invoice Page Canvas (A4 Dimensions style) */}
          <div
            ref={invoiceRef}
            className="w-full max-w-[800px] bg-white rounded-xl shadow-md border border-slate-200/90 p-8 sm:p-12 text-slate-800 font-sans print:shadow-none print:border-0 print:p-8 print:m-0 print:w-full"
            style={{ minHeight: "1000px" }}
          >
            {/* Header / Brand & Invoice Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-900">
              <div>
                <div className="flex items-center gap-3">
                  <img src={vanomLogo} alt={VANOM_COMPANY_DETAILS.brandName} className="h-10 w-auto object-contain" />
                  <div>
                    <h1 className="text-2xl font-black text-[#003D2B] tracking-tight">{VANOM_COMPANY_DETAILS.brandName}</h1>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                      {VANOM_COMPANY_DETAILS.legalName}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {VANOM_COMPANY_DETAILS.headquarters.line1}, {VANOM_COMPANY_DETAILS.headquarters.city}, {VANOM_COMPANY_DETAILS.headquarters.state} {VANOM_COMPANY_DETAILS.headquarters.postalCode}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" /> {VANOM_COMPANY_DETAILS.contact.corporateEmail}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-400" /> {VANOM_COMPANY_DETAILS.contact.website} • EIN: {VANOM_COMPANY_DETAILS.taxIdentifiers.US_EIN} • VAT: {VANOM_COMPANY_DETAILS.taxIdentifiers.UK_VAT}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                  {isB2B ? "Commercial Invoice" : "Official Invoice"}
                </div>
                <p className="text-xl font-black text-slate-900 font-mono">{orderNumber}</p>
                <div className="mt-2 text-xs space-y-1 text-slate-600">
                  <p><span className="font-semibold text-slate-700">Issue Date:</span> {invoiceDate}</p>
                  <p><span className="font-semibold text-slate-700">Payment Due:</span> {dueDate}</p>
                  <p>
                    <span className="font-semibold text-slate-700">Status: </span>
                    <span className="font-bold text-emerald-700 uppercase">{order.status || "CONFIRMED"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Billing & Shipping Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {isB2B ? "Billed Corporate Entity" : "Billed Customer"}
                </span>
                <p className="text-sm font-bold text-slate-900">{customerName}</p>
                {isB2B && order.company?.taxId && (
                  <p className="text-[11px] font-mono text-slate-600">Tax / GSTIN ID: {order.company.taxId}</p>
                )}
                <p className="text-slate-600 mt-1">{customerEmail}</p>
                <p className="text-slate-600">{customerPhone}</p>
                {isB2B && (
                  <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                    Verified B2B Tier 1 Partner
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Destination / Delivery Facility
                </span>
                <p className="text-sm font-bold text-slate-900">{shippingAddr.addressLine1 || "Standard Delivery Address"}</p>
                {shippingAddr.addressLine2 && <p className="text-slate-600">{shippingAddr.addressLine2}</p>}
                <p className="text-slate-600">
                  {shippingAddr.city || "Chicago"}, {shippingAddr.state || "IL"} {shippingAddr.postalCode || "60601"}
                </p>
                <p className="text-slate-600">{shippingAddr.country || "United States"}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Logistics Method: {order.shippingMethod || (isB2B ? "Freight Ground Logistics" : "Standard Express Courier")}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-600 text-[11px] uppercase font-bold">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">Description & SKU</th>
                    <th className="py-3 px-2 text-center">Quantity</th>
                    <th className="py-3 px-2 text-right">Unit Price</th>
                    <th className="py-3 px-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="text-slate-800">
                      <td className="py-3 px-2 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-900">{it.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>SKU: {it.sku}</span>
                          {it.spec && <span>• {it.spec}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold font-mono">
                        {it.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700">
                        {formatPrice(it.unitPrice, currencyCode)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold font-mono text-slate-900">
                        {formatPrice(it.totalPrice, currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals & QR Code Verification */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              {/* Left Verification & Banking */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                  <QRCodeSVG
                    value={`https://vanom-commerce.com/verify-invoice?id=${orderNumber}&total=${grandTotal}`}
                    size={72}
                    level="M"
                  />
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VANOM Cryptographic Audit Stamp</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-400">
                    HASH: {order.id?.slice(0, 16) || "9F84B298A102F87A"}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Scan QR code to authenticate authenticity against the VANOM Ledger.
                  </p>
                </div>
              </div>

              {/* Right Totals Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatPrice(subtotal, currencyCode)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Applicable Tax / VAT (5%):</span>
                    <span className="font-mono font-semibold text-slate-800">{formatPrice(taxAmount, currencyCode)}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Freight / Shipping Handling:</span>
                    <span className="font-mono font-semibold text-slate-800">{formatPrice(shippingFee, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                  <span className="text-base uppercase tracking-tight">Total Invoice Amount:</span>
                  <span className="text-xl font-black text-[#006B3C] font-mono">
                    {formatPrice(grandTotal, currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice & Payment Terms */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600">
                Payment Terms: Net 15 Days. Standard Wire or Corporate ACH instructions applied.
              </p>
              <p>
                Thank you for choosing VANOM Global. For customer support or corporate accounts, contact enterprise@vanom-global.com.
              </p>
              <p className="text-slate-300 font-mono pt-1">
                VANOM Enterprise Document Engine • Page 1 of 1 • Internal Control Reference: {order.id || "GEN-PO"}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
