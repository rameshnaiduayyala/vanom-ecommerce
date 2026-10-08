import React from "react";
import { Plus, Trash2, Package, Scale } from "lucide-react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea, Select } from "@/components/ui/Input.jsx";

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  productForm,
  setProductForm,
  categories = [],
  warehouses = [],
  onSubmit,
  isSubmitting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Enterprise Product"}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={onSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Basic Product Attributes */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            1. Basic Product Attributes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Title"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="e.g. Royal Kashmiri Saffron Grade-A"
              required
            />
            <Input
              label="SKU Code"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              placeholder="e.g. VAN-SAF-01"
            />
            <Select
              label="Category"
              value={productForm.categoryId}
              onChange={(e) => {
                const sel = categories.find((c) => c.id === e.target.value);
                setProductForm({
                  ...productForm,
                  categoryId: e.target.value,
                  category: sel ? sel.name : productForm.category,
                });
              }}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Select
              label="Target Fulfillment Warehouse"
              value={productForm.warehouseId || ""}
              onChange={(e) => setProductForm({ ...productForm, warehouseId: e.target.value })}
              options={
                warehouses.length > 0
                  ? warehouses.map((w) => ({
                      label: `${w.name} (${w.code})${w.isDefault ? " — Default Hub" : ""}`,
                      value: w.id,
                    }))
                  : [{ label: "Default Warehouse (Auto)", value: "" }]
              }
            />
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={productForm.stock ?? ""}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              placeholder="100"
            />
            <div className="md:col-span-2">
              <Input
                label="Product Image URL"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Provide product details, specifications, or packaging info..."
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing & Regional Tiers */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            2. Multi-Currency Pricing
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
              <span className="text-xs font-bold text-emerald-900 block">🇺🇸 USA Price ($ USD) *</span>
              <Input
                type="number"
                step="0.01"
                value={productForm.priceUS || productForm.pricing?.US?.retailPrice || ""}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    priceUS: e.target.value,
                    pricing: {
                      ...productForm.pricing,
                      US: { ...productForm.pricing?.US, retailPrice: parseFloat(e.target.value) || 0 },
                    },
                  })
                }
                placeholder="34.99"
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-2">
              <span className="text-xs font-bold text-blue-900 block">🇨🇦 Canada Price (CA$ CAD)</span>
              <Input
                type="number"
                step="0.01"
                value={productForm.priceCA || productForm.pricing?.CA?.retailPrice || ""}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    priceCA: e.target.value,
                    pricing: {
                      ...productForm.pricing,
                      CA: { ...productForm.pricing?.CA, retailPrice: parseFloat(e.target.value) || 0 },
                    },
                  })
                }
                placeholder="46.99"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">Old Price / Strike ($)</span>
              <Input
                type="number"
                step="0.01"
                value={productForm.oldPrice || productForm.pricing?.US?.oldPrice || ""}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    oldPrice: e.target.value,
                  })
                }
                placeholder="49.99"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Parcel Dimensions for Shippo */}
        <div className="space-y-4">
          <div className="border-b border-border pb-1 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-brand-600" />
              <span>3. Shipping & Parcel Dimensions (Shippo Live Rates)</span>
            </h4>
            <span className="text-[11px] text-text-muted">Exact specs or auto-fallback</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <div className="p-0.5 px-1.5 rounded-md bg-amber-200/80 text-amber-900 font-bold shrink-0 text-[10px]">NOTICE</div>
            <p className="leading-relaxed">
              Shippo uses these exact parcel dimensions to fetch live USPS, UPS, & FedEx rates at checkout. If left blank, Shippo automatically falls back to standard product defaults (<strong>1.0 lb</strong>, <strong>10" × 8" × 4"</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <div className="sm:col-span-2 md:col-span-2">
              <Input
                label="Weight"
                type="number"
                step="0.01"
                min="0"
                value={productForm.weight ?? ""}
                onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                placeholder="1.00 (Default: 1.0)"
              />
            </div>
            <div className="sm:col-span-1 md:col-span-1">
              <Select
                label="Weight Unit"
                value={productForm.weightUnit || "lb"}
                onChange={(e) => setProductForm({ ...productForm, weightUnit: e.target.value })}
                options={[
                  { label: "Pounds (lb)", value: "lb" },
                  { label: "Ounces (oz)", value: "oz" },
                  { label: "Kilograms (kg)", value: "kg" },
                  { label: "Grams (g)", value: "g" },
                ]}
              />
            </div>
            <div className="sm:col-span-1 md:col-span-1">
              <Input
                label="Length"
                type="number"
                step="0.1"
                min="0"
                value={productForm.length ?? ""}
                onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                placeholder="10.0"
              />
            </div>
            <div className="sm:col-span-1 md:col-span-1">
              <Input
                label="Width"
                type="number"
                step="0.1"
                min="0"
                value={productForm.width ?? ""}
                onChange={(e) => setProductForm({ ...productForm, width: e.target.value })}
                placeholder="8.0"
              />
            </div>
            <div className="sm:col-span-1 md:col-span-1">
              <Input
                label="Height"
                type="number"
                step="0.1"
                min="0"
                value={productForm.height ?? ""}
                onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                placeholder="4.0"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
            <span>Dimensions Unit: <strong>{(productForm.dimensionUnit || "in") === "in" ? "Inches (in)" : "Centimeters (cm)"}</strong></span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="modalDimensionUnit"
                  value="in"
                  checked={(productForm.dimensionUnit || "in") === "in"}
                  onChange={() => setProductForm({ ...productForm, dimensionUnit: "in" })}
                  className="accent-brand-600 w-3.5 h-3.5"
                />
                <span>Inches (in)</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="modalDimensionUnit"
                  value="cm"
                  checked={productForm.dimensionUnit === "cm"}
                  onChange={() => setProductForm({ ...productForm, dimensionUnit: "cm" })}
                  className="accent-brand-600 w-3.5 h-3.5"
                />
                <span>Centimeters (cm)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Badges & Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            4. Badges & Tags
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(productForm.isBestSeller)}
                onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                className="accent-[#358B5B] w-4 h-4 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Bestseller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(productForm.isNewProduct)}
                onChange={(e) => setProductForm({ ...productForm, isNewProduct: e.target.checked })}
                className="accent-[#358B5B] w-4 h-4 rounded"
              />
              <span className="text-xs font-bold text-slate-800">New Product</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(productForm.isFeatured)}
                onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                className="accent-[#358B5B] w-4 h-4 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Featured</span>
            </label>
          </div>
        </div>

        {/* Dynamic Custom Product Attributes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700">
              5. Custom Product Attributes & Specs
            </h4>
            <button
              type="button"
              onClick={() =>
                setProductForm({
                  ...productForm,
                  attributes: [...(productForm.attributes || []), { name: "", value: "" }],
                })
              }
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Attribute</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(productForm.attributes || []).map((attr, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Attribute Name (e.g. Organic Grade, Purity)"
                    value={attr.name}
                    onChange={(e) => {
                      const updated = [...productForm.attributes];
                      updated[index].name = e.target.value;
                      setProductForm({ ...productForm, attributes: updated });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Attribute Value (e.g. 100% Certified, 99.8%)"
                    value={attr.value}
                    onChange={(e) => {
                      const updated = [...productForm.attributes];
                      updated[index].value = e.target.value;
                      setProductForm({ ...productForm, attributes: updated });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = productForm.attributes.filter((_, i) => i !== index);
                    setProductForm({ ...productForm, attributes: updated });
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Attribute"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!productForm.attributes || productForm.attributes.length === 0) && (
              <p className="text-xs text-text-muted italic py-1">
                No custom attributes added yet. Click "+ Add Attribute" to define custom specs.
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="font-bold"
          >
            {editingProduct ? "Save Product Changes" : "Publish Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductFormModal;
