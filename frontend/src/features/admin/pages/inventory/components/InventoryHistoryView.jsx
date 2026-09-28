import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, User, FileText, Warehouse, Package } from "lucide-react";
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
    return prodName.includes(q) || sku.includes(q) || ref.includes(q) || wh.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by SKU, Product, Reference #, or Depot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs rounded-xl border border-border bg-white px-3 py-2 w-72 focus:border-[#00875A] focus:outline-none"
          />

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-border bg-white px-3 py-2 focus:border-[#00875A] focus:outline-none"
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
          className="cursor-pointer shrink-0"
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-muted">
                    Loading audit trail ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-muted">
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
                    <tr key={txn.id} className="hover:bg-surface-muted/50 transition-colors">
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
                        <div className="font-bold text-text-primary">
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
    </div>
  );
}
