import React from "react";
import { Layers, Plus, Trash2 } from "lucide-react";

export function VariantsPricingCard({ formData, addVariantRow, removeVariantRow, updateVariantRow }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#358B5B]" />
            <span>Variant Prices & Country-Wise Stock</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each variant has its own individual SKU, weight, USD & CAD prices, and US/CA warehouse stocks.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariantRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#358B5B] text-[#358B5B] hover:bg-[#358B5B]/10 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another Variant</span>
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50/60">
                <th className="py-2.5 px-2 rounded-l-lg">Variant Option / Size</th>
                <th className="py-2.5 px-2">SKU</th>
                <th className="py-2.5 px-2">Weight (KG)</th>
                <th className="py-2.5 px-2 bg-emerald-50/50 text-emerald-900">Price ($ USD) *</th>
                <th className="py-2.5 px-2">Old ($)</th>
                <th className="py-2.5 px-2 bg-emerald-50/70 text-emerald-900">🇺🇸 US Stock</th>
                <th className="py-2.5 px-2 bg-blue-50/50 text-blue-900">Price (CA$)</th>
                <th className="py-2.5 px-2">Old (CA$)</th>
                <th className="py-2.5 px-2 bg-blue-50/70 text-blue-900">🇨🇦 CA Stock</th>
                <th className="py-2.5 px-2 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.variants.map((v, i) => (
                <tr key={v.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-1 min-w-[130px]">
                    <input
                      type="text"
                      value={v.variant_name}
                      onChange={(e) => updateVariantRow(v.id, "variant_name", e.target.value)}
                      placeholder={`e.g. 500g Pack`}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-medium"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariantRow(v.id, "sku", e.target.value)}
                      placeholder={`V${i + 1}`}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-mono text-slate-600"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-14">
                    <input
                      type="number"
                      step="0.1"
                      value={v.weight}
                      onChange={(e) => updateVariantRow(v.id, "weight", e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] text-center"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-emerald-50/30">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={v.price_usd}
                      onChange={(e) => updateVariantRow(v.id, "price_usd", e.target.value)}
                      placeholder="18.00"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-emerald-950"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-16">
                    <input
                      type="number"
                      step="0.01"
                      value={v.old_price_usd}
                      onChange={(e) => updateVariantRow(v.id, "old_price_usd", e.target.value)}
                      placeholder="25.00"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-400"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-16 bg-emerald-50/50">
                    <input
                      type="number"
                      min="0"
                      value={v.stock_usd}
                      onChange={(e) => updateVariantRow(v.id, "stock_usd", e.target.value)}
                      placeholder="30"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-emerald-900 text-center"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-blue-50/30">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price_cad}
                      onChange={(e) => updateVariantRow(v.id, "price_cad", e.target.value)}
                      placeholder={v.price_usd ? (Number(v.price_usd) * 1.35).toFixed(2) : "24.00"}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-blue-950"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-16">
                    <input
                      type="number"
                      step="0.01"
                      value={v.old_price_cad}
                      onChange={(e) => updateVariantRow(v.id, "old_price_cad", e.target.value)}
                      placeholder="32.00"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-400"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-16 bg-blue-50/50">
                    <input
                      type="number"
                      min="0"
                      value={v.stock_cad}
                      onChange={(e) => updateVariantRow(v.id, "stock_cad", e.target.value)}
                      placeholder="20"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-blue-900 text-center"
                    />
                  </td>
                  <td className="py-2.5 px-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(v.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">
            Total Variants: <strong className="text-slate-900">{formData.variants.length}</strong>
          </span>
          <span className="font-semibold text-slate-600">
            Combined Stock: <strong className="text-emerald-700">{formData.variants.reduce((sum, v) => sum + (parseInt(v.stock_usd, 10) || 0) + (parseInt(v.stock_cad, 10) || 0), 0)} units</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default VariantsPricingCard;
