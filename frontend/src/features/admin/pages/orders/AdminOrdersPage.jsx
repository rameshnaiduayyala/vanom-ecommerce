import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { ORDER_STATUSES } from "@/constants/countries.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import {
  ShoppingCart,
  Boxes,
  Layers,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Package,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
} from "lucide-react";
import { EnterpriseInvoiceModal } from "@/components/common/EnterpriseInvoiceModal.jsx";

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("type") || "ALL"; // 'ALL', 'B2C', 'B2B'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const queryClient = useQueryClient();

  // 1. Fetch Standard Retail Orders (from Order table)
  const {
    data: rawRetailOrders = [],
    isLoading: loadingRetail,
    refetch: refetchRetail,
  } = useQuery({
    queryKey: ["admin-retail-orders"],
    queryFn: async () => {
      const res = await Api.admin.getOrders();
      if (Array.isArray(res)) return res;
      return res?.items || [];
    },
  });

  // 2. Fetch Dedicated B2B Bulk Orders (from BulkOrder table)
  const {
    data: rawBulkOrders = [],
    isLoading: loadingBulk,
    refetch: refetchBulk,
  } = useQuery({
    queryKey: ["admin-bulk-orders"],
    queryFn: async () => {
      const res = await Api.b2b.listBulkOrders();
      if (Array.isArray(res)) return res;
      return res?.items || [];
    },
  });

  // Mutations for updating status
  const updateRetailStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Api.admin.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retail-orders"] });
      toast.success("Order Updated", "Retail order status updated.");
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const updateBulkStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Api.b2b.updateBulkOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-orders"] });
      toast.success("Bulk Order Updated", "Bulk purchase order status updated.");
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const handleRetailStatusChange = (id, status) => {
    updateRetailStatusMutation.mutate({ id, status });
  };

  const handleBulkStatusChange = (id, status) => {
    updateBulkStatusMutation.mutate({ id, status });
  };

  const refetchAll = () => {
    refetchRetail();
    refetchBulk();
  };

  // Filter Retail Orders
  const filteredRetailOrders = rawRetailOrders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const num = (o.orderNumber || o.id || "").toLowerCase();
      const name = `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.toLowerCase();
      const email = (o.user?.email || "").toLowerCase();
      return num.includes(q) || name.includes(q) || email.includes(q);
    }
    return true;
  });

  // Filter Bulk Orders
  const filteredBulkOrders = rawBulkOrders.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const num = (b.orderNumber || b.id || "").toLowerCase();
      const comp = (b.company?.legalName || "").toLowerCase();
      const buyer = `${b.requestedBy?.firstName || ""} ${b.requestedBy?.lastName || ""}`.toLowerCase();
      return num.includes(q) || comp.includes(q) || buyer.includes(q);
    }
    return true;
  });

  const isBulkTab = activeTab === "B2B";
  const isRetailTab = activeTab === "B2C";
  const isAllTab = activeTab === "ALL";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-700 uppercase tracking-wider">Order Management Center</span>
            <span>•</span>
            <span className="text-slate-600">Omnichannel Retail & Bulk PO Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders & Wholesale POs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor and fulfill B2C retail store orders and dedicated enterprise B2B bulk purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refetchAll}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl border border-slate-200">
          <button
            onClick={() => setSearchParams({ type: "ALL" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isAllTab
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            All Orders ({rawRetailOrders.length + rawBulkOrders.length})
          </button>

          <button
            onClick={() => setSearchParams({ type: "B2C" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRetailTab
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            <span>Retail Orders ({rawRetailOrders.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ type: "B2B" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isBulkTab
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            <span>B2B Bulk Orders ({rawBulkOrders.length})</span>
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, customer, company..."
              className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-[#006B3C] focus:outline-none w-56 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#006B3C] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── SECTION 1: B2B BULK PURCHASE ORDERS TABLE (from BulkOrder table) ── */}
      {(isAllTab || isBulkTab) && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enterprise B2B Bulk Orders ({filteredBulkOrders.length})
                </h3>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Stored in dedicated <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-emerald-200">BulkOrder</code> table with container specs & volume tier pricing
                </p>
              </div>
            </div>
            <Badge variant="green" size="sm">Dedicated B2B Table</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Bulk PO #</th>
                  <th className="p-4">Purchasing Company</th>
                  <th className="p-4">Buyer Contact</th>
                  <th className="p-4">Commodity Lines</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingBulk ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">Loading bulk purchase orders...</td>
                  </tr>
                ) : filteredBulkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">No B2B bulk purchase orders found.</td>
                  </tr>
                ) : (
                  filteredBulkOrders.map((b) => {
                    const currencyCode = b.currency?.code || "INR";
                    const currencySymbol = b.currency?.symbol || "₹";
                    const itemsCount = b.items?.length || 1;
                    const itemsSummary = b.items?.map((i) => i.bulkProduct?.name || "Commodity Item").join(", ") || "Palletized Wholesale Batch";

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {b.orderNumber || `BLK-${b.id.slice(0, 8)}`}
                        </td>
                        <td className="p-4 font-bold text-emerald-800">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[180px]">{b.company?.legalName || "Corporate Account"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="font-semibold text-slate-800 block">
                            {b.requestedBy?.firstName} {b.requestedBy?.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[160px]">
                            {b.requestedBy?.email}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block">{itemsCount} product(s)</span>
                          <span className="text-[10px] text-slate-500 truncate block max-w-[200px]" title={itemsSummary}>
                            {itemsSummary}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {formatDate(b.createdAt)}
                        </td>
                        <td className="p-4 font-black text-slate-900 text-sm">
                          {formatPrice(b.totalAmount, currencyCode, currencySymbol)}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              b.status === "COMPLETED" || b.status === "APPROVED"
                                ? "green"
                                : b.status === "CANCELLED"
                                ? "red"
                                : "yellow"
                            }
                            size="sm"
                          >
                            {b.status || "DRAFT"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={b.status || "DRAFT"}
                            onChange={(e) => handleBulkStatusChange(b.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 cursor-pointer focus:outline-none focus:border-[#006B3C]"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="QUOTED">QUOTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECTION 2: RETAIL STOREFRONT ORDERS TABLE (from Order table) ── */}
      {(isAllTab || isRetailTab) && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Consumer Retail Orders ({filteredRetailOrders.length})
                </h3>
                <p className="text-[11px] text-blue-800 font-medium">
                  Stored in primary <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-blue-200">Order</code> table for B2C consumer checkout
                </p>
              </div>
            </div>
            <Badge variant="blue" size="sm">Retail Table</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingRetail ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">Loading retail orders...</td>
                  </tr>
                ) : filteredRetailOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">No retail orders found.</td>
                  </tr>
                ) : (
                  filteredRetailOrders.map((o) => {
                    const statusConfig = ORDER_STATUSES[o.status] || { label: o.status || "PROCESSING", color: "yellow" };
                    const customerName =
                      `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() ||
                      o.user?.email ||
                      o.shippingAddress?.name ||
                      "Consumer Buyer";

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {o.orderNumber || o.id?.slice(0, 10)}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
                          <span>{customerName}</span>
                          {o.user?.email && (
                            <span className="text-[10px] text-slate-400 block">{o.user.email}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                            Online Storefront
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="p-4 font-bold text-slate-900 text-sm">
                          {formatPrice(o.totalAmount || 0, o.currency?.code || "USD")}
                        </td>
                        <td className="p-4">
                          <Badge variant={statusConfig.color} size="sm">
                            {o.status || statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={o.status || "PROCESSING"}
                              onChange={(e) => handleRetailStatusChange(o.id, e.target.value)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 cursor-pointer focus:outline-none focus:border-[#006B3C]"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <button
                              onClick={() => setInvoiceOrder(o)}
                              className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors border border-emerald-200"
                              title="Generate Official Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
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
      )}

      {/* Reusable Enterprise Invoice Modal */}
      <EnterpriseInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
        type={invoiceOrder?.bulkProduct || invoiceOrder?.company ? "B2B" : "RETAIL"}
      />
    </div>
  );
}

export default AdminOrdersPage;
