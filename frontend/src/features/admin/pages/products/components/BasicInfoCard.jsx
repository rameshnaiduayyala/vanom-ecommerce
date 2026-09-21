import React from "react";
import { Package, Layers, Sparkles, Tag, Boxes } from "lucide-react";

export function BasicInfoCard({ formData, setFormData, categories = [], brands = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#358B5B]" />
          <span>Product Overview & Classification</span>
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">Core Attributes</span>
      </div>

      {/* Product Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Product Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Royal Kashmiri Saffron Grade-A (Super Negin)"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white focus:ring-2 focus:ring-[#358B5B]/20 transition-all placeholder:text-slate-400 font-medium text-slate-900"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Product Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed commodity specifications, harvesting origin, organic certifications, storage recommendations..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white focus:ring-2 focus:ring-[#358B5B]/20 transition-all placeholder:text-slate-400 resize-y text-slate-800"
        />
      </div>

      {/* Category, Brand & SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white cursor-pointer text-slate-800 font-medium"
          >
            {categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            ) : (
              <option value="">No categories available</option>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Brand / Producer</label>
          <select
            value={formData.brand_id}
            onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white cursor-pointer text-slate-800 font-medium"
          >
            <option value="">Vanom Organics (Default)</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Master SKU Code</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g. VAN-SAF-001"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:bg-white font-mono uppercase text-slate-900"
          />
        </div>
      </div>

      {/* Product Type Selector Pills */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 mb-2">
          Product Architecture & Variations
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, product_type: "simple" })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              formData.product_type === "simple"
                ? "border-[#358B5B] bg-[#358B5B]/5 ring-1 ring-[#358B5B]"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                formData.product_type === "simple"
                  ? "bg-[#358B5B] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Simple Standard Product</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Single SKU with standard retail & wholesale pricing across US/Canada.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, product_type: "variable" })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              formData.product_type === "variable"
                ? "border-[#358B5B] bg-[#358B5B]/5 ring-1 ring-[#358B5B]"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                formData.product_type === "variable"
                  ? "bg-[#358B5B] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Variable / Configurable</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Multiple options (e.g. 500g, 1KG, 5KG) each with individual SKUs and warehouse stock.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoCard;
