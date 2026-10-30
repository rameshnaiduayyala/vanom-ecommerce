import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { Trash2, Megaphone, ArrowLeft, ArrowRight, Plus, Images } from "lucide-react";

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
    categoryBannerImages: [],
    categoryBannerImage: "",
    parentId: "",
    active: true,
    showOnHome: false,
    sortOrder: 0,
  };

  const [formData, setFormData] = useState(defaultCategoryForm);
  const [newBannerUrl, setNewBannerUrl] = useState("");

  useEffect(() => {
    if (editingCategory) {
      let banners = [];
      if (Array.isArray(editingCategory.categoryBannerImages) && editingCategory.categoryBannerImages.length > 0) {
        banners = editingCategory.categoryBannerImages.filter(Boolean);
      } else if (editingCategory.categoryBannerImage) {
        const raw = String(editingCategory.categoryBannerImage).trim();
        if (raw.startsWith("[") && raw.endsWith("]")) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) banners = parsed.filter(Boolean);
          } catch {
            banners = [raw];
          }
        } else if (raw) {
          banners = [raw];
        }
      }

      setFormData({
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
        description: editingCategory.description || "",
        imageUrl: editingCategory.imageUrl || "",
        categoryBannerImages: banners,
        categoryBannerImage: banners[0] || "",
        parentId: editingCategory.parentId || "",
        active: editingCategory.active !== undefined ? editingCategory.active : true,
        showOnHome: editingCategory.showOnHome !== undefined ? Boolean(editingCategory.showOnHome) : false,
        sortOrder: editingCategory.sortOrder || 0,
      });
      setNewBannerUrl("");
    } else {
      setFormData(defaultCategoryForm);
      setNewBannerUrl("");
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

  // Banner list handlers
  const handleAddBannerUrls = (urls) => {
    const list = Array.isArray(urls) ? urls : [urls];
    const clean = list.map((u) => String(u).trim()).filter(Boolean);
    if (clean.length === 0) return;

    setFormData((prev) => {
      const updated = [...prev.categoryBannerImages, ...clean];
      return {
        ...prev,
        categoryBannerImages: updated,
        categoryBannerImage: updated[0] || "",
      };
    });
  };

  const handleRemoveBanner = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.categoryBannerImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        categoryBannerImages: updated,
        categoryBannerImage: updated[0] || "",
      };
    });
  };

  const handleMoveBanner = (index, direction) => {
    setFormData((prev) => {
      const list = [...prev.categoryBannerImages];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return {
        ...prev,
        categoryBannerImages: list,
        categoryBannerImage: list[0] || "",
      };
    });
  };

  const handleAddCustomUrl = (e) => {
    e?.preventDefault();
    if (!newBannerUrl.trim()) return;
    handleAddBannerUrls(newBannerUrl.trim());
    setNewBannerUrl("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalBanners = (formData.categoryBannerImages || []).filter(Boolean);
    const serializedBanner =
      finalBanners.length > 0
        ? finalBanners.length === 1
          ? finalBanners[0]
          : JSON.stringify(finalBanners)
        : null;

    onSubmit({
      ...formData,
      parentId: formData.parentId || null,
      sortOrder: Number(formData.sortOrder) || 0,
      categoryBannerImages: finalBanners,
      categoryBannerImage: serializedBanner,
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
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Spices & Pulses"
            required
          />

          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g. spices-pulses"
            required
          />
        </div>

        <Select
          label="Parent Category"
          value={formData.parentId}
          onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          options={parentOptions}
        />

        {/* ── Category Icon / Thumbnail ── */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-xs font-bold text-slate-700">Category Icon / Thumbnail</label>
          {formData.imageUrl ? (
            <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg">
              <img
                src={formData.imageUrl}
                alt="Category thumbnail"
                className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-slate-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 truncate">{formData.imageUrl}</p>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Remove Icon
                </button>
              </div>
            </div>
          ) : (
            <FileUploadDropzone
              folder="categories"
              multiple={false}
              onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Upload Category Icon"
              hint="Square SVG, PNG, or WebP (e.g. 128x128)"
            />
          )}
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="Or paste image URL (https://...)"
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B]"
          />
        </div>

        {/* ── Category Promotion Banners (Multiple Images with Auto-scroll) ── */}
        <div className="space-y-2 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#0F472B]">
              <Megaphone className="w-3.5 h-3.5 text-[#358B5B]" />
              <span>Category Advertisement Banners (Auto-Scroll Carousel)</span>
            </label>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Images className="w-3 h-3" />
              <span>{formData.categoryBannerImages.length} {formData.categoryBannerImages.length === 1 ? "Slide" : "Slides"}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Upload multiple banner images. If 2 or more banners are added, they will automatically scroll on the home page showcase. Recommended: <strong>1440x360 or 1200x300</strong> (4:1 / 21:9 landscape).
          </p>

          {/* List of current banner slides */}
          {formData.categoryBannerImages.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {formData.categoryBannerImages.map((bannerUrl, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-emerald-200/90 rounded-xl p-2 flex flex-col gap-1.5 shadow-2xs group"
                  >
                    <div className="relative aspect-[3.5/1] w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                      <img
                        src={bannerUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                        Slide {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={bannerUrl}>
                        {bannerUrl}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveBanner(idx, -1)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move Left (Show earlier)"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formData.categoryBannerImages.length - 1}
                          onClick={() => handleMoveBanner(idx, 1)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Move Right (Show later)"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBanner(idx)}
                          className="p-1 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer ml-0.5"
                          title="Remove this slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-800 font-medium">
                  {formData.categoryBannerImages.length > 1
                    ? `✨ ${formData.categoryBannerImages.length} slides configured — auto-scrolling is enabled.`
                    : "Add more slides to enable auto-scrolling."}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, categoryBannerImages: [], categoryBannerImage: "" }))}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear All Banners
                </button>
              </div>
            </div>
          )}

          {/* Add more banners upload dropzone */}
          <div className="pt-1 space-y-2">
            <FileUploadDropzone
              folder="categories/banners"
              multiple={true}
              onUploadSuccess={handleAddBannerUrls}
              label={
                formData.categoryBannerImages.length > 0
                  ? "Upload Additional Banner Slides"
                  : "Upload Banner Artworks (Select 1 or more files)"
              }
              hint="Select multiple images at once (WebP / JPG / PNG)"
            />

            <div className="flex gap-2">
              <input
                type="url"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomUrl();
                  }
                }}
                placeholder="Or paste image URL (https://assets...) and click Add"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#358B5B]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddCustomUrl}
                disabled={!newBannerUrl.trim()}
                className="text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add URL
              </Button>
            </div>
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
