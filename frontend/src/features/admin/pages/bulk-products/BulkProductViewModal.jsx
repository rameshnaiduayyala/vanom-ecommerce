import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Globe2, FileText, Package } from "lucide-react";
import { TiptapViewer } from "@/components/common/TiptapViewer.jsx";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

export function BulkProductViewModal({
  product,
  onClose,
}) {
  if (!product) return null;

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title={`Wholesale Dossier: ${product.name}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Meta Specifications with Image Preview */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <img
            src={resolveProductImageUrl(product)}
            alt={product.name}
            className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 bg-white shadow-xs"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">SKU</span>
              <span className="font-mono font-bold text-slate-800">{product.sku}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">MOQ</span>
              <span className="font-bold text-amber-700">{product.moq} Units</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Pallet Spec</span>
              <span className="font-bold text-slate-800">
                {product.packaging?.packagesPerPallet || 40} Packages
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Origin</span>
              <span className="font-bold text-slate-800">
                {product.originCountry || product.brand}
              </span>
            </div>
          </div>
        </div>

        {/* Rich Description View via TiptapViewer */}
        {product.description && (
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <FileText className="w-4 h-4 text-[#00875A]" />
              Wholesale Specifications & Description:
            </h5>
            <div className="prose-sm max-w-none text-slate-700">
              <TiptapViewer content={product.description} />
            </div>
          </div>
        )}

        {/* Country Prices & Tier Breakdown */}
        <div>
          <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-[#00875A]" />
            Country-Wise Pricing, Warehouse Stock & Tier Schedules:
          </h5>

          {Array.isArray(product.countryPrices) && product.countryPrices.length > 0 ? (
            <div className="space-y-3">
              {product.countryPrices.map((cp) => (
                <div key={cp.countryCode} className="border border-border rounded-xl p-3 bg-surface">
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        {cp.countryCode === "US"
                          ? "🇺🇸 United States"
                          : cp.countryCode === "CA"
                          ? "🇨🇦 Canada"
                          : cp.countryCode === "IN"
                          ? "🇮🇳 India"
                          : cp.countryCode}
                      </span>
                      <Badge variant="outline" size="sm">
                        {cp.currencyCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>
                        MOQ: <strong className="text-amber-700">{cp.moq} units</strong>
                      </span>
                      <span>
                        Warehouse Stock: <strong className="text-emerald-700">{cp.stock} units</strong>
                      </span>
                    </div>
                  </div>

                  {Array.isArray(cp.tiers) && cp.tiers.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-700">
                        <tr>
                          <th className="p-2">Tier Level</th>
                          <th className="p-2">Quantity Range</th>
                          <th className="p-2 text-right">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {cp.tiers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-text-primary">Tier #{idx + 1}</td>
                            <td className="p-2 font-mono">
                              {t.minQuantity} - {t.maxQuantity ? `${t.maxQuantity} units` : "Unlimited (+)"}
                            </td>
                            <td className="p-2 text-right font-bold font-mono text-emerald-800">
                              {cp.currencyCode === "INR"
                                ? `₹${t.price}`
                                : cp.currencyCode === "CAD"
                                ? `CA$${t.price}`
                                : `$${t.price}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-text-muted text-xs italic">No specific tiers defined for this country.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Tier Level</th>
                    <th className="p-2.5">Volume Range</th>
                    <th className="p-2.5">Discount %</th>
                    <th className="p-2.5">USD Price</th>
                    <th className="p-2.5">CAD Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {product.wholesaleTiers?.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">{t.name}</td>
                      <td className="p-2.5 font-mono">
                        {t.minQuantity} - {t.maxQuantity || "Above"} units
                      </td>
                      <td className="p-2.5 text-gold-600 font-bold">{t.discountPercent}%</td>
                      <td className="p-2.5 font-bold text-emerald-800">${t.unitPriceUSD}</td>
                      <td className="p-2.5 font-bold text-blue-800">CA${t.unitPriceCAD}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
