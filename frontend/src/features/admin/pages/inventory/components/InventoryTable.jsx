import React from "react";
import { Package, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function InventoryTable({
  items = [],
  isLoading,
  onAdjust,
  onShowQR,
}) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-primary">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Product & SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Brand</th>
              <th className="p-4">QR Code Tag</th>
              <th className="p-4">Total Stock</th>
              <th className="p-4">Reserved</th>
              <th className="p-4">Available</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-text-muted">
                  Loading inventory records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-text-muted">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const qrValue = JSON.stringify({
                  id: row.id,
                  sku: row.sku,
                  name: row.name,
                });

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    {/* Product & SKU */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-muted border border-border flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">{row.name}</p>
                          <span className="font-mono text-[10px] text-text-muted">
                            {row.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {row.category || "General"}
                      </Badge>
                    </td>

                    {/* Brand */}
                    <td className="p-4 text-text-secondary font-medium">
                      {row.brand || "Vanom"}
                    </td>

                    {/* Generated QR Code Trigger */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onShowQR && onShowQR(row)}
                        className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/70 hover:border-[#00875A] transition-all cursor-pointer group shadow-2xs"
                        title="Click to view & print high-res QR code"
                      >
                        <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/80 group-hover:border-[#00875A]/40 transition-colors">
                          <QRCodeSVG value={qrValue} size={24} level="M" fgColor="#0F2B1C" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-slate-800 block group-hover:text-[#00875A] leading-tight">
                            View QR Tag
                          </span>
                          <span className="text-[9px] text-text-muted font-mono block">
                            {row.sku || "SKU-STD"}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Total Stock */}
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {(row.stock || 0).toLocaleString()}
                    </td>

                    {/* Reserved */}
                    <td className="p-4 font-mono font-semibold text-amber-600">
                      {(row.reserved || 0).toLocaleString()}
                    </td>

                    {/* Available */}
                    <td className="p-4 font-mono font-black text-[#00875A]">
                      {(row.available !== undefined
                        ? row.available
                        : (row.stock || 0) - (row.reserved || 0)
                      ).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAdjust(row)}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        Adjust Stock
                      </Button>
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
