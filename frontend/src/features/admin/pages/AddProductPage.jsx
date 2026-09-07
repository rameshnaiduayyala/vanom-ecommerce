import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { BRAND_COLORS } from "../../../constants/colors.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  ArrowLeft,
  UploadCloud,
  X,
  Plus,
  HelpCircle,
  Lightbulb,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Code,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Categories & Brands Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  // Form State
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    shortDescription: "",
    detailedDescription: "",

    // Product Status & Visibility
    status: "PUBLISH", // "DRAFT" | "PUBLISH"
    showOnWebsite: true,
    includeInSearch: true,
    isFeatured: false,
    tags: "",

    // Images
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
        isMain: true,
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
        isMain: false,
      },
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80",
        isMain: false,
      },
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80",
        isMain: false,
      },
    ],

    // Shipping
    weightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    isDigital: false,

    // Additional Options
    allowCustomerReviews: true,
    showStockAvailability: true,
    isPreorder: false,
    isNonReturnable: false,

    // Pricing & Inventory
    price: "",
    comparePrice: "",
    costPrice: "",
    sku: "",
    barcode: "",
    stockQuantity: "",
    lowStockAlert: "5",

    // Category & Brand
    categoryId: "",
    subCategoryId: "",
    brandId: "Vanom Commercial",

    // Variants
    hasVariants: false,

    // SEO
    pageTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => Api.admin.createProduct(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["home-products"]);
      toast.success("Product Created", `${formData.name || "Product"} published successfully.`);
      navigate(ROUTES.ADMIN.PRODUCTS);
    },
    onError: (err) => {
      toast.error("Creation Failed", err.message || "Failed to save product.");
    },
  });

  const handleSave = (publishMode) => {
    if (!formData.name) {
      toast.error("Missing Field", "Please enter a product title.");
      return;
    }

    const payload = {
      name: formData.name,
      sku: formData.sku || `VAN-${Date.now().toString().slice(-6)}`,
      category: categories.find((c) => c.id === formData.categoryId)?.name || "General Catalog",
      categoryId: formData.categoryId || (categories[0]?.id || "cat-1"),
      brand: formData.brandId,
      image: formData.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      description: formData.detailedDescription || formData.shortDescription,
      stock: Number(formData.stockQuantity) || 100,
      isFeatured: formData.isFeatured,
      isBestSeller: false,
      status: publishMode === "PUBLISH" ? "ACTIVE" : "DRAFT",
      pricing: {
        retailPrice: Number(formData.price) || 0,
        wholesalePrice: Number(formData.costPrice) || Number(formData.price) * 0.8 || 0,
      },
    };

    createMutation.mutate(payload);
  };

  const removeImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const setMainImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isMain: img.id === id,
      })),
    }));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-24 space-y-6">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to={ROUTES.ADMIN.PRODUCTS} className="hover:text-slate-800 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Add Product</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.ADMIN.PRODUCTS)}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Add Product</h1>
              <p className="text-xs text-slate-500">
                Add a new product to your store. Fill in the details below and publish when ready.
              </p>
            </div>
          </div>
        </div>

        <Link
          to={ROUTES.HOME}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View Store</span>
        </Link>
      </div>

      {/* ── Main Layout Grid (2 Columns: Left 65%, Right 35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (8 cols)                                      */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900">Basic Information</h3>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:ring-1 focus:ring-[#006B3C] transition-all placeholder:text-slate-400"
                maxLength={300}
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.name.length}/300
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Enter short description (will be visible on product listing)"
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:ring-1 focus:ring-[#006B3C] transition-all placeholder:text-slate-400 resize-y"
                maxLength={300}
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.shortDescription.length}/300
              </div>
            </div>

            {/* Detailed Description with Rich Text Toolbar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Detailed Description <span className="text-rose-500">*</span>
              </label>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-600">
                  <select className="text-xs bg-transparent border-r border-slate-200 pr-2 py-0.5 font-medium outline-none cursor-pointer">
                    <option>Paragraph</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>

                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-4 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-4 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-slate-200/70 rounded cursor-pointer">
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  placeholder="Enter detailed product description..."
                  rows={5}
                  className="w-full p-3.5 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400"
                  maxLength={5000}
                />
              </div>
              <div className="text-right text-[10px] text-slate-400">
                {formData.detailedDescription.length}/5000
              </div>
            </div>
          </div>

          {/* Card 2: Product Images */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Product Images</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload high-quality images of your product. First image will be used as the main image.
              </p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-[#006B3C] rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <UploadCloud className="w-9 h-9 text-[#006B3C] mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Drag & drop images here or click to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WebP (Max 5MB each)</p>

              <button
                type="button"
                className="mt-3 px-4 py-1.5 rounded-lg border border-[#006B3C] text-[#006B3C] hover:bg-[#006B3C] hover:text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Upload Images</span>
              </button>
            </div>

            {/* Uploaded Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {formData.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />

                  {/* Main Badge */}
                  {img.isMain && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#003D2B] text-white text-[10px] font-bold shadow-xs">
                      Main
                    </span>
                  )}

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-slate-700 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Set as main overlay */}
                  {!img.isMain && (
                    <button
                      type="button"
                      onClick={() => setMainImage(img.id)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                    >
                      Set as Main
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Pricing & Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Price ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Compare Price ($)</label>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Cost Price ($)</label>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Enter SKU (e.g. VAN-TS-001)"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Barcode (ISBN / EAN)
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <label className="block text-xs font-bold text-slate-700">Low Stock Alert</label>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={formData.lowStockAlert}
                  onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                  placeholder="5"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Category & Attributes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Category & Attributes</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] cursor-pointer"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Sub Category</label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] cursor-pointer"
                >
                  <option value="">Select sub category</option>
                  <option value="sub-1">General Department</option>
                  <option value="sub-2">Industrial Grade</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Brand</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] cursor-pointer"
                >
                  <option value="Vanom Commercial">Vanom Commercial</option>
                  <option value="Vanom Direct">Vanom Direct</option>
                  <option value="Global Brand">Global Partner Brand</option>
                </select>
              </div>
            </div>

            {/* Attributes Button */}
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#006B3C] text-slate-700 hover:text-[#006B3C] text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute</span>
              </button>
              <span className="text-[11px] text-slate-400 ml-3">
                Add product attributes like size, color, material etc.
              </span>
            </div>
          </div>

          {/* Card 5: Variants (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Variants (Optional)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add variants if this product has multiple options (e.g., size, color).
              </p>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="hasVariants"
                  checked={!formData.hasVariants}
                  onChange={() => setFormData({ ...formData, hasVariants: false })}
                  className="accent-[#006B3C] w-4 h-4 cursor-pointer"
                />
                <span>No variants (Single product)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="hasVariants"
                  checked={formData.hasVariants}
                  onChange={() => setFormData({ ...formData, hasVariants: true })}
                  className="accent-[#006B3C] w-4 h-4 cursor-pointer"
                />
                <span>This product has variants (e.g., size, color, etc.)</span>
              </label>
            </div>
          </div>

          {/* Card 6: SEO Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">SEO Information</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Page Title</label>
              <input
                type="text"
                value={formData.pageTitle}
                onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                placeholder="Enter SEO title"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all placeholder:text-slate-400"
                maxLength={60}
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.pageTitle.length}/60
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Enter meta description"
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all placeholder:text-slate-400 resize-y"
                  maxLength={160}
                />
                <div className="text-right text-[10px] text-slate-400">
                  {formData.metaDescription.length}/160
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Meta Keywords</label>
                <textarea
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="Enter keywords (comma separated)"
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] transition-all placeholder:text-slate-400 resize-y"
                  maxLength={255}
                />
                <div className="text-right text-[10px] text-slate-400">
                  {formData.metaKeywords.length}/255
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (4 cols)                                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Product Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Product Status
            </h4>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="productStatus"
                  checked={formData.status === "DRAFT"}
                  onChange={() => setFormData({ ...formData, status: "DRAFT" })}
                  className="accent-[#006B3C] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Draft</p>
                  <p className="text-[11px] text-slate-400">Save as draft (not visible in store)</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="productStatus"
                  checked={formData.status === "PUBLISH"}
                  onChange={() => setFormData({ ...formData, status: "PUBLISH" })}
                  className="accent-[#006B3C] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Publish</p>
                  <p className="text-[11px] text-slate-400">Make product visible in store</p>
                </div>
              </label>
            </div>
          </div>

          {/* Card: Product Visibility */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Product Visibility
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOnWebsite}
                  onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>Show on website</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeInSearch}
                  onChange={(e) => setFormData({ ...formData, includeInSearch: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>Include in search results</span>
              </label>
            </div>
          </div>

          {/* Card: Featured Product */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Featured Product</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Mark this product as featured</p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                formData.isFeatured ? "bg-[#006B3C]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.isFeatured ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Card: Tags */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Tags</h4>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enter tags (comma separated)"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C]"
            />
            <p className="text-[10px] text-slate-400">
              Add tags to help customers find this product (e.g., new, bestseller, organic)
            </p>
          </div>

          {/* Card: Shipping Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Shipping Information
            </h4>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Length"
                  value={formData.lengthCm}
                  onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C]"
                />
                <input
                  type="number"
                  placeholder="Width"
                  value={formData.widthCm}
                  onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C]"
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDigital}
                onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
              />
              <span>This is a digital product (no shipping required)</span>
            </label>
          </div>

          {/* Card: Additional Options */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Additional Options
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowCustomerReviews}
                  onChange={(e) => setFormData({ ...formData, allowCustomerReviews: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>Allow customer reviews</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showStockAvailability}
                  onChange={(e) => setFormData({ ...formData, showStockAvailability: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>Show stock availability</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPreorder}
                  onChange={(e) => setFormData({ ...formData, isPreorder: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>This is a preorder product</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNonReturnable}
                  onChange={(e) => setFormData({ ...formData, isNonReturnable: e.target.checked })}
                  className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                />
                <span>This product is non-returnable</span>
              </label>
            </div>
          </div>

          {/* Card: Tips Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-2.5 text-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-[#006B3C]">
              <Lightbulb className="w-4 h-4" />
              <span>Tips for a great product listing</span>
            </div>

            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Use high-quality images (at least 800x800px)</li>
              <li>Write clear and detailed descriptions</li>
              <li>Set the correct category and attributes</li>
              <li>Add relevant tags for better discoverability</li>
              <li>Keep your pricing competitive</li>
              <li>Check all information before publishing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Actions Footer ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-30 shadow-lg">
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN.PRODUCTS)}
          className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={createMutation.isPending}
            className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("PUBLISH")}
            disabled={createMutation.isPending}
            className="px-6 py-2 rounded-xl bg-[#003D2B] hover:bg-[#006B3C] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            {createMutation.isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Publish Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProductPage;
