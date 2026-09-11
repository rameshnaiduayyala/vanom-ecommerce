import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { ORDER_STATUSES } from "@/constants/countries.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Package,
  Printer,
  FileText,
} from "lucide-react";
import { EnterpriseInvoiceModal } from "@/components/common/EnterpriseInvoiceModal.jsx";

export function AdminRetailOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: rawOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-retail-orders"],
    queryFn: async () => {
      const res = await Api.admin.getOrders();
      if (Array.isArray(res)) return res;
      return res?.items || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Api.admin.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-retail-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
      toast.success("Order Updated", `Order status transitioned to ${variables.status}.`);
      if (selectedOrder && selectedOrder.id === variables.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: variables.status } : null));
      }
    },
    onError: (err) => toast.error("Update Failed", err.message),
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const filteredOrders = rawOrders.filter((o) => {
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

  const totalRevenue = rawOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingCount = rawOrders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "PAYMENT_CONFIRMED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Retail Consumer Orders</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                B2C Storefront consumer orders from the retail database.
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
              Total Retail Orders
            </span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{rawOrders.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Direct consumer store orders</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Fulfillment
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires packing & dispatch</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Retail Gross Sales
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live
            </span>
          </div>
          <p className="text-2xl font-black text-[#006B3C] mt-2">
            {formatPrice(totalRevenue, "USD")}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Excludes cancelled orders</p>
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
            placeholder="Search order #, customer, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-[#006B3C]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAYMENT_CONFIRMED">PAYMENT CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Retail Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden text-xs shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Order Number</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Current Status</th>
              <th className="p-4 text-right">Update Status / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  Loading consumer retail orders...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o) => {
                const customerName =
                  `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() ||
                  o.user?.email ||
                  o.shippingAddress?.name ||
                  "Consumer Customer";
                const itemCount = o.items?.length || 1;

                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">
                        {o.orderNumber || o.id?.slice(0, 10)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {o.id?.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{customerName}</p>
                      <p className="text-[11px] text-slate-400">{o.user?.email || "No email"}</p>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <Package className="w-3 h-3 text-slate-400" />
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {formatPrice(o.totalAmount || 0, o.currency?.code || "USD")}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          o.status === "DELIVERED"
                            ? "green"
                            : o.status === "SHIPPED"
                            ? "blue"
                            : o.status === "CANCELLED"
                            ? "red"
                            : "amber"
                        }
                        size="sm"
                      >
                        {o.status || "PENDING"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={o.status || "PENDING"}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAYMENT_CONFIRMED">CONFIRMED</option>
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
                        <button
                          onClick={() => setSelectedOrder(o)}
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
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No retail orders found</p>
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
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  B2C Retail Order
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Order #{selectedOrder.orderNumber || selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Customer</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                  <p className="text-slate-500">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date Placed</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Purchased Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {it.product?.name || it.name || `Item #${i + 1}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {it.quantity} × {formatPrice(it.unitPrice || it.price || 0, "USD")}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900">
                          {formatPrice((it.quantity || 1) * (it.unitPrice || it.price || 0), "USD")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-2">
                      Item details recorded in master order.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-bold text-sm">
                <span>Grand Total:</span>
                <span className="text-base text-emerald-800 font-black">
                  {formatPrice(selectedOrder.totalAmount || 0, selectedOrder.currency?.code || "USD")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                }}
                className="gap-1.5 bg-emerald-800 text-white"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Invoice</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Enterprise Invoice Modal */}
      <EnterpriseInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
        type="RETAIL"
      />
    </div>
  );
}
