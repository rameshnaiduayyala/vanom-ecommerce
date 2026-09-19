import React from "react";
import { Package, Layers } from "lucide-react";

export function BasicInfoCard({ formData, setFormData, categories = [], brands = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Package className="w-4 h-4 text-[#358B5B]" />
        <span>Product Information</span>
      </h3>

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
          placeholder="e.g. Royal Kashmiri Saffron Grade-A"
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter detailed product description, specifications, or packaging details..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all placeholder:text-slate-400 resize-y"
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
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] cursor-pointer"
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
          <label className="block text-xs font-bold text-slate-700">
            Brand
          </label>
          <select
            value={formData.brand_id}
            onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] cursor-pointer"
          >
            <option value="">Select Brand (Optional)</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">SKU / Code</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Auto-generated if blank (e.g. VAN-8392)"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] transition-all font-mono"
          />
        </div>
      </div>

      {/* Product Type (simple | variable) */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-bold text-slate-700">Product Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, product_type: "simple" })}
            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              formData.product_type === "simple"
                ? "bg-emerald-50 border-[#358B5B] text-[#204B38] ring-2 ring-[#358B5B]/20 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Package className="w-4 h-4 text-[#358B5B]" />
            <div className="text-left">
              <div className="font-bold">Simple Product</div>
              <div className="text-[10px] font-normal text-slate-500">Single Price & Stock</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, product_type: "variable" })}
            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              formData.product_type === "variable"
                ? "bg-emerald-50 border-[#358B5B] text-[#204B38] ring-2 ring-[#358B5B]/20 shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4 text-[#358B5B]" />
            <div className="text-left">
              <div className="font-bold">Variable Product</div>
              <div className="text-[10px] font-normal text-slate-500">Multiple Variants & Stocks</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoCard;
