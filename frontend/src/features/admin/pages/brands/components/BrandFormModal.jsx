import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { Trash2 } from "lucide-react";

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

        {/* Brand Logo Upload & URL */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Brand Logo</label>

          {formData.imageUrl ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={formData.imageUrl}
                  alt="Brand Logo Preview"
                  className="w-12 h-12 rounded-lg object-contain border border-slate-200 shrink-0 bg-white p-1 shadow-2xs"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 block">Uploaded Brand Logo</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5 max-w-[200px] sm:max-w-xs">
                    {formData.imageUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <FileUploadDropzone
                  folder="brands"
                  compact={true}
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <FileUploadDropzone
              folder="brands"
              multiple={false}
              onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Click or drop brand logo photo"
              hint="PNG or SVG with transparent background recommended"
            />
          )}

          <div className="pt-1">
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="Or paste direct image URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B] focus:bg-white"
            />
          </div>
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

export default BrandFormModal;
