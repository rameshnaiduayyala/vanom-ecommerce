import React from "react";
import { DollarSign, Boxes } from "lucide-react";

export function SimplePricingCard({ formData, setFormData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#358B5B]" />
            <span>Simple Product Pricing & Stock</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Set cross-border prices (USD & CAD), strike-through comparison price, and available inventory.
          </p>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
          Simple Mode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* USA Pricing & Stock Box */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">🇺🇸 United States (USD)</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              USD ($)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-emerald-800">Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                placeholder="34.99"
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Old Price / Strike ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price_usd}
                onChange={(e) => setFormData({ ...formData, old_price_usd: e.target.value })}
                placeholder="49.99"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-emerald-200/50">
            <label className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
              <span>🇺🇸 US Warehouse Stock</span>
              <span className="text-[10px] text-emerald-700">Units</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_usd}
              onChange={(e) => {
                const val = e.target.value;
                const usStock = parseInt(val, 10) || 0;
                const caStock = parseInt(formData.stock_cad, 10) || 0;
                setFormData({ ...formData, stock_usd: val, stock_quantity: usStock + caStock });
              }}
              placeholder="60"
              className="w-full px-3 py-1.5 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Canada Pricing & Stock Box */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">🇨🇦 Canada (CAD)</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
              CAD (CA$)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-blue-800">Price (CA$ CAD)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_cad}
                onChange={(e) => setFormData({ ...formData, price_cad: e.target.value })}
                placeholder={formData.price_usd ? (Number(formData.price_usd) * 1.35).toFixed(2) : "46.99"}
                className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Old Price (CA$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.old_price_cad}
                onChange={(e) => setFormData({ ...formData, old_price_cad: e.target.value })}
                placeholder="65.99"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-blue-200/50">
            <label className="text-[11px] font-semibold text-blue-900 flex items-center justify-between">
              <span>🇨🇦 CA Warehouse Stock</span>
              <span className="text-[10px] text-blue-700">Units</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_cad}
              onChange={(e) => {
                const val = e.target.value;
                const usStock = parseInt(formData.stock_usd, 10) || 0;
                const caStock = parseInt(val, 10) || 0;
                setFormData({ ...formData, stock_cad: val, stock_quantity: usStock + caStock });
              }}
              placeholder="40"
              className="w-full px-3 py-1.5 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Combined Stock Quantity */}
      <div className="pt-2">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-700" />
              <span>Combined Total Stock (US + CA)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Sum of USA and Canada warehouse stock counts.</p>
          </div>

          <div className="w-36">
            <div className="w-full px-3.5 py-2 text-sm bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950 text-center">
              {(parseInt(formData.stock_usd, 10) || 0) + (parseInt(formData.stock_cad, 10) || 0)} units
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimplePricingCard;
