import React from "react";
import {
  Flame,
  Sparkles,
  Tag,
  Plus,
  Trash2,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

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
      {/* ── Card 1: Publish Actions & Status ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Publishing Status
          </h4>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              formData.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                formData.status === "ACTIVE" ? "bg-emerald-600" : "bg-slate-400"
              }`}
            />
            {formData.status}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Visibility</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] cursor-pointer font-medium text-slate-800"
            >
              <option value="ACTIVE">Published (Active on Storefronts)</option>
              <option value="INACTIVE">Draft (Hidden from Customers)</option>
            </select>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isPending}
              className="w-full font-bold shadow-xs py-2.5 cursor-pointer bg-[#204B38] hover:bg-[#18392B]"
            >
              {isEditMode ? "Save Changes" : "Publish Master Product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              className="w-full text-slate-600 cursor-pointer text-xs"
            >
              Cancel & Discard
            </Button>
          </div>
        </div>
      </div>

      {/* ── Card 2: Promotional Badges & Highlighting ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          Storefront Badges
        </h4>

        <div className="space-y-2.5">
          {/* Bestseller Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Bestseller Badge</p>
                <p className="text-[10px] text-slate-400">Featured in bestseller carousels</p>
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
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">New Product Arrival</p>
                <p className="text-[10px] text-slate-400">Featured in new arrival feeds</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_new}
              onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
              className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          {/* Featured Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Featured Showcase</p>
                <p className="text-[10px] text-slate-400">Hero banners & homepage grid</p>
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

      {/* ── Card 3: Logistics, Returns & Warranty ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          Logistics & Assurance
        </h4>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Delivery Information</span>
            </label>
            <input
              type="text"
              value={formData.delivery_info}
              onChange={(e) => setFormData({ ...formData, delivery_info: e.target.value })}
              placeholder="e.g. Free Express Delivery (2-4 Days)"
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Return Policy</span>
            </label>
            <input
              type="text"
              value={formData.return_policy}
              onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
              placeholder="e.g. 7 Days Easy Return Window"
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Warranty / Certification</span>
            </label>
            <input
              type="text"
              value={formData.warranty_info}
              onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
              placeholder="e.g. 100% USDA Certified Organic"
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
            />
          </div>
        </div>
      </div>

      {/* ── Card 4: Key Highlights & Specs ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Key Highlights (Bullet Specs)
          </h4>
          <button
            type="button"
            onClick={addHighlightRow}
            className="text-xs font-bold text-[#358B5B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-2">
          {(formData.key_highlights || []).map((kh, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={kh.label}
                onChange={(e) => updateHighlightRow(idx, "label", e.target.value)}
                placeholder="Label"
                className="w-24 px-2 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold text-slate-700"
              />
              <input
                type="text"
                value={kh.value}
                onChange={(e) => updateHighlightRow(idx, "value", e.target.value)}
                placeholder="Value / Detail"
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] text-slate-800"
              />
              <button
                type="button"
                onClick={() => removeHighlightRow(idx)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                title="Remove bullet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {(!formData.key_highlights || formData.key_highlights.length === 0) && (
            <p className="text-xs text-slate-400 italic py-2">
              No highlights added. Click "+ Add" to add bullet points for product pages.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductSidebarSettings;
