import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone.jsx";
import { ProductSearchableDropdown } from "@/components/common/ProductSearchableDropdown.jsx";
import {
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function HeroBannerFormModal({
  isOpen,
  onClose,
  editingSlide,
  slideIndex,
  onSave,
  categories = [],
  products = [],
}) {
  const [formData, setFormData] = useState({
    image: "",
    linkType: "custom", // "category" | "product" | "custom"
    selectedCategoryId: "",
    selectedProductId: "",
    ctaLink: "",
  });

  useEffect(() => {
    if (editingSlide) {
      let lType = "custom";
      let catId = "";
      let prodId = "";

      const link = editingSlide.ctaLink || "";
      if (link.includes("category=")) {
        lType = "category";
        const parts = link.split("category=");
        const slug = parts[1]?.split("&")[0];
        const match = categories.find((c) => c.slug === slug || c.id === slug);
        if (match) catId = match.id;
      } else if (link.startsWith("/products/") && !link.includes("?")) {
        lType = "product";
        const slug = link.replace("/products/", "");
        const match = products.find((p) => p.slug === slug || p.id === slug);
        if (match) prodId = match.id;
      }

      setFormData({
        image: editingSlide.image || "",
        linkType: editingSlide.linkType || lType,
        selectedCategoryId: editingSlide.selectedCategoryId || catId,
        selectedProductId: editingSlide.selectedProductId || prodId,
        ctaLink: editingSlide.ctaLink || "",
      });
    } else {
      setFormData({
        image: "",
        linkType: "custom",
        selectedCategoryId: "",
        selectedProductId: "",
        ctaLink: "/products",
      });
    }
  }, [editingSlide, isOpen, categories, products]);

  const handleLinkTypeChange = (type) => {
    let newCtaLink = formData.ctaLink;
    let newCatId = formData.selectedCategoryId;
    let newProdId = formData.selectedProductId;

    if (type === "category") {
      const firstCat = categories[0];
      if (firstCat) {
        newCatId = firstCat.id;
        newCtaLink = `${ROUTES.PRODUCTS || "/products"}?category=${firstCat.slug}`;
      }
    } else if (type === "product") {
      const firstProd = products[0];
      if (firstProd) {
        newProdId = firstProd.id;
        newCtaLink = `/products/${firstProd.slug}`;
      }
    } else {
      newCtaLink = ROUTES.PRODUCTS || "/products";
    }

    setFormData((prev) => ({
      ...prev,
      linkType: type,
      selectedCategoryId: newCatId,
      selectedProductId: newProdId,
      ctaLink: newCtaLink,
    }));
  };

  const handleCategorySelect = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    const slug = cat ? cat.slug : categoryId;
    setFormData((prev) => ({
      ...prev,
      selectedCategoryId: categoryId,
      ctaLink: `${ROUTES.PRODUCTS || "/products"}?category=${slug}`,
    }));
  };

  const handleProductSelect = (productId, selectedProduct) => {
    const slug = selectedProduct?.slug || selectedProduct?.raw?.slug || products.find((p) => p.id === productId)?.slug || productId;
    setFormData((prev) => ({
      ...prev,
      selectedProductId: productId,
      ctaLink: slug ? `/products/${slug}` : "/products",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      alert("Please upload or provide an image for the hero banner.");
      return;
    }

    onSave({
      id: editingSlide?.id || `slide-${Date.now()}`,
      image: formData.image.trim(),
      ctaLink: (formData.ctaLink || "").trim() || "/products",
      linkType: formData.linkType,
      selectedCategoryId: formData.selectedCategoryId,
      selectedProductId: formData.selectedProductId,
    }, slideIndex);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSlide ? "Edit Hero Banner Slide" : "Add New Hero Banner Slide"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {/* ── Banner Image Upload ── */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Banner Artwork Image <span className="text-red-500">*</span></span>
          </label>

          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              <span className="font-bold">Recommended:</span> 1920×600px or 1400×450px (wide landscape). Use same dimensions for all slides to avoid layout shifts.
            </p>
          </div>

          {formData.image ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
              <img
                src={formData.image}
                alt="Banner preview"
                className="w-full h-48 object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="rounded-full shadow-lg"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Replace Artwork
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FileUploadDropzone
                folder="banners"
                label="Upload Banner Artwork"
                hint="JPG, PNG, WebP — Recommended: 1920×600px or 1400×450px"
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              />
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL (e.g. https://...)"
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Link & Destination Settings (Product vs Category vs Custom) ── */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0B4627] flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-[#00875A]" />
              <span>Click Destination (When Customer Clicks Banner)</span>
            </label>
            <span className="text-[11px] font-semibold text-emerald-700">
              Go to Product or Category
            </span>
          </div>

          {/* Destination Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleLinkTypeChange("product")}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                formData.linkType === "product"
                  ? "bg-[#00875A] text-white border-[#00875A] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Link to Product</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkTypeChange("category")}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                formData.linkType === "category"
                  ? "bg-[#00875A] text-white border-[#00875A] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Link to Category</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkTypeChange("custom")}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                formData.linkType === "custom"
                  ? "bg-[#00875A] text-white border-[#00875A] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Custom URL</span>
            </button>
          </div>

          {/* Searchable Dropdown for Product */}
          {formData.linkType === "product" && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Select Target Product</span>
              <ProductSearchableDropdown
                value={formData.selectedProductId}
                onChange={(productId, product) => handleProductSelect(productId, product)}
                products={products}
                showImage={true}
                showPrice={true}
                showStock={false}
                placeholder="Search by product name, SKU..."
              />
            </div>
          )}

          {/* Conditional Dropdown for Category */}
          {formData.linkType === "category" && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Select Target Category</span>
              <select
                value={formData.selectedCategoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-emerald-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00875A] cursor-pointer"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (/{c.slug})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Custom Link or Computed URL Display */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Destination Route URL</span>
            <input
              type="text"
              value={formData.ctaLink}
              onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
              placeholder="/products or /products?category=..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-600 focus:outline-none focus:border-[#00875A]"
            />
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#00875A] hover:bg-[#00744D] text-white font-bold"
          >
            {editingSlide ? "Update Banner Slide" : "Add Banner Slide"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default HeroBannerFormModal;
