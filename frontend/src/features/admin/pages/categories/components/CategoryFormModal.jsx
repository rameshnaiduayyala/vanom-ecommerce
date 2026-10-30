import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { Trash2, Megaphone } from "lucide-react";

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
    categoryBannerImage: "",
    parentId: "",
    active: true,
    showOnHome: false,
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
        categoryBannerImage: editingCategory.categoryBannerImage || "",
        parentId: editingCategory.parentId || "",
        active: editingCategory.active !== undefined ? editingCategory.active : true,
        showOnHome: editingCategory.showOnHome !== undefined ? Boolean(editingCategory.showOnHome) : false,
        sortOrder: editingCategory.sortOrder || 0,
      });
    } else {
      setFormData(defaultCategoryForm);
    }
  }, [editingCategory, isOpen]);

  const handleNameChange = (val) => {
    if (!editingCategory?.id) {
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
      ...formData,
      parentId: formData.parentId || null,
      sortOrder: Number(formData.sortOrder) || 0,
      categoryBannerImage: formData.categoryBannerImage || null,
    });
  };

  const parentOptions = [
    { value: "", label: "None (Root Main Category)" },
    ...categories
      .filter((c) => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingCategory?.id
          ? `Edit Category: ${editingCategory.name}`
          : editingCategory?.parentId
          ? "Create Subcategory"
          : "Create Category"
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Category Name *"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Spices & Masalas"
            required
          />
          <Input
            label="URL Slug *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. spices-masalas"
            required
          />
        </div>

        <Select
          label="Parent Category"
          value={formData.parentId}
          onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          options={parentOptions}
        />

        {/* ── Category Icon / Cover Image ── */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Category Icon / Thumbnail
          </label>

          {formData.imageUrl ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={formData.imageUrl}
                  alt="Category Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white shrink-0 shadow-2xs"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800">Thumbnail Set</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
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
              label="Click or drop category thumbnail"
              hint="High-res PNG, JPG or WebP (square recommended)"
            />
          )}

          <div className="pt-0.5">
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Or paste direct image URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B] focus:bg-white"
            />
          </div>
        </div>

        {/* ── Category Advertisement / Promo Banner ── */}
        <div className="space-y-1.5 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#0F472B]">
              <Megaphone className="w-3.5 h-3.5 text-[#358B5B]" />
              <span>Category Advertisement Banner (Home Showcase)</span>
            </label>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Full Width Artwork
            </span>
          </div>

          {formData.categoryBannerImage ? (
            <div className="space-y-2 p-3 bg-white border border-emerald-200 rounded-xl">
              <div className="relative w-full aspect-[21/9] sm:aspect-[4/1] max-h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formData.categoryBannerImage}
                  alt="Category Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[260px]">
                  {formData.categoryBannerImage}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, categoryBannerImage: "" }))}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Banner</span>
                </button>
              </div>
            </div>
          ) : (
            <FileUploadDropzone
              folder="categories/banners"
              multiple={false}
              onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, categoryBannerImage: url }))}
              label="Upload Promotion / Advertisement Artwork Banner"
              hint="Landscape WebP / PNG / JPG (e.g. 1440x360 or 1200x300 recommended)"
            />
          )}

          <div className="pt-0.5">
            <input
              type="url"
              value={formData.categoryBannerImage}
              onChange={(e) => setFormData({ ...formData, categoryBannerImage: e.target.value })}
              placeholder="Or paste direct banner URL (https://assets...)"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B]"
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
            min="0"
            value={formData.sortOrder ?? ""}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            placeholder="0"
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
            <Checkbox
              label="Active & Visible"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <Checkbox
              label="Show on Home Page"
              checked={formData.showOnHome}
              onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
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
            {editingCategory?.id ? "Save Category Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
