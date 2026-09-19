import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { toast } from "../../../components/ui/Toast.jsx";
import { ArrowLeft, Eye } from "lucide-react";

// Modular Reusable Form Cards
import { BasicInfoCard } from "./components/BasicInfoCard.jsx";
import { SimplePricingCard } from "./components/SimplePricingCard.jsx";
import { VariantsPricingCard } from "./components/VariantsPricingCard.jsx";
import { ProductImagesCard } from "./components/ProductImagesCard.jsx";
import { ProductSidebarSettings } from "./components/ProductSidebarSettings.jsx";

export function AddProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const queryClient = useQueryClient();

  // Load Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  // Load Brands
  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => Api.admin.getBrands(),
  });

  // Load Countries for Cross-Border Pricing
  const { data: countries = [] } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: () => Api.geography.getCountries(),
  });

  // Load Product Data if in Edit Mode
  const { data: existingProduct } = useQuery({
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
    stock_usd: "60",
    price_cad: "",
    old_price_cad: "",
    stock_cad: "40",
    stock_quantity: 100,
    delivery_info: "Free Delivery By Thu, 12 Sep",
    return_policy: "7 Days Easy Returns",
    warranty_info: "1 Year Brand Warranty",
    key_highlights: [
      { label: "Delivery", value: "Free Fast Delivery" },
      { label: "Returns", value: "7 Days Easy Return" },
      { label: "Warranty", value: "1 Year Brand Warranty" },
      { label: "Authenticity", value: "100% Genuine Organic" },
    ],
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
        stock_usd: "30",
        price_cad: "24.00",
        old_price_cad: "32.00",
        stock_cad: "20",
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
        stock_usd: "60",
        price_cad: "45.00",
        old_price_cad: "65.00",
        stock_cad: "40",
        stock_quantity: 100,
        status: "ACTIVE",
      },
    ],
  });

  // Populate data when editing existing product
  useEffect(() => {
    if (existingProduct) {
      const p = existingProduct;
      const usCountryEntry = Array.isArray(p.countries)
        ? p.countries.find((c) => c.currency === "USD" || c.country === "United States" || c.country?.code === "US")
        : null;
      const caCountryEntry = Array.isArray(p.countries)
        ? p.countries.find((c) => c.currency === "CAD" || c.country === "Canada" || c.country?.code === "CA")
        : null;

      const pVariants = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.map((v, i) => {
          const vUs = Array.isArray(v.countries)
            ? v.countries.find((c) => c.currency === "USD" || c.country === "United States" || c.country?.code === "US")
            : null;
          const vCa = Array.isArray(v.countries)
            ? v.countries.find((c) => c.currency === "CAD" || c.country === "Canada" || c.country?.code === "CA")
            : null;

          const totalVStock = v.stock !== undefined ? v.stock : (v.stock_quantity !== undefined ? v.stock_quantity : 50);
          const vStockUsd = vUs?.stock !== null && vUs?.stock !== undefined ? String(vUs.stock) : String(Math.round(totalVStock * 0.6));
          const vStockCad = vCa?.stock !== null && vCa?.stock !== undefined ? String(vCa.stock) : String(Math.max(0, totalVStock - Math.round(totalVStock * 0.6)));

          return {
            id: v.id || `v-${i + 1}`,
            sku: v.sku || "",
            variant_name: v.variant_name || v.name || `Variant ${i + 1}`,
            weight: v.attributes?.weight ? Number(v.attributes.weight) : (v.weight ? Number(v.weight) : 1.0),
            price_usd: vUs?.price !== null && vUs?.price !== undefined
              ? String(vUs.price)
              : (v.price_usd !== null && v.price_usd !== undefined ? String(v.price_usd) : ""),
            old_price_usd: vUs?.oldPrice !== null && vUs?.oldPrice !== undefined
              ? String(vUs.oldPrice)
              : (v.old_price_usd !== null && v.old_price_usd !== undefined ? String(v.old_price_usd) : ""),
            stock_usd: vStockUsd,
            price_cad: vCa?.price !== null && vCa?.price !== undefined
              ? String(vCa.price)
              : (v.price_cad !== null && v.price_cad !== undefined ? String(v.price_cad) : ""),
            old_price_cad: vCa?.oldPrice !== null && vCa?.oldPrice !== undefined
              ? String(vCa.oldPrice)
              : (v.old_price_cad !== null && v.old_price_cad !== undefined ? String(v.old_price_cad) : ""),
            stock_cad: vStockCad,
            stock_quantity: totalVStock,
            status: v.isActive !== false ? "ACTIVE" : "INACTIVE",
          };
        })
        : [];

      const resolvedPriceUsd = usCountryEntry?.price !== null && usCountryEntry?.price !== undefined
        ? String(usCountryEntry.price)
        : (p.basePrice !== null && p.basePrice !== undefined ? String(p.basePrice) : (p.price_usd ? String(p.price_usd) : ""));

      const resolvedOldPriceUsd = usCountryEntry?.oldPrice !== null && usCountryEntry?.oldPrice !== undefined
        ? String(usCountryEntry.oldPrice)
        : (p.old_price_usd ? String(p.old_price_usd) : (p.oldPrice ? String(p.oldPrice) : ""));

      const resolvedPriceCad = caCountryEntry?.price !== null && caCountryEntry?.price !== undefined
        ? String(caCountryEntry.price)
        : (p.price_cad ? String(p.price_cad) : (p.priceCA ? String(p.priceCA) : ""));

      const resolvedOldPriceCad = caCountryEntry?.oldPrice !== null && caCountryEntry?.oldPrice !== undefined
        ? String(caCountryEntry.oldPrice)
        : (p.old_price_cad ? String(p.old_price_cad) : "");

      const resolvedStock = p.stock !== undefined ? p.stock : (p.stock_quantity !== undefined ? p.stock_quantity : 100);
      const resolvedStockUsd = usCountryEntry?.stock !== null && usCountryEntry?.stock !== undefined ? String(usCountryEntry.stock) : String(Math.round(resolvedStock * 0.6));
      const resolvedStockCad = caCountryEntry?.stock !== null && caCountryEntry?.stock !== undefined ? String(caCountryEntry.stock) : String(Math.max(0, resolvedStock - Math.round(resolvedStock * 0.6)));

      let loadedHighlights = [];
      if (Array.isArray(p.keyHighlights) && p.keyHighlights.length > 0) {
        loadedHighlights = p.keyHighlights.map((kh) => typeof kh === "string" ? { label: "Feature", value: kh } : { label: kh.label || "Highlight", value: kh.value || "" });
      } else if (Array.isArray(p.key_highlights) && p.key_highlights.length > 0) {
        loadedHighlights = p.key_highlights.map((kh) => typeof kh === "string" ? { label: "Feature", value: kh } : { label: kh.label || "Highlight", value: kh.value || "" });
      } else {
        loadedHighlights = [
          { label: "Delivery", value: "Free Fast Delivery" },
          { label: "Returns", value: "7 Days Easy Return" },
          { label: "Warranty", value: "1 Year Brand Warranty" },
          { label: "Authenticity", value: "100% Genuine Organic" },
        ];
      }

      setFormData({
        name: p.name || "",
        slug: p.slug || "",
        description: p.description || "",
        category_id: p.category_id || p.categoryId || (p.categories?.[0]?.categoryId || ""),
        brand_id: p.brand_id || p.brandId || "",
        product_type: p.product_type || p.type?.toLowerCase() || (pVariants.length > 0 ? "variable" : "simple"),
        is_featured: Boolean(p.is_featured ?? p.isFeatured),
        is_new: Boolean(p.is_new ?? p.isNew ?? p.isNewProduct),
        is_best_seller: Boolean(p.is_best_seller ?? p.isBestSeller),
        delivery_info: p.deliveryInfo || p.delivery_info || "Free Delivery By Thu, 12 Sep",
        return_policy: p.returnPolicy || p.return_policy || "7 Days Easy Returns",
        warranty_info: p.warrantyInfo || p.warranty_info || "1 Year Brand Warranty",
        key_highlights: loadedHighlights,
        images: Array.isArray(p.images) && p.images.length > 0
          ? p.images.map(img => typeof img === "string" ? img : (img.url || img.file?.url || ""))
          : [p.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
        price_usd: resolvedPriceUsd,
        old_price_usd: resolvedOldPriceUsd,
        stock_usd: resolvedStockUsd,
        price_cad: resolvedPriceCad,
        old_price_cad: resolvedOldPriceCad,
        stock_cad: resolvedStockCad,
        stock_quantity: resolvedStock,
        sku: p.sku || "",
        status: p.isActive !== false ? "ACTIVE" : "INACTIVE",
        variants: pVariants.length > 0 ? pVariants : formData.variants,
      });
    }
  }, [existingProduct]);

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id && !isEditMode) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories, isEditMode]);

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => Api.admin.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-list"] });
      queryClient.invalidateQueries({ queryKey: ["home-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail"] });
      toast.success("Product Updated", `"${formData.name}" has been updated successfully.`);
      navigate(ROUTES.ADMIN.PRODUCTS);
    },
    onError: (err) => {
      toast.error("Update Failed", err.message || "Failed to update product.");
    },
  });

  // Variant Handlers
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
          stock_usd: "30",
          price_cad: "",
          old_price_cad: "",
          stock_cad: "20",
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
      variants: prev.variants.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, [field]: value };
        if (field === "stock_usd" || field === "stock_cad") {
          const usStock = parseInt(field === "stock_usd" ? value : v.stock_usd, 10) || 0;
          const caStock = parseInt(field === "stock_cad" ? value : v.stock_cad, 10) || 0;
          updated.stock_quantity = usStock + caStock;
        }
        return updated;
      }),
    }));
  };

  // Highlight Handlers
  const addHighlightRow = () => {
    setFormData((prev) => ({
      ...prev,
      key_highlights: [
        ...(prev.key_highlights || []),
        { label: "Highlight", value: "" },
      ],
    }));
  };

  const removeHighlightRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      key_highlights: (prev.key_highlights || []).filter((_, i) => i !== index),
    }));
  };

  const updateHighlightRow = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      key_highlights: (prev.key_highlights || []).map((kh, i) =>
        i === index ? { ...kh, [field]: value } : kh
      ),
    }));
  };

  // Image Handlers
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

    const usCountry = countries.find((c) => c.code === "US" || c.name?.toLowerCase().includes("united states"));
    const caCountry = countries.find((c) => c.code === "CA" || c.name?.toLowerCase().includes("canada"));

    const processedVariants = isVariable
      ? formData.variants.map((v, i) => {
        const vPriceUsd = parseFloat(v.price_usd) || 0;
        const vOldPriceUsd = v.old_price_usd ? parseFloat(v.old_price_usd) : null;
        const vPriceCad = v.price_cad ? parseFloat(v.price_cad) : parseFloat((vPriceUsd * 1.35).toFixed(2));
        const vOldPriceCad = v.old_price_cad ? parseFloat(v.old_price_cad) : (vOldPriceUsd ? parseFloat((vOldPriceUsd * 1.35).toFixed(2)) : null);
        const vStockUsd = parseInt(v.stock_usd, 10) || 0;
        const vStockCad = parseInt(v.stock_cad, 10) || 0;
        const vStock = vStockUsd + vStockCad;

        const variantCountryPricing = [];
        if (usCountry) {
          variantCountryPricing.push({
            countryId: usCountry.id,
            isAvailable: true,
            price: vPriceUsd,
            oldPrice: vOldPriceUsd,
            stock: vStockUsd,
          });
        }
        if (caCountry) {
          variantCountryPricing.push({
            countryId: caCountry.id,
            isAvailable: true,
            price: vPriceCad,
            oldPrice: vOldPriceCad,
            stock: vStockCad,
          });
        }

        return {
          sku: v.sku.trim() || `${mainSku}-V${i + 1}`,
          name: v.variant_name.trim() || `Variant ${i + 1}`,
          stock: vStock,
          isActive: v.status !== "INACTIVE",
          attributes: { weight: String(v.weight || 1.0) },
          ...(variantCountryPricing.length > 0 ? { countries: variantCountryPricing } : {}),
        };
      })
      : [];

    const simpleUsStock = parseInt(formData.stock_usd, 10) || 0;
    const simpleCaStock = parseInt(formData.stock_cad, 10) || 0;
    const totalStock = isVariable
      ? processedVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
      : (simpleUsStock + simpleCaStock || parseInt(formData.stock_quantity, 10) || 100);

    const baseUsdPrice = isVariable
      ? (parseFloat(formData.variants[0]?.price_usd) || 0)
      : (parseFloat(formData.price_usd) || 0);

    const baseOldUsdPrice = isVariable
      ? (formData.variants[0]?.old_price_usd ? parseFloat(formData.variants[0]?.old_price_usd) : null)
      : (formData.old_price_usd ? parseFloat(formData.old_price_usd) : null);

    const baseCadPrice = isVariable
      ? (formData.variants[0]?.price_cad ? parseFloat(formData.variants[0]?.price_cad) : parseFloat((baseUsdPrice * 1.35).toFixed(2)))
      : (formData.price_cad ? parseFloat(formData.price_cad) : parseFloat((baseUsdPrice * 1.35).toFixed(2)));

    const baseOldCadPrice = isVariable
      ? (formData.variants[0]?.old_price_cad ? parseFloat(formData.variants[0]?.old_price_cad) : (baseOldUsdPrice ? parseFloat((baseOldUsdPrice * 1.35).toFixed(2)) : null))
      : (formData.old_price_cad ? parseFloat(formData.old_price_cad) : (baseOldUsdPrice ? parseFloat((baseOldUsdPrice * 1.35).toFixed(2)) : null));

    const cleanImages = (formData.images || [])
      .filter((img) => img && (typeof img === "string" ? img.trim().length > 0 : Boolean(img.url)))
      .map((img, idx) => (typeof img === "string" ? { url: img.trim(), sortOrder: idx } : img));

    const productCountries = [];
    if (usCountry) {
      productCountries.push({
        countryId: usCountry.id,
        isAvailable: true,
        price: baseUsdPrice,
        oldPrice: baseOldUsdPrice,
        stock: isVariable ? processedVariants.reduce((sum, v) => {
          const usEntry = v.countries?.find(c => c.countryId === usCountry.id);
          return sum + (usEntry?.stock || 0);
        }, 0) : simpleUsStock,
      });
    }
    if (caCountry) {
      productCountries.push({
        countryId: caCountry.id,
        isAvailable: true,
        price: baseCadPrice,
        oldPrice: baseOldCadPrice,
        stock: isVariable ? processedVariants.reduce((sum, v) => {
          const caEntry = v.countries?.find(c => c.countryId === caCountry.id);
          return sum + (caEntry?.stock || 0);
        }, 0) : simpleCaStock,
      });
    }

    const cleanKeyHighlights = (formData.key_highlights || [])
      .filter(h => h && (h.label?.trim() || h.value?.trim()))
      .map(h => ({ label: h.label?.trim() || "Feature", value: h.value?.trim() || "" }));

    const payload = {
      name: formData.name.trim(),
      ...(formData.slug?.trim() ? { slug: formData.slug.trim() } : {}),
      description: formData.description?.trim() || null,
      categoryId: formData.category_id || (categories[0]?.id || null),
      brandId: formData.brand_id || null,
      type: isVariable ? "VARIABLE" : "SIMPLE",
      isFeatured: Boolean(formData.is_featured),
      isNew: Boolean(formData.is_new),
      isBestSeller: Boolean(formData.is_best_seller),
      deliveryInfo: formData.delivery_info?.trim() || null,
      returnPolicy: formData.return_policy?.trim() || null,
      warrantyInfo: formData.warranty_info?.trim() || null,
      keyHighlights: cleanKeyHighlights.length > 0 ? cleanKeyHighlights : null,
      isActive: formData.status !== "INACTIVE",
      images: cleanImages,
      basePrice: baseUsdPrice,
      stock: totalStock,
      sku: mainSku,
      ...(productCountries.length > 0 ? { countries: productCountries } : {}),
      ...(isVariable && processedVariants.length > 0 ? { variants: processedVariants } : {}),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="mx-auto pb-24 space-y-6">
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
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Main Left Form (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">
            <BasicInfoCard
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              brands={brands}
            />

            {formData.product_type === "simple" ? (
              <SimplePricingCard formData={formData} setFormData={setFormData} />
            ) : (
              <VariantsPricingCard
                formData={formData}
                addVariantRow={addVariantRow}
                removeVariantRow={removeVariantRow}
                updateVariantRow={updateVariantRow}
              />
            )}

            <ProductImagesCard
              formData={formData}
              handleAddImageUrl={handleAddImageUrl}
              handleRemoveImageUrl={handleRemoveImageUrl}
            />
          </div>

          {/* ── Sidebar Right Column (4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">
            <ProductSidebarSettings
              formData={formData}
              setFormData={setFormData}
              addHighlightRow={addHighlightRow}
              removeHighlightRow={removeHighlightRow}
              updateHighlightRow={updateHighlightRow}
              isEditMode={isEditMode}
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => navigate(ROUTES.ADMIN.PRODUCTS)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddProductPage;
