import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Globe2, FileText, Scale } from "lucide-react";
import { TiptapViewer } from "@/components/common/TiptapViewer.jsx";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

export function BulkProductViewModal({
  product,
  onClose,
}) {
  if (!product) return null;

  const variants = Array.isArray(product.variants) ? product.variants : [];

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
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Master SKU</span>
              <span className="font-mono font-bold text-slate-800">{product.sku}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Weights Available</span>
              <span className="font-bold text-emerald-800">
                {variants.length > 0 ? `${variants.length} Weight Variants` : "Standard"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-bold text-slate-800">
                {product.category || product.categoryName || "Wholesale Commodity"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Brand / Origin</span>
              <span className="font-bold text-slate-800">
                {product.brand || product.originCountry || "VANOM Wholesale"}
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

        {/* Dynamic Weight Variants & Country Pricing Table */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Scale className="w-4 h-4 text-[#00875A]" />
            Wholesale Weights & Country-Specific Pricing:
          </h5>

          {variants.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Weight Option</th>
                    <th className="p-3">Variant SKU</th>
                    <th className="p-3">USA Price (USD)</th>
                    <th className="p-3">Canada Price (CAD)</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {variants.map((v, idx) => {
                    const us = v.countryPrices?.find((cp) => cp.countryCode?.toUpperCase() === "US");
                    const ca = v.countryPrices?.find((cp) => cp.countryCode?.toUpperCase() === "CA");
                    const weightStr = v.name || `${v.weight ?? idx + 1}${v.weightUnit || "kg"}`;

                    return (
                      <tr key={v.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{weightStr}</td>
                        <td className="p-3 font-mono text-slate-500">{v.sku}</td>
                        <td className="p-3 font-mono font-bold text-emerald-800">
                          {us?.unitPrice !== undefined ? `$${Number(us.unitPrice).toFixed(2)}` : "—"}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-800">
                          {ca?.unitPrice !== undefined ? `CA$${Number(ca.unitPrice).toFixed(2)}` : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={v.isActive !== false ? "green" : "neutral"} size="sm">
                            {v.isActive !== false ? "Available" : "Disabled"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 italic text-xs">No weight variants configured.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
