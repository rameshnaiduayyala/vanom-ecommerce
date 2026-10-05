import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "@/utils/formatters.js";
import { ROUTES } from "@/constants/routes.js";
import {
  PackageCheck,
  Clock,
  FileText,
  Building2,
  MapPin,
  X,
  Package,
  FileSpreadsheet,
  Scale,
  Calendar,
  Globe2
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { openDirectInvoicePdf } from "@/utils/invoice.js";
import { exportOrdersToExcel } from "@/utils/excel.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

export function B2BOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["b2b-bulk-orders-list"],
    queryFn: async () => {
      try {
        const res = await Api.b2b.listBulkOrders();
        if (res?.items) return res.items;
        if (Array.isArray(res)) return res;
      } catch (err) {
        console.warn("Falling back to standard orders query", err);
      }
      const fallback = await Api.orders.list();
      return fallback?.items?.filter((o) => o.type === "B2B") || [];
    },
  });

  const orders = data || [];

  const filteredOrders = orders.filter((o) => {
    const orderNum = (o.orderNumber || o.poNumber || o.id || "").toLowerCase();
    const companyName = (o.company?.legalName || o.company?.name || o.business?.businessName || "").toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || orderNum.includes(query) || companyName.includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      o.status === statusFilter ||
      (statusFilter === "ACTIVE" && o.status !== "CANCELLED" && o.status !== "DELIVERED");

    return matchesSearch && matchesStatus;
  });

  const totalVolume = orders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
  const activeCount = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "DELIVERED").length;

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      await exportOrdersToExcel(filteredOrders, {
        filename: `vanom-wholesale-orders-${new Date().toISOString().slice(0, 10)}.xlsx`,
        title: "VANOM E-COMMERCE - B2B WHOLESALE ORDERS EXPORT",
        filterContext: statusFilter !== "ALL" ? `Status: ${statusFilter}` : "All Orders",
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingle = async (ord) => {
    const num = ord.orderNumber || ord.id;
    await exportOrdersToExcel([ord], {
      filename: `vanom-wholesale-order-${num}.xlsx`,
      title: `VANOM E-COMMERCE - B2B WHOLESALE PURCHASE ORDER #${num}`,
      filterContext: `Single Order: #${num}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#003D2B] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            Corporate Procurement Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Wholesale Purchase Orders & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage bulk contract orders, verify weight variants and country pricing, and generate official cryptographic tax invoices and Excel spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={FileSpreadsheet}
            onClick={handleExportAll}
            disabled={filteredOrders.length === 0 || isExporting}
            isLoading={isExporting}
            className="font-bold border-white/30 text-white hover:bg-white/10"
          >
            Export All to Excel
          </Button>

          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button
              variant="primary"
              size="md"
              icon={PackageCheck}
              className="font-bold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-2.5 px-5"
            >
              Create New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Contract Volume
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatPrice(totalVolume, orders[0]?.currencyCode || orders[0]?.currency?.code || "USD")}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Wholesale Orders
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {orders.length} <span className="text-xs font-normal text-slate-400">Purchase Orders</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              In Transit & Active
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {activeCount} <span className="text-xs font-normal text-slate-400">Fulfillments</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO #, Order Number, or Company..."
            className="w-full pl-4 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006B3C] focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "ACTIVE", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#204B38] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">PO / Order #</th>
                <th className="p-4">Company Entity</th>
                <th className="p-4">Country & Market</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                    No wholesale purchase orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const curr = ord.currencyCode || ord.currency?.code || "USD";
                  const countryCode = ord.countryCode || ord.shippingAddress?.countryCode || "US";
                  const itemsCount = ord.items?.length || 1;
                  const totalAmt = Number(ord.total ?? ord.totalAmount ?? 0);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">{ord.orderNumber || ord.id}</span>
                        <span className="text-[11px] text-slate-400">{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Live Order"}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {ord.company?.legalName || ord.company?.name || ord.business?.businessName || "Corporate Wholesale"}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono text-[11px] border border-slate-200">
                          {countryCode === "US" ? "🇺🇸 USA" : countryCode === "CA" ? "🇨🇦 Canada" : countryCode} ({curr})
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {itemsCount} Line Item{itemsCount > 1 ? "s" : ""}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {formatPrice(totalAmt, curr)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            ord.status === "DELIVERED"
                              ? "green"
                              : ord.status === "SHIPPED"
                              ? "blue"
                              : ord.status === "CANCELLED"
                              ? "red"
                              : "yellow"
                          }
                          size="sm"
                        >
                          {ord.status || "CONFIRMED"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 text-xs font-semibold cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportSingle(ord)}
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors border border-emerald-200 cursor-pointer"
                            title="Export to Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDirectInvoicePdf(ord.id, true, ord.orderNumber)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 cursor-pointer"
                            title="View Commercial Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Modal (Detailed Line Items with Weights and Pricing) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Wholesale Purchase Order
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer & Facility Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Authorized Buyer
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedOrder.company?.legalName || selectedOrder.business?.businessName || "Corporate Buyer"}
                </p>
                <p className="text-slate-500">
                  {selectedOrder.business?.businessEmail || selectedOrder.company?.email || "Procurement Account"}
                </p>
                {selectedOrder.business?.taxRegistrationNumber && (
                  <p className="font-mono text-emerald-800 font-semibold">Tax ID: {selectedOrder.business.taxRegistrationNumber}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Destination & Country
                </span>
                <p className="font-bold text-slate-900">
                  {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.line1 || "Enterprise Logistics Facility"}
                </p>
                <p className="text-slate-500">
                  {selectedOrder.shippingAddress?.city || "City"}, {selectedOrder.shippingAddress?.state || "State"} {selectedOrder.shippingAddress?.postalCode || ""}
                </p>
                <p className="text-slate-700 font-semibold flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-slate-400" />
                  {selectedOrder.countryCode === "US" ? "United States" : selectedOrder.countryCode === "CA" ? "Canada" : selectedOrder.countryCode} ({selectedOrder.currencyCode || "USD"})
                </p>
              </div>
            </div>

            {/* Detailed Line Items List with Weights and Product Images */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-700" />
                Purchased Line Items & Weights ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it, idx) => {
                    const weightStr = it.weight
                      ? `${it.weight}${it.weightUnit || "kg"}`
                      : it.variant?.name || "Standard";

                    const itemImg = it.imageUrl || resolveProductImageUrl(it.product) || FALLBACK_PRODUCT_IMAGE;
                    const itemUnit = Number(it.unitPrice || 0);
                    const itemTotal = Number(it.total ?? (it.quantity * itemUnit));
                    const itemCurrency = it.currencyCode || selectedOrder.currencyCode || "USD";

                    return (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50 gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={itemImg}
                            alt={it.productName}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900">
                              {it.productName || it.product?.name || `Wholesale Item #${idx + 1}`}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>SKU: {it.sku || it.product?.sku || "N/A"}</span>
                              <span>•</span>
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {weightStr}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Quantity: <strong className="text-slate-800">{it.quantity}</strong> × {formatPrice(itemUnit, itemCurrency)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-black text-slate-900 text-sm font-mono shrink-0">
                          {formatPrice(itemTotal, itemCurrency)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Wholesale items specified under master contract agreement.
                  </div>
                )}
              </div>
            </div>

            {/* Financials Breakdown */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatPrice(Number(selectedOrder.subtotal || 0), selectedOrder.currencyCode || "USD")}
                </span>
              </div>
              {Number(selectedOrder.tax || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-mono text-slate-800">
                    {formatPrice(Number(selectedOrder.tax || 0), selectedOrder.currencyCode || "USD")}
                  </span>
                </div>
              )}
              {Number(selectedOrder.shippingCharges || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span className="font-mono text-slate-800">
                    {formatPrice(Number(selectedOrder.shippingCharges || 0), selectedOrder.currencyCode || "USD")}
                  </span>
                </div>
              )}
              {Number(selectedOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -{formatPrice(Number(selectedOrder.discount || 0), selectedOrder.currencyCode || "USD")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                <span>Grand Total:</span>
                <span className="text-lg font-black text-[#006B3C] font-mono">
                  {formatPrice(Number(selectedOrder.total ?? selectedOrder.totalAmount ?? 0), selectedOrder.currencyCode || "USD")}
                </span>
              </div>
            </div>

            {/* Total Footer Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportSingle(selectedOrder)}
                  className="gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50 cursor-pointer font-bold"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Export to Excel (.xlsx)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openDirectInvoicePdf(selectedOrder.id, true, selectedOrder.orderNumber)}
                  className="gap-1.5 bg-[#006B3C] text-white hover:bg-[#005530]"
                >
                  <FileText className="w-4 h-4" />
                  View Invoice
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default B2BOrdersPage;
