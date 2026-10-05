import React from "react";
import { Badge } from "@/components/ui/Badge.jsx";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

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
              <th className="p-4">Master SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Weight Variants</th>
              <th className="p-4">Country Wholesale Pricing</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-muted">
                  No wholesale products found. Click &ldquo;+ Add Bulk Product&rdquo; to create your first wholesale commodity.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const variants = Array.isArray(p.variants) ? p.variants : [];
                const imgSrc = resolveProductImageUrl(p);

                return (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    {/* Commodity Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border shrink-0 bg-surface"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-text-primary leading-tight max-w-xs text-sm">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {p.brand || "VANOM Wholesale"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Master SKU */}
                    <td className="p-4 font-mono font-bold text-text-secondary">{p.sku}</td>

                    {/* Category */}
                    <td className="p-4">
                      <Badge variant="default" size="sm">
                        {p.category || p.categoryName || "General"}
                      </Badge>
                    </td>

                    {/* Weight Variants */}
                    <td className="p-4">
                      {variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {variants.map((v, vIdx) => {
                            const weightStr = v.name || `${v.weight ?? vIdx + 1}${v.weightUnit || "kg"}`;
                            return (
                              <span
                                key={v.id || vIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]"
                              >
                                {weightStr}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No variants</span>
                      )}
                    </td>

                    {/* Country Wholesale Pricing */}
                    <td className="p-4">
                      {variants.length > 0 ? (
                        <div className="space-y-1 font-mono text-[11px]">
                          {variants.slice(0, 3).map((v, vIdx) => {
                            const usPrice = v.countryPrices?.find((cp) => cp.countryCode === "US")?.unitPrice;
                            const caPrice = v.countryPrices?.find((cp) => cp.countryCode === "CA")?.unitPrice;
                            const weightStr = v.name || `${v.weight ?? vIdx + 1}${v.weightUnit || "kg"}`;

                            return (
                              <div key={v.id || vIdx} className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 w-12">{weightStr}:</span>
                                {usPrice !== undefined && (
                                  <span className="text-emerald-800 font-semibold">
                                    🇺🇸 ${Number(usPrice).toFixed(2)}
                                  </span>
                                )}
                                {caPrice !== undefined && (
                                  <span className="text-slate-700 font-semibold">
                                    🇨🇦 CA${Number(caPrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {variants.length > 3 && (
                            <span className="text-[10px] text-slate-400 italic">+{variants.length - 3} more weights</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Configured on variants</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <Badge variant={p.isActive !== false ? "green" : "neutral"} size="sm">
                        {p.isActive !== false ? "Active" : "Disabled"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(p)}
                          className="p-1.5 text-text-muted hover:text-[#00875A] rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="View Weight Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-text-muted hover:text-blue-600 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                          title="Edit Wholesale Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Wholesale Product"
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
