import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import {
  ArrowLeft,
  UploadCloud,
  X,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Tag,
  Package,
  Layers,
  Flame,
  CheckCircle2,
  Eye,
} from "lucide-react";

export function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load Categories from Backend API
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    oldPrice: "",
    priceUS: "",
    priceCA: "",
    isBestSeller: false,
    isNewProduct: true,
    isFeatured: false,
    stock: "100",
    sku: "",
    status: "ACTIVE",
    hasVariants: false,
    variants: [
      { id: "v-1", name: "500g Pack", sku: "", weight: 0.5, priceUS: "", priceCA: "", stock: 50 },
      { id: "v-2", name: "1 KG Pack", sku: "", weight: 1.0, priceUS: "", priceCA: "", stock: 100 },
    ],
  });

  // Set default category once loaded
  React.useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => Api.admin.createProduct(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      toast.success("Product Created", `"${formData.name}" has been published successfully.`);
      navigate(ROUTES.ADMIN.PRODUCTS);
    },
    onError: (err) => {
      toast.error("Creation Failed", err.message || "Failed to create product.");
    },
  });

  const addVariantRow = () => {
    const newIdx = formData.variants.length + 1;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `v-${Date.now()}`,
          name: `Option ${newIdx}`,
          sku: "",
          weight: 1.0,
          priceUS: prev.priceUS || "",
          priceCA: prev.priceCA || "",
          stock: 50,
        },
      ],
    }));
  };

  const removeVariantRow = (id) => {
    if (formData.variants.length <= 1) {
      toast.error("Minimum 1 Variant", "You must keep at least one variant.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  const updateVariantRow = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Missing Title", "Please provide a product title.");
      return;
    }

    if (!formData.priceUS) {
      toast.error("Missing Price", "Please enter the USA price.");
      return;
    }

    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    const mainSku = formData.sku.trim() || `VAN-${Date.now().toString().slice(-6)}`;

    // Prepare variants
    const processedVariants = formData.hasVariants
      ? formData.variants.map((v, i) => ({
          name: v.name.trim() || `Variant ${i + 1}`,
          sku: v.sku.trim() || `${mainSku}-V${i + 1}`,
          weight: parseFloat(v.weight) || 1.0,
          priceUS: v.priceUS ? parseFloat(v.priceUS) : parseFloat(formData.priceUS) || 0,
          priceCA: v.priceCA ? parseFloat(v.priceCA) : (parseFloat(formData.priceUS) * 1.35),
          stock: parseInt(v.stock, 10) || 50,
        }))
      : [
          {
            name: `${formData.name.trim()} Standard`,
            sku: `${mainSku}-VAR`,
            weight: 1.0,
            priceUS: parseFloat(formData.priceUS) || 0,
            priceCA: formData.priceCA ? parseFloat(formData.priceCA) : (parseFloat(formData.priceUS) * 1.35),
            stock: parseInt(formData.stock, 10) || 100,
          },
        ];

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId || (categories[0]?.id || undefined),
      category: selectedCat ? selectedCat.name : "General",
      image: formData.imageUrl,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      priceUS: parseFloat(formData.priceUS) || 0,
      priceCA: formData.priceCA ? parseFloat(formData.priceCA) : (parseFloat(formData.priceUS) * 1.35),
      isBestSeller: Boolean(formData.isBestSeller),
      isNewProduct: Boolean(formData.isNewProduct),
      isFeatured: Boolean(formData.isFeatured),
      stock: parseInt(formData.stock, 10) || 100,
      sku: mainSku,
      status: formData.status || "ACTIVE",
      variants: processedVariants,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
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
              type="button"
              onClick={() => navigate(ROUTES.ADMIN.PRODUCTS)}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Add Product</h1>
              <p className="text-xs text-slate-500">
                Configure your product details, variants, multi-currency prices, and badges.
              </p>
            </div>
          </div>
        </div>

        <Link
          to={ROUTES.HOME}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View Live Store</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Main Left Form (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Essential Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#358B5B]" />
                <span>Product Information</span>
              </h3>

              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Kashmiri Saffron Grade-A"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed product description, specifications, or packaging details..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all placeholder:text-slate-400 resize-y"
                />
              </div>

              {/* Category Dropdown & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] cursor-pointer"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No categories available</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">SKU / Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Auto-generated if blank (e.g. VAN-8392)"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Multi-Currency Pricing & Old Price */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#358B5B]" />
                <span>Base Pricing</span>
              </h3>
              <p className="text-xs text-slate-500">
                Set standard cross-border prices for USA, Canada, and optional original strike-through price.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* USA Price */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">🇺🇸 USA Price ($ USD) *</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      USD
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceUS}
                    onChange={(e) => setFormData({ ...formData, priceUS: e.target.value })}
                    placeholder="34.99"
                    className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold"
                  />
                </div>

                {/* Canada Price */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">🇨🇦 Canada Price (CA$ CAD)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      CAD
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceCA}
                    onChange={(e) => setFormData({ ...formData, priceCA: e.target.value })}
                    placeholder={formData.priceUS ? (Number(formData.priceUS) * 1.35).toFixed(2) : "46.99"}
                    className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold"
                  />
                </div>

                {/* Old Price (MRP / Compare Price) */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Old Price / Strike ($)</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Crossed out
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    placeholder="49.99"
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-semibold line-through text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Product Variants (Sizes, Weights, Options) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#358B5B]" />
                    <span>Product Variants</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enable this if the product comes in multiple sizes, weights, or options.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasVariants}
                    onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                    className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Has Multiple Variants</span>
                </label>
              </div>

              {formData.hasVariants && (
                <div className="space-y-3 pt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="pb-2">Variant Name / Pack</th>
                          <th className="pb-2">Weight (KG)</th>
                          <th className="pb-2">USA Price ($)</th>
                          <th className="pb-2">Stock</th>
                          <th className="pb-2 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.variants.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/70">
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => updateVariantRow(v.id, "name", e.target.value)}
                                placeholder="e.g. 500g Pack"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
                              />
                            </td>
                            <td className="py-2 pr-2 w-28">
                              <input
                                type="number"
                                step="0.1"
                                value={v.weight}
                                onChange={(e) => updateVariantRow(v.id, "weight", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
                              />
                            </td>
                            <td className="py-2 pr-2 w-28">
                              <input
                                type="number"
                                step="0.01"
                                value={v.priceUS}
                                onChange={(e) => updateVariantRow(v.id, "priceUS", e.target.value)}
                                placeholder={formData.priceUS || "0.00"}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
                              />
                            </td>
                            <td className="py-2 pr-2 w-24">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => updateVariantRow(v.id, "stock", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
                              />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeVariantRow(v.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#358B5B] text-[#358B5B] hover:bg-[#358B5B]/10 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Variant</span>
                  </button>
                </div>
              )}
            </div>

            {/* Card 4: Image URL & Live Preview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#358B5B]" />
                <span>Product Image</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Image</span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste a direct image URL (Unsplash, CDN, or S3 bucket link).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar Right Column (4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card: Product Badges & Highlighting */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Product Badges & Tags
              </h4>

              <div className="space-y-3">
                {/* Bestseller Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bestseller</p>
                      <p className="text-[10px] text-slate-400">Display "BESTSELLER" tag</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                {/* New Product Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">New Product</p>
                      <p className="text-[10px] text-slate-400">Display "NEW" badge</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isNewProduct}
                    onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })}
                    className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                {/* Featured Product Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Featured</p>
                      <p className="text-[10px] text-slate-400">Highlight in top storefront carousels</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Card: Inventory & Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Stock & Status
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Live in Store)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 rounded-xl bg-[#204B38] hover:bg-[#358B5B] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {createMutation.isPending && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>Publish Product</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN.PRODUCTS)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddProductPage;
