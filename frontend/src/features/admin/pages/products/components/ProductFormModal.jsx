import React from "react";
import { Plus, Trash2 } from "lucide-react";
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
            <Input
              label="Stock Quantity"
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
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

        {/* Badges & Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            3. Badges & Tags
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
              4. Custom Product Attributes & Specs
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
