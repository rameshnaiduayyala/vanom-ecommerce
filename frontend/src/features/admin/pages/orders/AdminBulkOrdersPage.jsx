import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import {
  Boxes,
  Building2,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Package,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  Printer,
  FileText,
} from "lucide-react";
import { EnterpriseInvoiceModal } from "@/components/common/EnterpriseInvoiceModal.jsx";

export function AdminBulkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const queryClient = useQueryClient();

  // Fetch B2B Wholesale Bulk Orders from dedicated BulkOrder table
  const {
    data: rawBulkOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-b2b-bulk-orders"],
    queryFn: async () => {
      const res = await Api.b2b.listBulkOrders();
      if (Array.isArray(res)) return res;
      return res?.items || [];
    },
  });

  // Mutation to update Bulk Order status
  const updateBulkStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Api.b2b.updateBulkOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-bulk-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bulk-orders"] });
      toast.success("Bulk Order Updated", `Wholesale order status transitioned to ${variables.status}.`);
      if (selectedBulkOrder && selectedBulkOrder.id === variables.id) {
        setSelectedBulkOrder((prev) => (prev ? { ...prev, status: variables.status } : null));
      }
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateBulkStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const filteredOrders = rawBulkOrders.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const num = (b.orderNumber || b.id || "").toLowerCase();
      const company = (b.company?.legalName || b.company?.name || "").toLowerCase();
      const user = `${b.requestedBy?.firstName || ""} ${b.requestedBy?.lastName || ""}`.toLowerCase();
      const email = (b.requestedBy?.email || "").toLowerCase();
      return num.includes(q) || company.includes(q) || user.includes(q) || email.includes(q);
    }
    return true;
  });

  const totalWholesaleValue = rawBulkOrders
    .filter((b) => b.status !== "CANCELLED" && b.status !== "REJECTED")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const totalUnits = rawBulkOrders.reduce((sum, b) => {
    const itemSum = b.items?.reduce((isum, it) => isum + (it.quantity || 0), 0) || 0;
    return sum + (itemSum || b.totalQuantity || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-200">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">B2B Wholesale Bulk Orders</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Corporate bulk procurement and container volume orders from verified companies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bulk Orders
            </span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{rawBulkOrders.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dedicated enterprise purchase orders</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Volume Units
            </span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{totalUnits.toLocaleString()} units</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aggregated wholesale quantity</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              B2B Contract Value
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Active
            </span>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">
            {formatPrice(totalWholesaleValue, "USD")}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Excludes rejected/cancelled</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO #, company name, buyer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Bulk Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden text-xs shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">PO Number</th>
              <th className="p-4">Enterprise Company / Buyer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items / Quantity</th>
              <th className="p-4">Total Value</th>
              <th className="p-4">Wholesale Status</th>
              <th className="p-4 text-right">Update Status / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
                  Loading B2B bulk purchase orders...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((b) => {
                const companyName = b.company?.legalName || b.company?.name || "Private Enterprise";
                const requesterName =
                  `${b.requestedBy?.firstName || ""} ${b.requestedBy?.lastName || ""}`.trim() ||
                  b.requestedBy?.email ||
                  "Authorized Officer";
                const totalUnits =
                  b.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || b.totalQuantity || 0;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">
                        {b.orderNumber || b.id?.slice(0, 10)}
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        B2B PO
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{companyName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Buyer: {requesterName}</p>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="p-4 text-slate-700">
                      <span className="font-bold text-slate-900">{totalUnits.toLocaleString()}</span> units
                      <p className="text-[10px] text-slate-400">
                        {b.items?.length || 1} line {b.items?.length === 1 ? "item" : "items"}
                      </p>
                    </td>
                    <td className="p-4 font-black text-amber-800">
                      {formatPrice(b.totalAmount || 0, "USD")}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          b.status === "CONFIRMED" || b.status === "DELIVERED"
                            ? "green"
                            : b.status === "CANCELLED" || b.status === "REJECTED"
                            ? "red"
                            : "gold"
                        }
                        size="sm"
                      >
                        {b.status || "PENDING"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={b.status || "PENDING"}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                        <button
                          onClick={() => setInvoiceOrder(b)}
                          className="p-1.5 rounded-md hover:bg-amber-50 text-amber-700 hover:text-amber-900 transition-colors border border-amber-200"
                          title="Generate Commercial Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedBulkOrder(b)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400">
                  <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No B2B bulk orders found</p>
                  <p className="text-[11px] text-slate-400">
                    Try adjusting your search query or filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedBulkOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Enterprise Bulk Purchase Order
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  PO #{selectedBulkOrder.orderNumber || selectedBulkOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBulkOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Enterprise Account</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedBulkOrder.company?.legalName || selectedBulkOrder.company?.name || "Corporate Account"}
                  </p>
                  <p className="text-slate-500">
                    Buyer: {selectedBulkOrder.requestedBy?.firstName} {selectedBulkOrder.requestedBy?.lastName} ({selectedBulkOrder.requestedBy?.email})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date Submitted</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {formatDate(selectedBulkOrder.createdAt)}
                  </p>
                  <span className="text-slate-400 block text-[10px] uppercase mt-2">Shipping Facility</span>
                  <p className="text-slate-600">
                    {selectedBulkOrder.shippingAddress?.city || "Standard Logistics Center"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Wholesale Bulk Items</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-100 rounded-lg p-2">
                  {selectedBulkOrder.items && selectedBulkOrder.items.length > 0 ? (
                    selectedBulkOrder.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {it.bulkProduct?.name || it.product?.name || `Wholesale Item #${i + 1}`}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              SKU: {it.bulkProduct?.sku || "COMMODITY-BULK"} • Qty: {it.quantity} units @ {formatPrice(it.unitPrice || 0, "USD")}/unit
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-amber-900">
                          {formatPrice((it.quantity || 1) * (it.unitPrice || 0), "USD")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-2">
                      Wholesale line items recorded in master contract.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-bold text-sm">
                <span>Contract Grand Total:</span>
                <span className="text-base text-amber-800 font-black">
                  {formatPrice(selectedBulkOrder.totalAmount || 0, "USD")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setInvoiceOrder(selectedBulkOrder);
                }}
                className="gap-1.5 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Commercial Invoice</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedBulkOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Enterprise Commercial Invoice Modal */}
      <EnterpriseInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
        type="B2B"
      />
    </div>
  );
}
