import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Search,
  Filter,
  ExternalLink,
  Printer,
  Package,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Warehouse as WarehouseIcon,
  Tag,
  Eye,
  Plus
} from "lucide-react";
import { Api } from "@/services/api/api-client.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { useUIStore } from "@/stores/ui.store.js";

const STATUS_BADGES = {
  PENDING: { label: "Pending", variant: "warning" },
  LABEL_CREATED: { label: "Label Created", variant: "info" },
  READY_TO_SHIP: { label: "Ready to Ship", variant: "primary" },
  SHIPPED: { label: "Shipped", variant: "success" },
  IN_TRANSIT: { label: "In Transit", variant: "success" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "indigo" },
  DELIVERED: { label: "Delivered", variant: "success" },
  EXCEPTION: { label: "Exception", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
  RETURNED: { label: "Returned", variant: "danger" },
};

export function AdminShipmentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [trackingModalShipment, setTrackingModalShipment] = useState(null);

  // 1. Fetch Shipments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-shipments", page, statusFilter],
    queryFn: async () => {
      const res = await Api.shipping.listShipments({
        page,
        limit: 15,
        ...(statusFilter ? { status: statusFilter } : {})
      });
      return res;
    }
  });

  const shipments = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // 2. Create Label Mutation
  const createLabelMutation = useMutation({
    mutationFn: async (shipmentId) => {
      return Api.shipping.createLabel(shipmentId);
    },
    onSuccess: (res) => {
      addToast({
        title: "Label Created",
        message: "Shipping label created successfully with carrier tracking.",
        type: "success"
      });
      queryClient.invalidateQueries(["admin-shipments"]);
      if (selectedShipment && res?.data) {
        setSelectedShipment(res.data);
      }
    },
    onError: (err) => {
      addToast({
        title: "Label Creation Failed",
        message: err.message || "Failed to create shipping label.",
        type: "error"
      });
    }
  });

  // 3. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ shipmentId, status }) => {
      return Api.shipping.updateShipmentStatus(shipmentId, status);
    },
    onSuccess: () => {
      addToast({
        title: "Status Updated",
        message: "Shipment status updated successfully.",
        type: "success"
      });
      queryClient.invalidateQueries(["admin-shipments"]);
      setIsDetailModalOpen(false);
    },
    onError: (err) => {
      addToast({
        title: "Update Failed",
        message: err.message || "Failed to update status.",
        type: "error"
      });
    }
  });

  // Client-side search filter
  const filteredShipments = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.orderId?.toLowerCase().includes(q) ||
      s.carrier?.toLowerCase().includes(q) ||
      s.order?.user?.email?.toLowerCase().includes(q) ||
      s.order?.user?.firstName?.toLowerCase().includes(q) ||
      s.order?.user?.lastName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Shipments & Logistics</h1>
            <Badge variant="brand" size="sm">
              Shippo Multi-Carrier
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage multi-warehouse fulfillment, create shipping labels, and track carrier deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────── */}
      <div className="p-4 bg-white rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, order ID, customer..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {["", "LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {st === "" ? "All Statuses" : st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Shipments Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500 animate-pulse">
            Loading shipments...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Truck className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No shipments found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Shipments created via Shippo for confirmed orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order & Customer</th>
                  <th className="py-3.5 px-4">Warehouse</th>
                  <th className="py-3.5 px-4">Carrier & Service</th>
                  <th className="py-3.5 px-4">Tracking Number</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.map((s) => {
                  const statusInfo = STATUS_BADGES[s.status] || {
                    label: s.status,
                    variant: "secondary"
                  };
                  const customerName = s.order?.user
                    ? `${s.order.user.firstName || ""} ${s.order.user.lastName || ""}`.trim() || s.order.user.email
                    : "Direct Customer";

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Order & Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-900">
                          ORD-{s.orderId.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[160px]">
                          {customerName}
                        </div>
                      </td>

                      {/* Warehouse */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <WarehouseIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{s.warehouse?.name || "Central Depot"}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {s.warehouse?.city || "Texas"}, {s.warehouse?.country || "US"}
                        </div>
                      </td>

                      {/* Carrier & Service */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          {s.carrier || "USPS"}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {s.service || "Standard Delivery"}
                        </div>
                      </td>

                      {/* Tracking */}
                      <td className="py-3.5 px-4">
                        {s.trackingNumber ? (
                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-slate-800 select-all">
                              {s.trackingNumber}
                            </span>
                            {s.trackingUrl && (
                              <a
                                href={s.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                Carrier Link <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No tracking yet</span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        ${Number(s.shippingCost || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Label */}
                          {s.labelUrl ? (
                            <a
                              href={s.labelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-2xs"
                              title="Print Shipping Label PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => createLabelMutation.mutate(s.id)}
                              loading={createLabelMutation.isPending}
                              className="text-[11px]"
                            >
                              Create Label
                            </Button>
                          )}

                          {/* View details */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedShipment(s);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5"
                            title="View Shipment Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredShipments.length} of {total} shipments
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-gray-800">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Shipment Details Modal ─────────────────────────────────── */}
      {selectedShipment && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Shipment Details • ORD-${selectedShipment.orderId?.slice(0, 8).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-gray-700">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Carrier & Service</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {selectedShipment.carrier} • {selectedShipment.service}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Current Status</p>
                <div className="mt-1">
                  <Badge variant={STATUS_BADGES[selectedShipment.status]?.variant || "secondary"} size="sm">
                    {STATUS_BADGES[selectedShipment.status]?.label || selectedShipment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tracking details */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-gray-400">Tracking Number</p>
              <p className="font-mono font-bold text-gray-900 select-all">
                {selectedShipment.trackingNumber || "Pending label purchase"}
              </p>
            </div>

            {/* Label actions */}
            {selectedShipment.labelUrl ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900">Official Shipping Label</p>
                  <p className="text-[11px] text-blue-700">Ready for high-res printing (A4 / 4x6 Thermal)</p>
                </div>
                <a
                  href={selectedShipment.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                </a>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => createLabelMutation.mutate(selectedShipment.id)}
                loading={createLabelMutation.isPending}
                className="w-full"
              >
                Generate Shippo Shipping Label
              </Button>
            )}

            {/* Manual Status Override */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">Update Status Manually</p>
              <div className="flex flex-wrap gap-1.5">
                {["READY_TO_SHIP", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatusMutation.mutate({ shipmentId: selectedShipment.id, status: st })}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-[11px] font-semibold text-gray-700"
                  >
                    Mark {st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminShipmentsPage;
