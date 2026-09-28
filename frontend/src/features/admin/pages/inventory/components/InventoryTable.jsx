import React from "react";
import { Package, QrCode, ArrowDownToLine, ArrowRightLeft, History, Sliders, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function InventoryTable({
  items = [],
  isLoading,
  onAdjust,
  onReceive,
  onTransfer,
  onViewHistory,
  onShowQR,
}) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-primary">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-3.5">Product & SKU</th>
              <th className="p-3.5">Variant</th>
              <th className="p-3.5">Depot Warehouse</th>
              <th className="p-3.5 text-right">Physical Stock</th>
              <th className="p-3.5 text-right">Reserved</th>
              <th className="p-3.5 text-right">Available</th>
              <th className="p-3.5 text-right">Reorder Level</th>
              <th className="p-3.5">Stock Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-text-muted">
                  Loading multi-depot inventory catalog...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-text-muted">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const prod = row.product || row;
                const variant = row.variant;
                const wh = row.warehouse;
                const stock = row.quantity !== undefined ? row.quantity : (row.stock || 0);
                const reserved = row.reservedQuantity !== undefined ? row.reservedQuantity : (row.reserved || 0);
                const available = row.availableQuantity !== undefined ? row.availableQuantity : Math.max(0, stock - reserved);
                const reorderLvl = row.reorderLevel !== undefined ? row.reorderLevel : 10;

                // Status calculation
                let statusBadge = { label: "In Stock", variant: "success" };
                if (available <= 0) {
                  statusBadge = { label: "Out of Stock", variant: "danger" };
                } else if (available <= reorderLvl) {
                  statusBadge = { label: "Low Stock", variant: "warning" };
                }

                const qrValue = JSON.stringify({
                  id: row.id,
                  sku: variant?.sku || prod.sku,
                  name: prod.name,
                  wh: wh?.code || "DEFAULT",
                });

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    {/* Product & SKU */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">{prod.name}</p>
                          <span className="font-mono text-[10px] text-text-muted">
                            {variant?.sku || prod.sku || "SKU-N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Variant */}
                    <td className="p-3.5">
                      {variant ? (
                        <div>
                          <span className="font-semibold text-slate-800">{variant.name || "Variant"}</span>
                          {variant.sku && variant.sku !== prod.sku && (
                            <span className="font-mono text-[10px] text-text-muted block">{variant.sku}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-muted text-[11px] italic">Simple Product</span>
                      )}
                    </td>

                    {/* Warehouse */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {wh?.code || "GLOBAL-01"}
                      </span>
                      <span className="text-[10px] text-text-muted block mt-0.5">
                        {wh?.name || wh?.city || "Central Hub"}
                      </span>
                    </td>

                    {/* Physical Stock */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {stock.toLocaleString()}
                    </td>

                    {/* Reserved */}
                    <td className="p-3.5 text-right font-mono font-semibold text-amber-600">
                      {reserved.toLocaleString()}
                    </td>

                    {/* Available */}
                    <td className="p-3.5 text-right font-mono font-black text-[#00875A]">
                      {available.toLocaleString()}
                    </td>

                    {/* Reorder Level */}
                    <td className="p-3.5 text-right font-mono text-slate-500">
                      {reorderLvl}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge variant={statusBadge.variant} size="sm">
                        {statusBadge.label}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {onShowQR && (
                          <button
                            type="button"
                            onClick={() => onShowQR(row)}
                            title="Show QR Code Tag"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onReceive && (
                          <button
                            type="button"
                            onClick={() => onReceive(row)}
                            title="Inward / Receive Stock"
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onTransfer && (
                          <button
                            type="button"
                            onClick={() => onTransfer(row)}
                            title="Transfer Stock to another depot"
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onAdjust && (
                          <button
                            type="button"
                            onClick={() => onAdjust(row)}
                            title="Adjust / Write-off / Restock"
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onViewHistory && (
                          <button
                            type="button"
                            onClick={() => onViewHistory(row)}
                            title="View Audit Ledger History"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
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
  );
}

export default InventoryTable;

