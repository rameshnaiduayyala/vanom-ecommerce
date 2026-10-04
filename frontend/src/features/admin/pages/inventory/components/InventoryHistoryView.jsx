import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  User,
  FileText,
  Warehouse,
  Package,
  Eye,
  X,
  Clock,
  Layers,
  ShieldCheck,
  Building,
  Info,
  CheckCircle2,
  Calendar,
  Hash,
  Activity,
  ArrowRight
} from "lucide-react";
import { apiClient } from "@/services/api/axios.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

const TRANSACTION_BADGES = {
  PURCHASE: { label: "Purchase (Inward)", variant: "success", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  SALE: { label: "Sale (Deduction)", variant: "default", color: "text-blue-700 bg-blue-50 border-blue-200" },
  RESERVATION: { label: "Reservation", variant: "warning", color: "text-amber-700 bg-amber-50 border-amber-200" },
  RELEASE: { label: "Release (Restored)", variant: "default", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  RETURN: { label: "Customer Return", variant: "success", color: "text-teal-700 bg-teal-50 border-teal-200" },
  RESTOCK: { label: "Restock", variant: "success", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ADJUSTMENT: { label: "Audit Adjustment", variant: "warning", color: "text-purple-700 bg-purple-50 border-purple-200" },
  DAMAGE: { label: "Damage Write-off", variant: "danger", color: "text-rose-700 bg-rose-50 border-rose-200" },
  LOSS: { label: "Stock Loss / Shrinkage", variant: "danger", color: "text-red-700 bg-red-50 border-red-200" },
  TRANSFER_IN: { label: "Transfer Inward", variant: "success", color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  TRANSFER_OUT: { label: "Transfer Outward", variant: "default", color: "text-slate-700 bg-slate-100 border-slate-300" },
};

export function InventoryHistoryView({ inventoryId = null, filterType = "ALL" }) {
  const [selectedType, setSelectedType] = useState(filterType);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inventory-transactions", inventoryId, selectedType, page],
    queryFn: async () => {
      const params = {
        page,
        limit: 20,
        ...(inventoryId ? { inventoryId } : {}),
        ...(selectedType !== "ALL" ? { type: selectedType } : {}),
      };
      return apiClient.get("/inventory/transactions", { params });
    },
  });

  const transactions = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const meta = data?.meta || { total: transactions.length, totalPages: 1 };

  const filtered = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const prodName = t.inventory?.product?.name?.toLowerCase() || "";
    const sku = (t.inventory?.variant?.sku || t.inventory?.product?.sku || "").toLowerCase();
    const ref = (t.referenceId || "").toLowerCase();
    const wh = (t.inventory?.warehouse?.name || t.inventory?.warehouse?.code || "").toLowerCase();
    const reason = (t.reason || t.notes || "").toLowerCase();
    return prodName.includes(q) || sku.includes(q) || ref.includes(q) || wh.includes(q) || reason.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by SKU, Product, Reference #, Depot, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs rounded-xl border border-border bg-white px-3 py-2 w-full sm:w-72 focus:border-[#00875A] focus:outline-none"
          />

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-border bg-white px-3 py-2 w-full sm:w-auto focus:border-[#00875A] focus:outline-none"
          >
            <option value="ALL">All Transaction Types</option>
            {Object.keys(TRANSACTION_BADGES).map((type) => (
              <option key={type} value={type}>
                {TRANSACTION_BADGES[type].label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => refetch()}
          className="cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          Refresh Audit Trail
        </Button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Warehouse Depot</th>
                <th className="p-3.5">Transaction Type</th>
                <th className="p-3.5 text-right">Delta Qty</th>
                <th className="p-3.5 text-right">Stock Flow (Prev → New)</th>
                <th className="p-3.5">Reference & Actor</th>
                <th className="p-3.5">Reason / Audit Trail</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-text-muted">
                    Loading audit trail ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-text-muted">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => {
                  const badge = TRANSACTION_BADGES[txn.type] || {
                    label: txn.type,
                    color: "text-slate-700 bg-slate-100 border-slate-300",
                  };
                  const isPositive = ["PURCHASE", "RESTOCK", "RETURN", "TRANSFER_IN"].includes(txn.type);
                  const isNegative = ["SALE", "DAMAGE", "LOSS", "TRANSFER_OUT"].includes(txn.type);

                  const prod = txn.inventory?.product;
                  const variant = txn.inventory?.variant;
                  const wh = txn.inventory?.warehouse;
                  const user = txn.createdByUser;

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="p-3.5 whitespace-nowrap text-text-muted font-mono text-[11px]">
                        {new Date(txn.createdAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Product & SKU */}
                      <td className="p-3.5">
                        <div className="font-bold text-text-primary group-hover:text-indigo-600 transition-colors">
                          {prod?.name || "Product"}
                          {variant?.name && (
                            <span className="text-text-muted font-normal"> - {variant.name}</span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-text-muted">
                          {variant?.sku || prod?.sku || "SKU-N/A"}
                        </span>
                      </td>

                      {/* Warehouse */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{wh?.code || "GLOBAL"}</span>
                        <span className="text-[10px] text-text-muted block">{wh?.name || wh?.city}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Delta Quantity */}
                      <td className="p-3.5 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isPositive
                              ? "text-emerald-700"
                              : isNegative
                              ? "text-rose-600"
                              : "text-slate-700"
                          }
                        >
                          {isPositive ? `+${txn.quantity}` : isNegative ? `-${txn.quantity}` : txn.quantity}
                        </span>
                      </td>

                      {/* Previous -> New */}
                      <td className="p-3.5 text-right font-mono text-[11px] whitespace-nowrap text-slate-600">
                        <span>{txn.previousQuantity}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-bold text-slate-900">{txn.newQuantity}</span>
                        {txn.previousReservedQuantity !== txn.newReservedQuantity && (
                          <div className="text-[10px] text-amber-600">
                            (res: {txn.previousReservedQuantity} → {txn.newReservedQuantity})
                          </div>
                        )}
                      </td>

                      {/* Reference & Actor */}
                      <td className="p-3.5 whitespace-nowrap">
                        {txn.referenceId ? (
                          <div className="font-mono font-semibold text-[11px] text-indigo-700 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {txn.referenceType ? `${txn.referenceType}: ` : ""}
                            {txn.referenceId.slice(0, 12)}
                          </div>
                        ) : (
                          <span className="text-text-muted text-[11px]">System Internal</span>
                        )}
                        <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "System / Auto"}
                        </span>
                      </td>

                      {/* Reason / Notes */}
                      <td className="p-3.5 max-w-xs text-text-secondary text-[11px]">
                        <p className="truncate font-medium">{txn.reason || txn.notes || "Standard operation"}</p>
                        {txn.notes && txn.reason && (
                          <p className="truncate text-[10px] text-text-muted">{txn.notes}</p>
                        )}
                      </td>

                      {/* View Button */}
                      <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedTxn(txn)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-3 bg-surface-muted border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Page {page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detailed Audit Trail Modal / Inspector ─── */}
      {selectedTxn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedTxn(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-gradient-to-r from-slate-50 to-indigo-50/40 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Audit Trail Transaction Details
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        (TRANSACTION_BADGES[selectedTxn.type] || {}).color || "text-slate-700 bg-slate-100 border-slate-300"
                      }`}
                    >
                      {TRANSACTION_BADGES[selectedTxn.type]?.label || selectedTxn.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-slate-400" />
                    ID: {selectedTxn.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* 1. Stock Flow Summary Banner */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-center border-r border-slate-200 pr-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Previous Stock
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-700 block mt-1">
                    {selectedTxn.previousQuantity}
                  </span>
                  <span className="text-[10px] text-slate-400">units in depot</span>
                </div>

                <div className="text-center border-r border-slate-200 px-2 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Adjustment Delta
                  </span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span
                      className={`text-xl font-extrabold font-mono ${
                        ["PURCHASE", "RESTOCK", "RETURN", "TRANSFER_IN"].includes(selectedTxn.type)
                          ? "text-emerald-600"
                          : ["SALE", "DAMAGE", "LOSS", "TRANSFER_OUT"].includes(selectedTxn.type)
                          ? "text-rose-600"
                          : "text-slate-800"
                      }`}
                    >
                      {["PURCHASE", "RESTOCK", "RETURN", "TRANSFER_IN"].includes(selectedTxn.type)
                        ? `+${selectedTxn.quantity}`
                        : ["SALE", "DAMAGE", "LOSS", "TRANSFER_OUT"].includes(selectedTxn.type)
                        ? `-${selectedTxn.quantity}`
                        : `${selectedTxn.quantity}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    {selectedTxn.type}
                  </span>
                </div>

                <div className="text-center pl-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    New Stock
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 block mt-1">
                    {selectedTxn.newQuantity}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">calculated balance</span>
                </div>
              </div>

              {/* Reserved Stock Flow (if affected) */}
              {(selectedTxn.previousReservedQuantity > 0 || selectedTxn.newReservedQuantity > 0) && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-semibold">Reserved Stock Balance:</strong> {selectedTxn.previousReservedQuantity} units
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-amber-900 font-mono">
                    {selectedTxn.newReservedQuantity} units reserved
                  </span>
                </div>
              )}

              {/* 2. Product & SKU Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Product & Catalog Details</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Product Name</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {selectedTxn.inventory?.product?.name || "Product"}
                    </span>
                    {selectedTxn.inventory?.variant?.name && (
                      <span className="text-xs text-indigo-600 font-medium block">
                        Variant: {selectedTxn.inventory.variant.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">SKU Code</span>
                    <span className="font-mono font-bold text-slate-800 text-sm block mt-0.5">
                      {selectedTxn.inventory?.variant?.sku || selectedTxn.inventory?.product?.sku || "SKU-N/A"}
                    </span>
                  </div>

                  {selectedTxn.inventory?.product?.category && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Category</span>
                      <span className="text-slate-700 font-medium">
                        {selectedTxn.inventory.product.category.name}
                      </span>
                    </div>
                  )}

                  {selectedTxn.inventory?.product?.brand && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Brand</span>
                      <span className="text-slate-700 font-medium">
                        {selectedTxn.inventory.product.brand.name}
                      </span>
                    </div>
                  )}

                  {selectedTxn.inventory?.variant?.attributes && (
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                        Variant Attributes
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {typeof selectedTxn.inventory.variant.attributes === "object" ? (
                          Object.entries(selectedTxn.inventory.variant.attributes).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700 border border-slate-200"
                            >
                              <strong>{k}:</strong> {String(v)}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">
                            {JSON.stringify(selectedTxn.inventory.variant.attributes)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Depot & Location Context */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Warehouse Hub / Depot Information</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Depot Code</span>
                    <span className="font-mono font-bold text-slate-800 text-sm block mt-0.5">
                      {selectedTxn.inventory?.warehouse?.code || "GLOBAL"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Depot Name</span>
                    <span className="font-bold text-slate-800 text-sm block mt-0.5">
                      {selectedTxn.inventory?.warehouse?.name || "Primary Logistics Center"}
                    </span>
                  </div>

                  {(selectedTxn.inventory?.warehouse?.city || selectedTxn.inventory?.warehouse?.country) && (
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Location</span>
                      <span className="text-slate-700 font-medium">
                        {[
                          selectedTxn.inventory?.warehouse?.address,
                          selectedTxn.inventory?.warehouse?.city,
                          selectedTxn.inventory?.warehouse?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Audit Metadata, Actor, & Reason */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200 pb-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Audit Trail, Actor & Provenance</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Timestamp</span>
                    <span className="font-mono text-slate-800 font-semibold block mt-0.5">
                      {new Date(selectedTxn.createdAt).toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "medium",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Performed By (Actor)</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {selectedTxn.createdByUser
                        ? `${selectedTxn.createdByUser.firstName || ""} ${selectedTxn.createdByUser.lastName || ""}`.trim() || selectedTxn.createdByUser.email
                        : "System / Automated Task"}
                    </span>
                    {selectedTxn.createdByUser?.email && (
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {selectedTxn.createdByUser.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reference Type</span>
                    <span className="font-mono font-medium text-slate-700 block mt-0.5">
                      {selectedTxn.referenceType || "MANUAL_ENTRY"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reference ID / Order #</span>
                    <span className="font-mono font-bold text-indigo-700 block mt-0.5 break-all">
                      {selectedTxn.referenceId || "N/A"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Audit Reason & Verification Notes
                    </span>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium leading-relaxed">
                      {selectedTxn.reason || selectedTxn.notes || "Standard inventory restock / deduction operation."}
                    </div>
                  </div>

                  {selectedTxn.notes && selectedTxn.reason && (
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                        Additional Notes
                      </span>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs">
                        {selectedTxn.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Ledger Record #{selectedTxn.id.slice(0, 10)}...
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTxn(null)}
                className="cursor-pointer font-semibold px-4"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

