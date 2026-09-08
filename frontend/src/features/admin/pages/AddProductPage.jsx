import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Boxes,
} from "lucide-react";

export function AddProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const queryClient = useQueryClient();

  // Load Categories from Backend API
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  // Load Product Data if in Edit Mode
  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ["admin-product-edit", editId],
    queryFn: () => Api.catalog.getProductBySlug(editId),
    enabled: isEditMode,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    brand_id: "",
    product_type: "simple", // simple | variable
    is_featured: false,
    is_new: true,
    is_best_seller: false,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    price_usd: "",
    old_price_usd: "",
    price_cad: "",
    old_price_cad: "",
    stock_quantity: 100,
    sku: "",
    status: "ACTIVE",
    variants: [
      {
        id: "v-1",
        sku: "",
        variant_name: "500g Pack",
        weight: 0.5,
        price_usd: "18.00",
        old_price_usd: "25.00",
        price_cad: "24.00",
        old_price_cad: "32.00",
        stock_quantity: 50,
        status: "ACTIVE",
      },
      {
        id: "v-2",
        sku: "",
        variant_name: "1 KG Pack",
        weight: 1.0,
        price_usd: "35.00",
        old_price_usd: "50.00",
        price_cad: "45.00",
        old_price_cad: "65.00",
        stock_quantity: 100,
        status: "ACTIVE",
      },
    ],
  });

  // Populate data when editing existing product
  useEffect(() => {
    if (existingProduct) {
      const p = existingProduct;
      const pVariants = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.map((v, i) => ({
            id: v.id || `v-${i + 1}`,
            sku: v.sku || "",
            variant_name: v.variant_name || v.name || `Variant ${i + 1}`,
            weight: v.weight ? Number(v.weight) : 1.0,
            price_usd: v.price_usd !== null && v.price_usd !== undefined ? String(v.price_usd) : "",
            old_price_usd: v.old_price_usd !== null && v.old_price_usd !== undefined ? String(v.old_price_usd) : "",
            price_cad: v.price_cad !== null && v.price_cad !== undefined ? String(v.price_cad) : "",
            old_price_cad: v.old_price_cad !== null && v.old_price_cad !== undefined ? String(v.old_price_cad) : "",
            stock_quantity: v.stock_quantity !== undefined ? v.stock_quantity : (v.stock || 50),
            status: v.status || "ACTIVE",
          }))
        : [];

      setFormData({
        name: p.name || "",
        slug: p.slug || "",
        description: p.description || "",
        category_id: p.category_id || p.categoryId || (p.categories?.[0]?.categoryId || ""),
        brand_id: p.brand_id || p.brandId || "",
        product_type: p.product_type || (pVariants.length > 1 ? "variable" : "simple"),
        is_featured: Boolean(p.is_featured ?? p.isFeatured),
        is_new: Boolean(p.is_new ?? p.isNew ?? p.isNewProduct),
        is_best_seller: Boolean(p.is_best_seller ?? p.isBestSeller),
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
        price_usd: p.price_usd !== null && p.price_usd !== undefined ? String(p.price_usd) : (p.priceUS ? String(p.priceUS) : ""),
        old_price_usd: p.old_price_usd !== null && p.old_price_usd !== undefined ? String(p.old_price_usd) : (p.oldPrice ? String(p.oldPrice) : ""),
        price_cad: p.price_cad !== null && p.price_cad !== undefined ? String(p.price_cad) : (p.priceCA ? String(p.priceCA) : ""),
        old_price_cad: p.old_price_cad !== null && p.old_price_cad !== undefined ? String(p.old_price_cad) : "",
        stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity : (p.stock || 100),
        sku: p.sku || "",
        status: p.status || "ACTIVE",
        variants: pVariants.length > 0 ? pVariants : formData.variants,
      });
    }
  }, [existingProduct]);

  // Set default category once categories are loaded for new products
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id && !isEditMode) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, isEditMode]);

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => Api.admin.createProduct(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      queryKeyRefetch();
      toast.success("Product Created", `"${formData.name}" has been published successfully.`);
      navigate(ROUTES.ADMIN.PRODUCTS);
    },
    onError: (err) => {
      toast.error("Creation Failed", err.message || "Failed to create product.");
    },
  });

  // Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => Api.admin.updateProduct(existingProduct?.id || editId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      queryKeyRefetch();
      toast.success("Product Updated", `"${formData.name}" has been updated successfully.`);
      navigate(ROUTES.ADMIN.PRODUCTS);
    },
    onError: (err) => {
      toast.error("Update Failed", err.message || "Failed to update product.");
    },
  });

  const queryKeyRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["home-products"] });
    queryClient.invalidateQueries({ queryKey: ["product-detail"] });
  };

  const addVariantRow = () => {
    const newIdx = formData.variants.length + 1;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `v-${Date.now()}`,
          sku: "",
          variant_name: `Option ${newIdx}`,
          weight: 1.0,
          price_usd: "",
          old_price_usd: "",
          price_cad: "",
          old_price_cad: "",
          stock_quantity: 50,
          status: "ACTIVE",
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

  const handleAddImageUrl = (url) => {
    if (!url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()],
    }));
  };

  const handleRemoveImageUrl = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Missing Title", "Please provide a product title.");
      return;
    }

    const isVariable = formData.product_type === "variable";
    const mainSku = formData.sku.trim() || `VAN-${Date.now().toString().slice(-6)}`;

    // Validation
    if (!isVariable) {
      if (!formData.price_usd) {
        toast.error("Missing Price", "Please enter the USA price ($ USD) for the simple product.");
        return;
      }
    } else {
      if (formData.variants.length === 0) {
        toast.error("Missing Variants", "Please add at least one variant with price and stock.");
        return;
      }
      const firstMissingPrice = formData.variants.find((v) => !v.price_usd && v.price_usd !== 0);
      if (firstMissingPrice) {
        toast.error("Missing Variant Price", `Please enter the USD price for variant "${firstMissingPrice.variant_name}".`);
        return;
      }
    }

    // Prepare variants payload matching the API schema
    const processedVariants = isVariable
      ? formData.variants.map((v, i) => ({
          sku: v.sku.trim() || `${mainSku}-V${i + 1}`,
          variant_name: v.variant_name.trim() || `Variant ${i + 1}`,
          weight: parseFloat(v.weight) || 1.0,
          price_usd: parseFloat(v.price_usd) || 0,
          old_price_usd: v.old_price_usd ? parseFloat(v.old_price_usd) : null,
          price_cad: v.price_cad ? parseFloat(v.price_cad) : (parseFloat(v.price_usd || 0) * 1.35),
          old_price_cad: v.old_price_cad ? parseFloat(v.old_price_cad) : null,
          stock_quantity: parseInt(v.stock_quantity, 10) || 50,
          status: v.status || "ACTIVE",
          attributes: {},
          images: [],
        }))
      : [
          {
            sku: `${mainSku}-VAR`,
            variant_name: `${formData.name.trim()} Standard`,
            weight: 1.0,
            price_usd: parseFloat(formData.price_usd) || 0,
            old_price_usd: formData.old_price_usd ? parseFloat(formData.old_price_usd) : null,
            price_cad: formData.price_cad ? parseFloat(formData.price_cad) : (parseFloat(formData.price_usd) * 1.35),
            old_price_cad: formData.old_price_cad ? parseFloat(formData.old_price_cad) : null,
            stock_quantity: parseInt(formData.stock_quantity, 10) || 100,
            status: "ACTIVE",
            attributes: {},
            images: [],
          },
        ];

    // Compute total stock quantity
    const totalStock = isVariable
      ? processedVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
      : (parseInt(formData.stock_quantity, 10) || 100);

    const baseUsdPrice = isVariable
      ? (processedVariants[0]?.price_usd || 0)
      : (parseFloat(formData.price_usd) || 0);

    const baseOldUsdPrice = isVariable
      ? (processedVariants[0]?.old_price_usd || null)
      : (formData.old_price_usd ? parseFloat(formData.old_price_usd) : null);

    const baseCadPrice = isVariable
      ? (processedVariants[0]?.price_cad || (baseUsdPrice * 1.35))
      : (formData.price_cad ? parseFloat(formData.price_cad) : (baseUsdPrice * 1.35));

    const baseOldCadPrice = isVariable
      ? (processedVariants[0]?.old_price_cad || null)
      : (formData.old_price_cad ? parseFloat(formData.old_price_cad) : null);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim(),
      category_id: formData.category_id || (categories[0]?.id || undefined),
      brand_id: formData.brand_id || null,
      product_type: formData.product_type,
      is_featured: Boolean(formData.is_featured),
      is_new: Boolean(formData.is_new),
      is_best_seller: Boolean(formData.is_best_seller),
      images: formData.images.filter((img) => typeof img === "string" && img.trim().length > 0),
      price_usd: baseUsdPrice,
      old_price_usd: baseOldUsdPrice,
      price_cad: baseCadPrice,
      old_price_cad: baseOldCadPrice,
      stock_quantity: totalStock,
      sku: mainSku,
      status: formData.status || "ACTIVE",
      variants: processedVariants,
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
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
            <span className="text-slate-800 font-medium">{isEditMode ? "Edit Product" : "Add Product"}</span>
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-xs text-slate-500">
                {formData.product_type === "simple"
                  ? "Configure simple product pricing, stock quantity, and details."
                  : "Configure variable product with multiple options/sizes, individual prices, and stocks."}
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
            
            {/* Card 1: Product Information */}
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
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] focus:ring-1 focus:ring-[#358B5B] transition-all placeholder:text-slate-400 font-medium"
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
                    Category (category_id) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B] transition-all font-mono"
                  />
                </div>
              </div>

              {/* Product Type (simple | variable) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Product Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, product_type: "simple" })}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      formData.product_type === "simple"
                        ? "bg-emerald-50 border-[#358B5B] text-[#204B38] ring-2 ring-[#358B5B]/20 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#358B5B]" />
                    <div className="text-left">
                      <div className="font-bold">Simple Product</div>
                      <div className="text-[10px] font-normal text-slate-500">Single Price & Stock</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, product_type: "variable" })}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      formData.product_type === "variable"
                        ? "bg-emerald-50 border-[#358B5B] text-[#204B38] ring-2 ring-[#358B5B]/20 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#358B5B]" />
                    <div className="text-left">
                      <div className="font-bold">Variable Product</div>
                      <div className="text-[10px] font-normal text-slate-500">Multiple Variants & Stocks</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ── CASE A: SIMPLE PRODUCT PRICING & STOCK ── */}
            {formData.product_type === "simple" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#358B5B]" />
                      <span>Simple Product Pricing & Stock</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set cross-border prices (USD & CAD), strike-through comparison price, and available inventory.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                    Simple Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* USA Pricing Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">🇺🇸 United States (USD)</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        USD ($)
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-emerald-800">Price ($ USD) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price_usd}
                          onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                          placeholder="34.99"
                          className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Old Price / Strike ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.old_price_usd}
                          onChange={(e) => setFormData({ ...formData, old_price_usd: e.target.value })}
                          placeholder="49.99"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Canada Pricing Box */}
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">🇨🇦 Canada (CAD)</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        CAD (CA$)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-blue-800">Price (CA$ CAD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price_cad}
                          onChange={(e) => setFormData({ ...formData, price_cad: e.target.value })}
                          placeholder={formData.price_usd ? (Number(formData.price_usd) * 1.35).toFixed(2) : "46.99"}
                          className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Old Price (CA$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.old_price_cad}
                          onChange={(e) => setFormData({ ...formData, old_price_cad: e.target.value })}
                          placeholder="65.99"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Quantity for Simple Product */}
                <div className="pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-emerald-700" />
                        <span>Available Stock Quantity</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Total units available in warehouse for simple product.</p>
                    </div>

                    <div className="w-36">
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#358B5B] font-bold text-slate-900 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CASE B: VARIABLE PRODUCT PRICING & STOCK (VARIANTS TABLE) ── */}
            {formData.product_type === "variable" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#358B5B]" />
                      <span>Variant Prices & Stock Quantities</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Each variant has its own individual SKU, weight, USD & CAD prices, and inventory stock.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#358B5B] text-[#358B5B] hover:bg-[#358B5B]/10 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Variant</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50/60">
                          <th className="py-2.5 px-2 rounded-l-lg">Variant Option / Size</th>
                          <th className="py-2.5 px-2">SKU</th>
                          <th className="py-2.5 px-2">Weight (KG)</th>
                          <th className="py-2.5 px-2 bg-emerald-50/50 text-emerald-900">Price ($ USD) *</th>
                          <th className="py-2.5 px-2">Old ($)</th>
                          <th className="py-2.5 px-2 bg-blue-50/50 text-blue-900">Price (CA$)</th>
                          <th className="py-2.5 px-2">Old (CA$)</th>
                          <th className="py-2.5 px-2 bg-amber-50/50 text-amber-900">Stock Qty *</th>
                          <th className="py-2.5 px-2 text-right rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.variants.map((v, i) => (
                          <tr key={v.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-1 min-w-[140px]">
                              <input
                                type="text"
                                value={v.variant_name}
                                onChange={(e) => updateVariantRow(v.id, "variant_name", e.target.value)}
                                placeholder={`e.g. 500g Pack`}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-medium"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-24">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => updateVariantRow(v.id, "sku", e.target.value)}
                                placeholder={`V${i + 1}`}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] font-mono text-slate-600"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-16">
                              <input
                                type="number"
                                step="0.1"
                                value={v.weight}
                                onChange={(e) => updateVariantRow(v.id, "weight", e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] text-center"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-24 bg-emerald-50/30">
                              <input
                                type="number"
                                step="0.01"
                                required
                                value={v.price_usd}
                                onChange={(e) => updateVariantRow(v.id, "price_usd", e.target.value)}
                                placeholder="18.00"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-emerald-950"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-20">
                              <input
                                type="number"
                                step="0.01"
                                value={v.old_price_usd}
                                onChange={(e) => updateVariantRow(v.id, "old_price_usd", e.target.value)}
                                placeholder="25.00"
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-400"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-24 bg-blue-50/30">
                              <input
                                type="number"
                                step="0.01"
                                value={v.price_cad}
                                onChange={(e) => updateVariantRow(v.id, "price_cad", e.target.value)}
                                placeholder={v.price_usd ? (Number(v.price_usd) * 1.35).toFixed(2) : "24.00"}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-blue-950"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-20">
                              <input
                                type="number"
                                step="0.01"
                                value={v.old_price_cad}
                                onChange={(e) => updateVariantRow(v.id, "old_price_cad", e.target.value)}
                                placeholder="32.00"
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] line-through text-slate-400"
                              />
                            </td>
                            <td className="py-2.5 px-1 w-20 bg-amber-50/30">
                              <input
                                type="number"
                                min="0"
                                required
                                value={v.stock_quantity}
                                onChange={(e) => updateVariantRow(v.id, "stock_quantity", e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-[#358B5B] font-bold text-slate-900 text-center"
                              />
                            </td>
                            <td className="py-2.5 px-1 text-right">
                              <button
                                type="button"
                                onClick={() => removeVariantRow(v.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove variant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-600">
                      Total Variants: <strong className="text-slate-900">{formData.variants.length}</strong>
                    </span>
                    <span className="font-semibold text-slate-600">
                      Combined Stock: <strong className="text-emerald-700">{formData.variants.reduce((sum, v) => sum + (parseInt(v.stock_quantity, 10) || 0), 0)} units</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Product Images (images[]) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#358B5B]" />
                <span>Product Images (images[])</span>
              </h3>

              <div className="space-y-3">
                {/* Image Grid Preview */}
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#204B38] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Direct Image URL Inputs */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Add Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="newImageUrlInput"
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#358B5B]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("newImageUrlInput");
                        if (input) {
                          handleAddImageUrl(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add Image
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste public image URLs or CDN paths. The first image will be set as primary thumbnail.
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
                      <p className="text-xs font-bold text-slate-800">is_best_seller</p>
                      <p className="text-[10px] text-slate-400">Display "BESTSELLER" badge</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
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
                      <p className="text-xs font-bold text-slate-800">is_new</p>
                      <p className="text-[10px] text-slate-400">Display "NEW" badge</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
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
                      <p className="text-xs font-bold text-slate-800">is_featured</p>
                      <p className="text-[10px] text-slate-400">Highlight in storefront featured grid</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-[#358B5B] w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Card: Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Publish Status
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#358B5B] cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Live in Store)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3 rounded-xl bg-[#204B38] hover:bg-[#358B5B] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isEditMode ? "Save Product Changes" : "Publish Product"}</span>
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
