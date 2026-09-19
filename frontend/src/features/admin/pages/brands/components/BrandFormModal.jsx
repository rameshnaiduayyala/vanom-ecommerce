import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function BrandFormModal({
  isOpen,
  onClose,
  editingBrand,
  onSubmit,
  isPending,
}) {
  const defaultBrandForm = {
    name: "",
    slug: "",
    imageUrl: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultBrandForm);

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        name: editingBrand.name || "",
        slug: editingBrand.slug || "",
        imageUrl: editingBrand.imageUrl || "",
        isActive: editingBrand.isActive !== undefined ? editingBrand.isActive : true,
      });
    } else {
      setFormData(defaultBrandForm);
    }
  }, [editingBrand, isOpen]);

  const handleNameChange = (val) => {
    if (!editingBrand) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        name: val,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || null,
      isActive: Boolean(formData.isActive),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Brand Name *"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Bosch, Makita, DeWalt"
          required
        />

        <Input
          label="URL Slug *"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="e.g. bosch-power-tools"
          helperText="Unique identifier for storefront filtering and SEO"
          required
        />

        <div>
          <Input
            label="Brand Logo / Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            helperText="Direct logo URL for storefront brand filters & showcase"
          />
          {formData.imageUrl && (
            <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-surface-muted rounded-xl border border-border">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-contain border border-border shrink-0 bg-white p-1"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="text-xs text-text-secondary truncate">
                <span className="font-semibold block text-text-primary">Logo Preview</span>
                <span className="text-[10px] text-text-muted truncate block">{formData.imageUrl}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Checkbox
            label="Active & Visible in Catalog Filter"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            className="font-bold text-xs bg-[#00875A] hover:bg-[#00734D] text-white"
          >
            {editingBrand ? "Save Brand Changes" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
