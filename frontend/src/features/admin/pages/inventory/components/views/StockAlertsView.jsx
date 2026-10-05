import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Package,
  XCircle,
  AlertCircle,
  QrCode,
  History,
  Sliders,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";

function getProductImageUrl(prod, variant) {
  if (variant?.image) return variant.image;
  if (Array.isArray(variant?.images) && variant.images.length > 0) {
    const v = variant.images[0];
    return typeof v === "string" ? v : v?.url || v?.file?.url;
  }
  if (Array.isArray(prod?.images) && prod.images.length > 0) {
    const p = prod.images[0];
    return typeof p === "string" ? p : p?.url || p?.file?.url;
  }
  if (prod?.image) return prod.image;
  return null;
}

export function StockAlertsView({
  alertItems = [],
  isLoading = false,
  onOpenReceive,
  onOpenAdjust,
  onOpenTransfer,
  onViewHistory,
  onShowQR,
}) {
  const [severityFilter, setSeverityFilter] = useState("ALL"); // ALL | CRITICAL | LOW

  const criticalItems = alertItems.filter((item) => {
    const stock = item.quantity !== undefined ? item.quantity : (item.stock || 0);
    const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved || 0);
    return stock - reserved <= 0;
  });

  const lowStockItems = alertItems.filter((item) => {
    const stock = item.quantity !== undefined ? item.quantity : (item.stock || 0);
    const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved || 0);
    const avail = stock - reserved;
    return avail > 0;
  });

  const displayedItems = severityFilter === "CRITICAL"
    ? criticalItems
    : severityFilter === "LOW"
      ? lowStockItems
      : alertItems;

  return (
    <div className="space-y-4">
      {/* ─── Urgency Alert Banner ─── */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-amber-950">
              Replenishment & Fulfillment Backorder Alerts
            </p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Found <strong className="font-bold">{criticalItems.length} critical out-of-stock</strong> and{" "}
              <strong className="font-bold">{lowStockItems.length} low-stock</strong> items requiring replenishment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={ArrowDownToLine}
            onClick={() => onOpenReceive()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
          >
            Create Restock Consignment
          </Button>
        </div>
      </div>

      {/* ─── Severity Filter Strip ─── */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pl-1">
          Severity Filter:
        </span>
        <button
          type="button"
          onClick={() => setSeverityFilter("ALL")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${severityFilter === "ALL"
              ? "bg-slate-900 text-white shadow-2xs"
              : "bg-white border border-border text-text-secondary hover:bg-surface-muted"
            }`}
        >
          All Alert SKUs ({alertItems.length})
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter("CRITICAL")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${severityFilter === "CRITICAL"
              ? "bg-rose-600 text-white shadow-2xs"
              : "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
            }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Critical Out of Stock ({criticalItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter("LOW")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${severityFilter === "LOW"
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"
            }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Low Stock Reorder ({lowStockItems.length})</span>
        </button>
      </div>

      {/* ─── Alert Table ─── */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Variant & SKU</th>
                <th className="p-3.5">Depot</th>
                <th className="p-3.5 text-right">Physical Units</th>
                <th className="p-3.5 text-right">Reserved</th>
                <th className="p-3.5 text-right">Available</th>
                <th className="p-3.5 text-right">Min Reorder Lvl</th>
                <th className="p-3.5 text-right">Suggested Inward</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-text-muted">
                    Scanning inventory levels for alerts...
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-text-muted">
                    No items match the selected stock alert criteria. All items are adequately stocked!
                  </td>
                </tr>
              ) : (
                displayedItems.map((row) => {
                  const prod = row.product || row.variant?.product || row;
                  const variant = row.variant;
                  const wh = row.warehouse;
                  const stock = row.quantity !== undefined ? row.quantity : (row.stock || 0);
                  const reserved = row.reservedQuantity !== undefined ? row.reservedQuantity : (row.reserved || 0);
                  const available = Math.max(0, stock - reserved);
                  const reorderLvl = row.reorderLevel !== undefined ? row.reorderLevel : 10;
                  const isOutOfStock = available <= 0;
                  const suggestedInward = Math.max(10, reorderLvl * 2 - available);

                  const imgUrl = getProductImageUrl(prod, variant);

                  return (
                    <tr key={row.id} className="hover:bg-surface-muted/50 transition-colors">
                      {/* Product & SKU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl border border-border bg-surface-muted overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={prod.name || "Product"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.parentElement?.querySelector(".img-fallback");
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`img-fallback w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 ${
                                imgUrl ? "hidden" : "flex"
                              }`}
                            >
                              <Package className="w-5 h-5 text-text-muted" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary text-xs leading-tight line-clamp-2 max-w-[240px]" title={prod.name}>
                              {prod.name || "Unknown Product"}
                            </p>
                            <span className="font-mono text-[11px] text-text-muted mt-0.5 block">
                              {prod.sku || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant & SKU */}
                      <td className="p-3.5">
                        {variant ? (
                          <div>
                            <p className="font-semibold text-text-primary text-xs">
                              {variant.name || "Variant"}
                            </p>
                            <span className="font-mono text-[11px] text-text-muted">
                              {variant.sku || "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Depot */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {wh?.code || "GLOBAL"}
                        </span>
                      </td>

                      {/* Physical Stock */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                        {stock.toLocaleString()}
                      </td>

                      {/* Reserved */}
                      <td className="p-3.5 text-right font-mono text-amber-600">
                        {reserved.toLocaleString()}
                      </td>

                      {/* Available */}
                      <td
                        className={`p-3.5 text-right font-mono font-black ${isOutOfStock ? "text-rose-600" : "text-amber-600"
                          }`}
                      >
                        {available.toLocaleString()}
                      </td>

                      {/* Reorder Level */}
                      <td className="p-3.5 text-right font-mono text-slate-500 font-semibold">
                        {reorderLvl}
                      </td>

                      {/* Suggested Inward */}
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        +{suggestedInward} units
                      </td>

                      {/* Severity */}
                      <td className="p-3.5 whitespace-nowrap">
                        <Badge variant={isOutOfStock ? "danger" : "warning"} size="sm">
                          {isOutOfStock ? "Critical (0 Units)" : "Low Stock"}
                        </Badge>
                      </td>

                      {/* Quick Restock Action */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            icon={ArrowDownToLine}
                            onClick={() => onOpenReceive(row)}
                            className="bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold"
                          >
                            Restock Now
                          </Button>

                          <button
                            type="button"
                            onClick={() => onOpenAdjust(row)}
                            title="Reconcile / Adjust"
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewHistory(row)}
                            title="Audit Ledger"
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
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
    </div>
  );
}

export default StockAlertsView;
