import React from "react";
import { Layers, Plus, Trash2, Scale } from "lucide-react";

export function VariantsPricingCard({
  formData,
  addVariantRow,
  removeVariantRow,
  updateVariantRow,
}) {
  const totalVariantStock = (formData.variants || []).reduce(
    (sum, v) => sum + (parseInt(v.stock_quantity, 10) || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#358B5B]" />
            <span>Variant Matrix & Regional Warehouse Allocation</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure each pack size / volume with individual SKUs, weight, USD & CAD pricing, and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariantRow}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-dashed border-[#358B5B] text-[#358B5B] hover:bg-[#358B5B]/10 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Variant Option</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3">Option / Size</th>
                <th className="py-3 px-2">SKU Code</th>
                <th className="py-3 px-2">Weight (KG)</th>
                <th className="py-3 px-2 bg-emerald-50/70 text-emerald-950">🇺🇸 Price ($)*</th>
                <th className="py-3 px-2 bg-emerald-50/70 text-emerald-800">Old ($)</th>
                <th className="py-3 px-2 bg-emerald-50/90 text-emerald-950 font-black">US Stock</th>
                <th className="py-3 px-2 bg-blue-50/70 text-blue-950">🇨🇦 Price (CA$)</th>
                <th className="py-3 px-2 bg-blue-50/70 text-blue-800">Old (CA$)</th>
                <th className="py-3 px-2 bg-blue-50/90 text-blue-950 font-black">CA Stock</th>
                <th className="py-3 px-2 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.variants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-2 min-w-[130px]">
                    <input
                      type="text"
                      value={v.variant_name}
                      onChange={(e) => updateVariantRow(v.id, "variant_name", e.target.value)}
                      placeholder="e.g. 500g Pack"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-24">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariantRow(v.id, "sku", e.target.value)}
                      placeholder="Auto"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-mono uppercase text-slate-700"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20">
                    <input
                      type="number"
                      step="0.01"
                      value={v.weight}
                      onChange={(e) => updateVariantRow(v.id, "weight", parseFloat(e.target.value) || 0)}
                      placeholder="1.0"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] text-slate-700 font-medium"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-24 bg-emerald-50/20">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={v.price_usd}
                      onChange={(e) => updateVariantRow(v.id, "price_usd", e.target.value)}
                      placeholder="29.99"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-emerald-50/20">
                    <input
                      type="number"
                      step="0.01"
                      value={v.old_price_usd}
                      onChange={(e) => updateVariantRow(v.id, "old_price_usd", e.target.value)}
                      placeholder="39.99"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-400 font-medium"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-emerald-50/40">
                    <input
                      type="number"
                      value={v.stock_usd}
                      onChange={(e) => updateVariantRow(v.id, "stock_usd", e.target.value)}
                      placeholder="30"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold text-emerald-900"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-24 bg-blue-50/20">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price_cad}
                      onChange={(e) => updateVariantRow(v.id, "price_cad", e.target.value)}
                      placeholder="39.99"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-slate-900"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-blue-50/20">
                    <input
                      type="number"
                      step="0.01"
                      value={v.old_price_cad}
                      onChange={(e) => updateVariantRow(v.id, "old_price_cad", e.target.value)}
                      placeholder="49.99"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 line-through text-slate-400 font-medium"
                    />
                  </td>
                  <td className="py-2.5 px-1 w-20 bg-blue-50/40">
                    <input
                      type="number"
                      value={v.stock_cad}
                      onChange={(e) => updateVariantRow(v.id, "stock_cad", e.target.value)}
                      placeholder="20"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-semibold text-blue-900"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right pr-3">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(v.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Variant Option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Active Variants: <strong className="text-slate-800">{formData.variants.length}</strong>
          </span>
          <span>
            Combined Stock Across All Variants:{" "}
            <strong className="text-[#358B5B] font-mono font-bold text-sm">
              {totalVariantStock} Units
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default VariantsPricingCard;
