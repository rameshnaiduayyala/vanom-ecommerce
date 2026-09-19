import React from "react";
import { Flame, Sparkles, Tag, Plus, Trash2 } from "lucide-react";

export function ProductSidebarSettings({
  formData,
  setFormData,
  addHighlightRow,
  removeHighlightRow,
  updateHighlightRow,
  isEditMode,
  isPending,
  onCancel,
}) {
  return (
    <div className="space-y-6">
      {/* Card 1: Product Badges & Highlighting */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Product Badges & Tags
        </h4>

        <div className="space-y-3">
          {/* Bestseller Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">is_best_seller</p>
                <p className="text-[10px] text-slate-400">Display "BESTSELLER" badge</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_best_seller}
              onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
              className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          {/* New Product Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">is_new</p>
                <p className="text-[10px] text-slate-400">Display "NEW" badge</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_new}
              onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
              className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          {/* Featured Product Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">is_featured</p>
                <p className="text-[10px] text-slate-400">Highlight in storefront featured grid</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Card 2: Key Highlights Manager */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Key Highlights ({formData.key_highlights?.length || 0})</span>
          </h4>
          <button
            type="button"
            onClick={addHighlightRow}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Highlight</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Pill highlights rendered in the storefront (e.g. Delivery, Shelf Life, Origin, Authenticity).
        </p>

        <div className="space-y-2.5">
          {(formData.key_highlights || []).map((kh, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="w-1/3">
                <input
                  type="text"
                  value={kh.label}
                  onChange={(e) => updateHighlightRow(idx, "label", e.target.value)}
                  placeholder="Label"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold text-slate-700"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={kh.value}
                  onChange={(e) => updateHighlightRow(idx, "value", e.target.value)}
                  placeholder="Highlight value (e.g. 100% Organic)"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] text-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => removeHighlightRow(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Delete highlight"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Delivery, Warranty & Policy */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Delivery & Trust Policies
        </h4>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Delivery Info</label>
            <input
              type="text"
              value={formData.delivery_info}
              onChange={(e) => setFormData({ ...formData, delivery_info: e.target.value })}
              placeholder="e.g. Free Delivery By Thu, 12 Sep"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Return Policy</label>
            <input
              type="text"
              value={formData.return_policy}
              onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
              placeholder="e.g. 7 Days Easy Returns"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Warranty Info</label>
            <input
              type="text"
              value={formData.warranty_info}
              onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
              placeholder="e.g. 1 Year Brand Warranty"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Publish Status
        </h4>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] cursor-pointer"
            >
              <option value="ACTIVE">Active (Live in Store)</option>
              <option value="DRAFT">Draft (Hidden)</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-[#204B38] hover:bg-[#358B5B] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span>{isEditMode ? "Save Product Changes" : "Publish Product"}</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ProductSidebarSettings;
