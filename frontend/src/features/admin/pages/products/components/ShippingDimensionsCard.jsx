import React from "react";
import { Truck, Scale, Box, Info } from "lucide-react";

export function ShippingDimensionsCard({ formData, setFormData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#358B5B]" />
            <span>Shipping & Parcel Dimensions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Measured parcel specs used by Shippo to quote exact real-time USPS, UPS, and FedEx carrier rates.
          </p>
        </div>
        <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-lg">
          Shippo Logistics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight & Weight Unit */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#358B5B]" />
              <span>Package Weight</span>
            </label>
            <span className="text-[10px] text-slate-400">Default: 1.0 lb</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.weight ?? ""}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g. 1.5"
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] font-medium text-slate-900"
            />
            <select
              value={formData.weight_unit || "lb"}
              onChange={(e) => setFormData({ ...formData, weight_unit: e.target.value })}
              className="w-24 px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-700 cursor-pointer"
            >
              <option value="lb">lb (Pound)</option>
              <option value="kg">kg (Kilo)</option>
              <option value="oz">oz (Ounce)</option>
              <option value="g">g (Gram)</option>
            </select>
          </div>
        </div>

        {/* Dimension Unit */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-[#358B5B]" />
              <span>Dimension Unit</span>
            </label>
            <span className="text-[10px] text-slate-400">L × W × H</span>
          </div>
          <select
            value={formData.dimension_unit || "in"}
            onChange={(e) => setFormData({ ...formData, dimension_unit: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-700 cursor-pointer"
          >
            <option value="in">Inches (in)</option>
            <option value="cm">Centimeters (cm)</option>
          </select>
        </div>
      </div>

      {/* Package Box Dimensions: Length x Width x Height */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Box Dimensions ({formData.dimension_unit || "in"})</span>
          </span>
          <span className="text-[10px] text-slate-400">Default: 10" × 8" × 4"</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Length</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.length ?? ""}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                placeholder="10.0"
                className="w-full pl-3 pr-7 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-medium text-slate-900"
              />
              <span className="absolute right-2 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                {formData.dimension_unit || "in"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Width</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.width ?? ""}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                placeholder="8.0"
                className="w-full pl-3 pr-7 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-medium text-slate-900"
              />
              <span className="absolute right-2 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                {formData.dimension_unit || "in"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Height</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.height ?? ""}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="4.0"
                className="w-full pl-3 pr-7 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-medium text-slate-900"
              />
              <span className="absolute right-2 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                {formData.dimension_unit || "in"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Fallback Explanation Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Automatic Shippo Fallback: </span>
          <span>
            If dimensions or weight are omitted for this product, Shippo calculates live carrier rates using standard e-commerce parcel defaults (1.0 lb, 10" × 8" × 4"). When provided, your exact specifications take priority.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ShippingDimensionsCard;
