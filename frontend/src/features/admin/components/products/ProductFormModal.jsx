import React from "react";
import { Modal } from "../../../../components/ui/Modal.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { Input, Textarea, Select } from "../../../../components/ui/Input.jsx";
import { ProductTierPricingForm } from "./ProductTierPricingForm.jsx";

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  categories = [],
  onSubmit,
  isPending = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Enterprise Product"}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={onSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* General Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            1. Basic Product Attributes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Title"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Heritage Aged Basmati Rice (25 KG Sack)"
              required
            />
            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. FMCG-RICE-25KG"
              required
            />
            <Select
              label="Category Taxonomy"
              value={formData.categoryId}
              onChange={(e) => {
                const sel = categories.find((c) => c.id === e.target.value);
                setFormData({
                  ...formData,
                  categoryId: e.target.value,
                  category: sel ? sel.name : formData.category,
                });
              }}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Input
              label="Brand / Manufacturer"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Vanom Pantry"
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Product Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Description & Specifications"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed commercial and retail specifications..."
                rows={2}
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing & Regional Tiers */}
        <ProductTierPricingForm
          pricing={formData.pricing}
          onChange={(newPricing) => setFormData({ ...formData, pricing: newPricing })}
        />

        {/* Logistics & Pallet Specifications */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
            3. Packaging & Pallet Specifications
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Unit Packaging"
              value={formData.packaging.unitName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  packaging: { ...formData.packaging, unitName: e.target.value },
                })
              }
              placeholder="e.g. Sack (25 KG)"
              required
            />
            <Input
              label="Unit Weight (KG)"
              type="number"
              value={formData.packaging.weightKg}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  packaging: { ...formData.packaging, weightKg: parseFloat(e.target.value) || 0 },
                })
              }
              required
            />
            <Input
              label="Pallet Capacity (Units)"
              type="number"
              value={formData.packaging.palletQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  packaging: { ...formData.packaging, palletQuantity: parseInt(e.target.value, 10) || 1 },
                })
              }
              required
            />
            <Input
              label="Initial Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
              required
            />
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
            isLoading={isPending}
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
