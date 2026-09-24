import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { Trash2 } from "lucide-react";

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

        {/* Category Image Upload & URL */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Category Image</label>

          {formData.imageUrl ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={formData.imageUrl}
                  alt="Category Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-white shadow-2xs"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 block">Uploaded Category Photo</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5 max-w-[280px] sm:max-w-xs">
                    {formData.imageUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <FileUploadDropzone
                  folder="categories"
                  compact={true}
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <FileUploadDropzone
              folder="categories"
              multiple={false}
              onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Click or drop category cover photo"
              hint="High-res PNG, JPG or WebP (square 600x600 recommended)"
            />
          )}

          <div className="pt-1">
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Or paste direct image URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B] focus:bg-white"
            />
          </div>
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

export default CategoryFormModal;
