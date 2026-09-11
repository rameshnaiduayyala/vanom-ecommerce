import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function CategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  onSubmit,
  isPending,
  categories = [],
}) {
  const defaultCategoryForm = {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    parentId: "",
    active: true,
    sortOrder: 0,
  };

  const [formData, setFormData] = useState(defaultCategoryForm);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
        description: editingCategory.description || "",
        imageUrl: editingCategory.imageUrl || "",
        parentId: editingCategory.parentId || "",
        active: editingCategory.active !== undefined ? editingCategory.active : true,
        sortOrder: editingCategory.sortOrder || 0,
      });
    } else {
      setFormData(defaultCategoryForm);
    }
  }, [editingCategory, isOpen]);

  const handleNameChange = (val) => {
    if (!editingCategory) {
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
      description: formData.description?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
      parentId: formData.parentId || undefined,
      active: Boolean(formData.active),
      sortOrder: Number(formData.sortOrder) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category Taxonomy"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Industrial Automation & Machinery"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. industrial-automation"
            helperText="Auto-generated from name or custom"
            required
          />

          <Select
            label="Parent Category (Optional)"
            value={formData.parentId || ""}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            options={[
              { label: "None (Root Category)", value: "" },
              ...categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
        </div>

        <div>
          <Input
            label="Category Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            helperText="Direct image URL for storefront display"
          />
          {formData.imageUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-surface-muted rounded-xl border border-border">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover border border-border shrink-0 bg-white"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="text-xs text-text-secondary truncate">
                <span className="font-semibold block text-text-primary">Image Preview</span>
                <span className="text-[10px] text-text-muted truncate block">{formData.imageUrl}</span>
              </div>
            </div>
          )}
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Commercial scope and product specifications for this category..."
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          <div className="flex items-center pt-6">
            <Checkbox
              label="Active & Visible in Storefront"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            className="font-bold"
          >
            {editingCategory ? "Save Category Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
