import React, { useState, useEffect, lazy, Suspense } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { Plus, Trash2, Globe2, FileText, Scale, Image as ImageIcon } from "lucide-react";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { DEFAULT_BULK_FORM, SUPPORTED_B2B_COUNTRIES } from "./constants.js";

const TiptapEditor = lazy(() =>
  import("@/components/common/TiptapEditor.jsx").then((m) => ({
    default: m.TiptapEditor || m.default,
  }))
);

export function BulkProductFormModal({
  isOpen,
  onClose,
  initialData,
  categories = [],
  onSubmit,
  isPending,
}) {
  const [form, setForm] = useState(DEFAULT_BULK_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Reconstitute variants
      let variants = [];
      if (Array.isArray(initialData.variants) && initialData.variants.length > 0) {
        variants = initialData.variants.map((v, idx) => {
          const prices = {
            US: { countryCode: "US", currencyCode: "USD", unitPrice: 0 },
            CA: { countryCode: "CA", currencyCode: "CAD", unitPrice: 0 }
          };

          if (Array.isArray(v.countryPrices)) {
            v.countryPrices.forEach((cp) => {
              const code = cp.countryCode?.toUpperCase();
              if (prices[code]) {
                const p = cp.unitPrice !== undefined && cp.unitPrice !== null
                  ? Number(cp.unitPrice)
                  : Number(cp.tiers?.[0]?.price || 0);
                prices[code] = {
                  countryCode: code,
                  currencyCode: cp.currencyCode || (code === "CA" ? "CAD" : "USD"),
                  unitPrice: p
                };
              }
            });
          }

          const weightVal = v.weight !== null && v.weight !== undefined
            ? Number(v.weight)
            : v.attributes?.weight ? Number(v.attributes.weight) : (idx + 1);
          const weightUnit = v.weightUnit || v.attributes?.unit || "kg";
          const label = v.name || `${weightVal >= 1 ? weightVal : weightVal * 1000}${weightVal >= 1 ? weightUnit : "g"}`;

          return {
            id: v.id,
            weight: weightVal,
            weightUnit,
            label,
            skuSuffix: v.sku ? v.sku.replace(initialData.sku || "", "").replace(/^-/, "") : `${label.toUpperCase()}`,
            isActive: v.isActive !== false,
            prices
          };
        });
      } else {
        // Fallback: create default variants with initialData base prices
        variants = DEFAULT_BULK_FORM.variants;
      }

      setForm({
        name: initialData.name || "",
        sku: initialData.sku || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId || (categories[0]?.id || ""),
        brand: initialData.brand || "VANOM Wholesale",
        isActive: initialData.isActive !== false,
        images: Array.isArray(initialData.images) && initialData.images.length > 0
          ? initialData.images.map((img) => (typeof img === "string" ? img : img.url || img.mediaAssetId || img.mediaAsset?.url)).filter(Boolean)
          : DEFAULT_BULK_FORM.images,
        variants
      });
    } else {
      setForm({
        ...DEFAULT_BULK_FORM,
        categoryId: categories[0]?.id || "",
      });
    }
  }, [isOpen, initialData, categories]);

  // Variant row modifications
  const handleVariantChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      const current = { ...updated[index], [field]: value };
      if (field === "weight" || field === "weightUnit") {
        const w = field === "weight" ? value : current.weight;
        const u = field === "weightUnit" ? value : current.weightUnit;
        if (w !== "" && w !== undefined) {
          current.label = `${w}${u || "kg"}`;
          current.skuSuffix = `${w}${String(u || "KG").toUpperCase()}`;
        }
      }
      updated[index] = current;
      return { ...prev, variants: updated };
    });
  };

  const handlePriceChange = (variantIdx, countryCode, priceValue) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      const variant = { ...updated[variantIdx] };
      const currentPrices = { ...variant.prices };
      currentPrices[countryCode] = {
        ...currentPrices[countryCode],
        unitPrice: priceValue === "" ? "" : parseFloat(priceValue) || 0
      };
      variant.prices = currentPrices;
      updated[variantIdx] = variant;
      return { ...prev, variants: updated };
    });
  };

  const handleAddVariant = () => {
    setForm((prev) => {
      const newIdx = prev.variants.length + 1;
      const newVariant = {
        weight: newIdx,
        weightUnit: "kg",
        label: `${newIdx}kg`,
        skuSuffix: `${newIdx}KG`,
        isActive: true,
        prices: {
          US: { countryCode: "US", currencyCode: "USD", unitPrice: 10.00 },
          CA: { countryCode: "CA", currencyCode: "CAD", unitPrice: 13.50 }
        }
      };
      return { ...prev, variants: [...prev.variants, newVariant] };
    });
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => {
      if (prev.variants.length <= 1) return prev;
      return { ...prev, variants: prev.variants.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCatObj = categories.find((c) => c.id === form.categoryId);
    const categoryName = selectedCatObj?.name || "General";
    const baseSku = form.sku.trim().toUpperCase();

    // Map wholesale weight variants into backend format
    const variantsPayload = form.variants.map((v, idx) => {
      const weightNum = parseFloat(v.weight) || (idx + 1);
      const unit = v.weightUnit || "kg";
      const name = v.label || `${weightNum}${unit}`;
      const suffix = v.skuSuffix ? v.skuSuffix.trim().toUpperCase() : `${weightNum}${unit.toUpperCase()}`;
      const variantSku = `${baseSku}-${suffix}`;

      const countryPrices = Object.values(v.prices).map((p) => ({
        countryCode: p.countryCode.toUpperCase(),
        currencyCode: p.currencyCode.toUpperCase(),
        unitPrice: parseFloat(p.unitPrice) || 0,
        moq: 1,
        stock: 5000,
        isAvailable: true,
        tiers: []
      }));

      return {
        name,
        sku: variantSku,
        weight: weightNum,
        weightUnit: unit,
        sortOrder: idx,
        attributes: { weight: weightNum, unit },
        isActive: v.isActive !== false,
        countryPrices
      };
    });

    const payload = {
      name: form.name.trim(),
      sku: baseSku,
      description: form.description?.trim() || null,
      category: categoryName,
      brand: form.brand?.trim() || "VANOM Wholesale",
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      type: "VARIABLE",
      isActive: form.isActive !== false,
      variants: variantsPayload
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? `Edit B2B Wholesale Product: ${initialData.name}`
          : "Create B2B Wholesale Product"
      }
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Section 1: Basic Specifications */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
            1. Wholesale Product Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Title"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Premium Rice / Organic Sugar"
              required
            />
            <Input
              label="Master SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. RICE-001"
              required
            />
            <Select
              label="Master Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              required
            />
            <Input
              label="Brand / Origin"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. VANOM Wholesale"
            />

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Product Description</span>
                </label>
              </div>
              <Suspense
                fallback={
                  <div className="h-[140px] rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-5 h-5 rounded-full border-2 border-[#358B5B]/30 border-t-[#358B5B] animate-spin" />
                    <span className="text-xs font-medium">Loading Editor...</span>
                  </div>
                }
              >
                <TiptapEditor
                  value={form.description || ""}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Enter detailed wholesale specifications, origin, purity..."
                  minHeight={140}
                />
              </Suspense>
            </div>

            {/* Product Image */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00875A]" />
                Product Image
              </label>
              {form.images && form.images[0] ? (
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={typeof form.images[0] === "string" ? form.images[0] : form.images[0]?.url}
                      alt="Product Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-white shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 block">Uploaded Product Image</span>
                      <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5 max-w-xs sm:max-w-md">
                        {typeof form.images[0] === "string" ? form.images[0] : form.images[0]?.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <FileUploadDropzone
                      folder="bulk-products"
                      compact={true}
                      onUploadSuccess={(url) => setForm((prev) => ({ ...prev, images: [url] }))}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, images: [] }))}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <FileUploadDropzone
                  folder="bulk-products"
                  multiple={false}
                  onUploadSuccess={(url) => setForm((prev) => ({ ...prev, images: [url] }))}
                  label="Click or drop wholesale product image"
                  hint="High-resolution image (JPG, PNG, WebP)"
                />
              )}

              <div className="pt-1">
                <input
                  type="url"
                  value={typeof form.images?.[0] === "string" ? form.images[0] : form.images?.[0]?.url || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value ? [e.target.value] : [] }))}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00875A] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dynamic Wholesale Weights & Country Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                2. Wholesale Weights & Country-Specific Pricing
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Configure independent prices per weight variant. USA in USD, Canada in CAD. No automatic currency conversions.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddVariant}
              className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 cursor-pointer font-bold"
            >
              Add Weight
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-border">
                <tr>
                  <th className="p-3">Weight Option</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">SKU Suffix</th>
                  <th className="p-3">
                    <span className="flex items-center gap-1">
                      <span>🇺🇸</span> USA Price (USD)
                    </span>
                  </th>
                  <th className="p-3">
                    <span className="flex items-center gap-1">
                      <span>🇨🇦</span> Canada Price (CAD)
                    </span>
                  </th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {form.variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Weight Input & Display Label */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={v.weight ?? ""}
                          onChange={(e) => handleVariantChange(idx, "weight", e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-border text-xs bg-surface font-mono font-bold focus:outline-none focus:border-[#00875A]"
                          required
                        />
                        <input
                          type="text"
                          value={v.label || ""}
                          onChange={(e) => handleVariantChange(idx, "label", e.target.value)}
                          placeholder="e.g. 500g"
                          className="w-20 px-2 py-1 rounded border border-border text-xs bg-surface text-slate-700 focus:outline-none focus:border-[#00875A]"
                        />
                      </div>
                    </td>

                    {/* Weight Unit */}
                    <td className="p-3">
                      <select
                        value={v.weightUnit || "kg"}
                        onChange={(e) => handleVariantChange(idx, "weightUnit", e.target.value)}
                        className="px-2 py-1 rounded border border-border text-xs bg-surface font-semibold focus:outline-none focus:border-[#00875A]"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </td>

                    {/* SKU Suffix */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-slate-400">{form.sku ? `${form.sku}-` : "SKU-"}</span>
                        <input
                          type="text"
                          value={v.skuSuffix || ""}
                          onChange={(e) => handleVariantChange(idx, "skuSuffix", e.target.value)}
                          placeholder="500G"
                          className="w-20 px-2 py-1 rounded border border-border text-xs bg-surface font-bold uppercase focus:outline-none focus:border-[#00875A]"
                        />
                      </div>
                    </td>

                    {/* USA Price ($) */}
                    <td className="p-3">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={v.prices?.US?.unitPrice ?? ""}
                          onChange={(e) => handlePriceChange(idx, "US", e.target.value)}
                          placeholder="4.50"
                          className="w-full pl-6 pr-2 py-1 rounded border border-border text-xs bg-surface font-mono font-bold focus:outline-none focus:border-[#00875A]"
                          required
                        />
                      </div>
                    </td>

                    {/* Canada Price (CA$) */}
                    <td className="p-3">
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[11px]">CA$</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={v.prices?.CA?.unitPrice ?? ""}
                          onChange={(e) => handlePriceChange(idx, "CA", e.target.value)}
                          placeholder="6.00"
                          className="w-full pl-8 pr-2 py-1 rounded border border-border text-xs bg-surface font-mono font-bold focus:outline-none focus:border-[#00875A]"
                          required
                        />
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleVariantChange(idx, "isActive", !v.isActive)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          v.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-slate-100 text-slate-500 border border-slate-300"
                        }`}
                      >
                        {v.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove Weight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            className="font-bold cursor-pointer"
          >
            {initialData ? "Save Changes" : "Create Wholesale Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
