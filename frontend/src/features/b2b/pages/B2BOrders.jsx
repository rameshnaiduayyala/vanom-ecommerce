import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import {
  PackageCheck,
  Clock,
  FileText,
  Eye,
  Building2,
  MapPin,
  CheckCircle2,
  X,
  Package,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { EnterpriseInvoiceModal } from "../../../components/common/EnterpriseInvoiceModal.jsx";

export function B2BOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
    const companyName = (o.company?.legalName || o.company?.name || "").toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || orderNum.includes(query) || companyName.includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      o.status === statusFilter ||
      (statusFilter === "ACTIVE" && o.status !== "CANCELLED" && o.status !== "DELIVERED");

    return matchesSearch && matchesStatus;
  });

  const totalVolume = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const activeCount = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "DELIVERED").length;

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
            Manage bulk contract orders, verify pallet specifications, track fulfillment status, and generate official cryptographic tax invoices.
          </p>
        </div>

        <Link to={ROUTES.B2B.BULK_ORDER} className="shrink-0">
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Contract Volume
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatPrice(totalVolume, orders[0]?.currency?.code || "INR", orders[0]?.currency?.symbol || "₹")}
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
              {orders.length} <span className="text-xs font-normal text-slate-400">Contracts</span>
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none focus:border-[#006B3C]"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="ACTIVE">Active Fulfillments ({activeCount})</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PAID">PAID</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Modern High-End Table Card */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No wholesale purchase orders found"
          description="No purchase orders matched your current search and filter criteria."
          className="text-slate-600 bg-white border border-slate-200 rounded-2xl p-12"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 font-bold">Order / PO #</th>
                  <th className="py-3.5 px-4 font-bold">Procuring Company</th>
                  <th className="py-3.5 px-4 font-bold">Placement Date</th>
                  <th className="py-3.5 px-4 font-bold text-center">Batch Items</th>
                  <th className="py-3.5 px-4 font-bold">Contract Total</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status?.replace(/_/g, " ") || "Confirmed",
                    color: "emerald",
                  };
                  const itemsCount = order.items?.length || order.itemsCount || 1;
                  const totalUnits =
                    order.items?.reduce((s, it) => s + (it.quantity || 0), 0) ||
                    order.totalQuantity ||
                    itemsCount;
                  const currencyCode = order.currency?.code || order.currency || "INR";
                  const currencySymbol = order.currency?.symbol || "₹";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Order / PO # */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className="font-mono font-bold text-slate-900 text-xs block">
                          {order.orderNumber || `BLK-${order.id.slice(0, 8)}`}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-medium">
                          {order.poNumber ? `PO: ${order.poNumber}` : "B2B WHOLESALE"}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{order.company?.legalName || order.company?.name || "Corporate Enterprise"}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-5 truncate max-w-[200px]">
                          {order.requestedBy?.email || order.shippingAddress?.city || "Direct Account"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap text-slate-600">
                        <span className="font-medium text-slate-700 block">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </td>

                      {/* Batch Items */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <Package className="w-3 h-3 text-slate-400" />
                          {itemsCount} spec line{itemsCount !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className="text-xs font-black text-slate-900 font-mono block">
                          {formatPrice(order.totalAmount, currencyCode, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-slate-400">Net 30 terms</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <Badge variant={statusConfig.color} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#006B3C] hover:bg-[#005530] transition-colors shadow-2xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Wholesale Bulk Order Contract
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer & Facility Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" /> Authorized Buyer
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedOrder.company?.legalName || "Corporate Buyer"}
                </p>
                <p className="text-slate-500">
                  {selectedOrder.requestedBy?.email || selectedOrder.company?.email || "Procurement Account"}
                </p>
                {selectedOrder.company?.taxId && (
                  <p className="font-mono text-emerald-800 font-semibold">Tax ID: {selectedOrder.company.taxId}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Logistics Destination
                </span>
                <p className="font-bold text-slate-900">
                  {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.line1 || "Enterprise Logistics Facility"}
                </p>
                <p className="text-slate-500">
                  {selectedOrder.shippingAddress?.city || "Industrial Hub"}, {selectedOrder.shippingAddress?.state || "State"} {selectedOrder.shippingAddress?.postalCode || ""}
                </p>
                <p className="text-slate-600 font-semibold">{selectedOrder.country?.name || "India"}</p>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-brand-600" />
                Line Items & Packaging Specification
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">
                          {it.bulkProduct?.name || it.name || `Commodity Line #${idx + 1}`}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          SKU: {it.bulkProduct?.sku || it.sku || "N/A"} • Unit: {it.bulkProduct?.unitOfMeasure || "Metric Ton"}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Quantity: <span className="font-bold text-slate-800">{it.quantity?.toLocaleString()}</span> ×{" "}
                          {formatPrice(it.unitPrice || 0, selectedOrder.currency?.code || "INR")}
                        </p>
                      </div>
                      <div className="text-right font-bold text-slate-900 text-sm">
                        {formatPrice((it.subtotal || (it.quantity * it.unitPrice)) || 0, selectedOrder.currency?.code || "INR")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Wholesale items specified under master contract agreement.
                  </div>
                )}
              </div>
            </div>

            {/* Total Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Total Contract Value</span>
                <span className="text-xl font-black text-[#006B3C] font-mono">
                  {formatPrice(selectedOrder.totalAmount || 0, selectedOrder.currency?.code || "INR")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setInvoiceOrder(selectedOrder);
                  }}
                  className="gap-1.5 bg-[#006B3C] text-white hover:bg-[#005530]"
                >
                  <FileText className="w-4 h-4" />
                  View Commercial Invoice
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commercial Invoice Modal */}
      <EnterpriseInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
        type="B2B"
      />
    </div>
  );
}

export function CompanyProfile() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Company Organization Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Verified commercial tax details and corporate identity.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Legal Business Name</span>
            <span className="text-base font-bold text-slate-900">Apex Global Wholesale Traders Pvt Ltd</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Trading Name</span>
            <span className="text-base font-bold text-slate-900">Apex Global Wholesale</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Corporate Registration (CIN/LLP)</span>
            <span className="font-mono font-semibold text-slate-700">U01100MH2020PTC345678</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN / Tax ID</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">27AAACA1234A1Z1 (Verified)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyDocuments() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Business Documents & Compliance</h1>
          <p className="text-xs text-slate-500 mt-1">Corporate GST certificates, licenses, and tax exemption filings.</p>
        </div>
        <Button variant="primary" size="sm" className="font-bold shadow-xs">
          Upload New Document
        </Button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Document Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4">Uploaded At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="p-4 font-bold text-slate-900">GST_Certificate_2026.pdf</td>
              <td className="p-4 font-mono text-slate-500">TAX_CERTIFICATE</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-500">Jan 15, 2026</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">Certificate_of_Incorporation.pdf</td>
              <td className="p-4 font-mono text-slate-500">BUSINESS_REGISTRATION</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-500">Jan 15, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompanyMembers() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Team Members & Access</h1>
          <p className="text-xs text-slate-500 mt-1">Authorized procurement agents and corporate purchasing accounts.</p>
        </div>
        <Button variant="primary" size="sm" className="font-bold shadow-xs">
          Invite Member
        </Button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="p-4 font-bold text-slate-900">Rajesh Kulkarni</td>
              <td className="p-4 text-slate-600">buyer@apexwholesale.in</td>
              <td className="p-4"><Badge variant="default" size="sm">COMPANY_ADMIN</Badge></td>
              <td className="p-4 text-emerald-700 font-bold">Active Primary</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">Sunil Verma</td>
              <td className="p-4 text-slate-600">procurement@apexwholesale.in</td>
              <td className="p-4"><Badge variant="default" size="sm">COMPANY_BUYER</Badge></td>
              <td className="p-4 text-emerald-700 font-bold">Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
