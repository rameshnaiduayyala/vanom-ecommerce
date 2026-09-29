import React from "react";
import { DollarSign, Boxes, ArrowRightLeft } from "lucide-react";

export function SimplePricingCard({ formData, setFormData }) {
  const usStock = parseInt(formData.stock_usd, 10) || 0;
  const caStock = parseInt(formData.stock_cad, 10) || 0;
  const totalStock = usStock + caStock;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#358B5B]" />
            <span>Cross-Border Pricing & Regional Inventory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Set regional retail pricing (USD & CAD), strike prices, and regional warehouse allocation.
          </p>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
          Simple Mode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* USA Pricing & Stock Box */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span>🇺🇸</span>
              <span>United States Fulfillment</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              USD ($)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-emerald-900">
                Live Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                placeholder="34.99"
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] focus:ring-2 focus:ring-[#358B5B]/20 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Old / Strike ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price_usd}
                onChange={(e) => setFormData({ ...formData, old_price_usd: e.target.value })}
                placeholder="49.99"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-emerald-200/50">
            <label className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
              <span>Dallas Depot Stock</span>
              <span className="font-mono text-emerald-700">{usStock} units</span>
            </label>
            <input
              type="number"
              value={formData.stock_usd}
              onChange={(e) => setFormData({ ...formData, stock_usd: e.target.value })}
              placeholder="60"
              className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Canada Pricing & Stock Box */}
        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <span>🇨🇦</span>
              <span>Canada Fulfillment</span>
            </span>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full">
              CAD (CA$)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-blue-900">Price (CA$ CAD)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_cad}
                onChange={(e) => setFormData({ ...formData, price_cad: e.target.value })}
                placeholder="46.99"
                className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Old / Strike (CA$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price_cad}
                onChange={(e) => setFormData({ ...formData, old_price_cad: e.target.value })}
                placeholder="64.99"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 line-through text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-blue-200/50">
            <label className="text-[11px] font-semibold text-blue-900 flex items-center justify-between">
              <span>Toronto Depot Stock</span>
              <span className="font-mono text-blue-700">{caStock} units</span>
            </label>
            <input
              type="number"
              value={formData.stock_cad}
              onChange={(e) => setFormData({ ...formData, stock_cad: e.target.value })}
              placeholder="40"
              className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Aggregated Total Stock Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-800">Total Live Catalog Inventory:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 text-sm">{totalStock} Units</span>
          <span className="text-[11px] text-slate-500">
            ({Math.round((usStock / (totalStock || 1)) * 100)}% US /{" "}
            {Math.round((caStock / (totalStock || 1)) * 100)}% CA)
          </span>
        </div>
      </div>
    </div>
  );
}

export default SimplePricingCard;
