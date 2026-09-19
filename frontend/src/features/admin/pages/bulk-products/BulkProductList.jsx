import React from "react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Eye, Edit2, Trash2 } from "lucide-react";

export function BulkProductList({
  products = [],
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-primary">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Commodity Info</th>
              <th className="p-4">Bulk SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Packaging & Pallet Spec</th>
              <th className="p-4">Wholesale MOQ</th>
              <th className="p-4">Country Markets & Base Pricing</th>
              <th className="p-4">Total Stock</th>
              <th className="p-4">Lead Time</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-text-muted">
                  No bulk products found. Click &ldquo;+ Add Bulk Product&rdquo; to create your first wholesale commodity.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const usPrice = p.countryPrices?.find((c) => c.countryCode === "US");
                const caPrice = p.countryPrices?.find((c) => c.countryCode === "CA");
                const inPrice = p.countryPrices?.find((c) => c.countryCode === "IN");
                const totalStock =
                  p.countryPrices && p.countryPrices.length > 0
                    ? p.countryPrices.reduce((acc, cp) => acc + (cp.stock || 0), 0)
                    : p.stockQuantity || 0;

                return (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images?.[0] ||
                            "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-text-primary leading-tight max-w-xs">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Private B2B Direct
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-text-secondary">{p.sku}</td>
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {p.categoryName || "General"}
                      </Badge>
                    </td>
                    <td className="p-4 text-text-secondary">
                      <div className="font-semibold text-text-primary">
                        {p.packaging?.type || "25 KG Sack"}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {p.packaging?.packagesPerPallet || 40} packages/pallet (
                        {p.packaging?.palletCapacityUnits || 1000} units)
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-700">
                      {p.moq || usPrice?.moq || 20} units
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {usPrice && (
                          <span className="font-mono text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                            <span>🇺🇸</span>
                            <span>${usPrice.tiers?.[0]?.price || p.basePriceUSD || 0} USD</span>
                          </span>
                        )}
                        {caPrice && (
                          <span className="font-mono text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                            <span>🇨🇦</span>
                            <span>CA${caPrice.tiers?.[0]?.price || p.basePriceCAD || 0} CAD</span>
                          </span>
                        )}
                        {inPrice && (
                          <span className="font-mono text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                            <span>🇮🇳</span>
                            <span>₹{inPrice.tiers?.[0]?.price || p.basePriceINR || 0} INR</span>
                          </span>
                        )}
                        {!usPrice && !caPrice && !inPrice && (
                          <span className="font-bold text-text-primary">
                            ${p.basePriceUSD || 0} USD • CA${p.basePriceCAD || 0}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">
                      {totalStock.toLocaleString()} units
                    </td>
                    <td className="p-4 text-text-muted font-medium">
                      {p.leadTimeDays || 2} Days
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(p)}
                          className="p-1.5 text-text-muted hover:text-[#00875A] rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Tier Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="Edit Bulk Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Bulk Product"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
}
