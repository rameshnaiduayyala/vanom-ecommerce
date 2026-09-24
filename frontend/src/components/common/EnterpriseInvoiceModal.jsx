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
import { apiClient } from "@/services/api/axios.js";

/**
 * EnterpriseInvoiceModal
 * Reusable, pixel-perfect, print-ready enterprise invoice modal for both
 * Retail B2C Store Orders and B2B Wholesale Bulk Purchase Orders.
 * Features an executive wide-format canvas, smart copy tools, and cryptographic audit QR codes.
 */
export function EnterpriseInvoiceModal({ isOpen, onClose, order, type = "RETAIL" }) {
  const [copied, setCopied] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  const isB2B = type === "B2B" || order?.customerGroupCode === "B2B" || !!order?.bulkProduct || !!order?.company;
  const orderNumber = order?.orderNumber || (isB2B ? `PO-${order?.id?.slice(0, 8)?.toUpperCase()}` : `ORD-${order?.id?.slice(0, 8)?.toUpperCase()}`);

  // Fetch the generated PDFKit invoice blob when modal opens
  React.useEffect(() => {
    let activeUrl = null;
    if (isOpen && order?.id) {
      setIsLoadingPdf(true);
      setPdfError(false);
      const url = isB2B ? `/bulk/orders/${order.id}/invoice` : `/orders/${order.id}/invoice`;

      apiClient
        .get(url, {
          responseType: "blob",
          headers: { Accept: "application/pdf" },
        })
        .then((response) => {
          const rawBlob = response instanceof Blob ? response : response.data instanceof Blob ? response.data : new Blob([response.data || response], { type: "application/pdf" });
          activeUrl = window.URL.createObjectURL(rawBlob);
          setPdfBlobUrl(activeUrl);
          setIsLoadingPdf(false);
        })
        .catch((err) => {
          console.error("Failed to load PDF preview", err);
          setPdfError(true);
          setIsLoadingPdf(false);
        });
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, order?.id, isB2B]);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (pdfBlobUrl) {
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = `Invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintPdf = () => {
    if (pdfBlobUrl) {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = pdfBlobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
    }
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

  // Dynamic scan URL that opens directly to this invoice/order details in any browser/phone QR scanner
  const invoiceScanUrl = typeof window !== "undefined"
    ? `${window.location.origin}/orders/${order.id || orderNumber}`
    : `https://vanom-commerce.com/orders/${order.id || orderNumber}`;

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
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={!pdfBlobUrl}
              className="gap-1.5 text-xs text-slate-800 bg-white hover:bg-slate-50 border-slate-300 font-semibold cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download PDF</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handlePrintPdf}
              disabled={!pdfBlobUrl}
              className="gap-2 bg-[#006B3C] hover:bg-[#005530] text-white shadow-xs cursor-pointer font-semibold px-4"
            >
              <Printer className="w-4 h-4" />
              <span>Print PDF</span>
            </Button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Generated PDF Document Viewer */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-900/90 min-h-[550px]">
          {isLoadingPdf ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20 text-slate-300">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-semibold text-sm">Generating Official PDF Document...</p>
              <p className="text-xs text-slate-400">Rendering vector layout, QR security stamp, and invoice metadata</p>
            </div>
          ) : pdfError || !pdfBlobUrl ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20 text-slate-300 max-w-sm text-center">
              <FileText className="w-12 h-12 text-rose-400" />
              <p className="font-bold text-base text-white">Could not generate live PDF preview</p>
              <p className="text-xs text-slate-400">
                Please check your network connection or click Download PDF to retrieve the document.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                className="mt-2 text-white border-slate-600 hover:bg-slate-800"
              >
                Retry Download
              </Button>
            </div>
          ) : (
            <div className="w-full h-full min-h-[650px] max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-white">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                title={`Invoice ${orderNumber}`}
                className="w-full h-[75vh] border-0 rounded-xl"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

