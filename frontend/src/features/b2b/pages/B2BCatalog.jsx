import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Search,
  Boxes,
  Package,
  Layers,
  ArrowRight,
  FolderTree,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

/**
 * Single Wholesale Product Card
 */
function B2BProductCard({ product, targetCountryCode, currencyCode, currencySymbol }) {
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.filter((v) => v.isActive !== false)
    : [];

  // Find starting wholesale price across weight variants
  let startingPrice = null;
  if (variants.length > 0) {
    const prices = variants
      .map((v) => {
        const cp = v.countryPrices?.find(
          (p) => p.countryCode?.toUpperCase() === targetCountryCode
        );
        return cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;
      })
      .filter((p) => p !== null && !isNaN(p) && p > 0);

    if (prices.length > 0) {
      startingPrice = Math.min(...prices);
    }
  }

  if (startingPrice === null) {
    const cp = product.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode
    );
    startingPrice =
      cp?.unitPrice !== undefined ? Number(cp.unitPrice) : product.basePriceUSD || 30.0;
  }

  const productImage = resolveProductImageUrl(product);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 hover:border-[#006B3C]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden shadow-xs group">
      <div>
        {/* Image and Weight Variant Badge */}
        <Link
          to={`${ROUTES.B2B.CATALOG}/${product.slug || product.id}`}
          className="block aspect-16/9 bg-slate-100 overflow-hidden relative"
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="bg-white/95 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs font-mono">
              {variants.length > 0 ? `${variants.length} Weights` : "Wholesale"}
            </span>
            {product.brand && (
              <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-lg shadow-xs">
                {product.brand}
              </span>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              {product.category || product.categoryName || "Wholesale Commodity"}
            </span>
            <Link to={`${ROUTES.B2B.CATALOG}/${product.slug || product.id}`} className="block">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#006B3C] transition-colors leading-snug mt-0.5 line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Weight Variants Options Preview */}
          {variants.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-medium block">
                Available Weights:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v, idx) => {
                  const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                  const cp = v.countryPrices?.find(
                    (p) => p.countryCode?.toUpperCase() === targetCountryCode
                  );
                  const price = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;

                  return (
                    <span
                      key={v.id || idx}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold font-mono"
                    >
                      {weightStr}{" "}
                      {price !== null &&
                        `(${formatPrice(price, currencyCode, currencySymbol)})`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Starting Price:</span>
            <span className="font-black text-emerald-800 text-base font-mono">
              {formatPrice(startingPrice, currencyCode, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="p-4 sm:p-5 pt-0">
        <Link to={`${ROUTES.B2B.BULK_ORDER}?productId=${product.id}`} className="block">
          <Button variant="primary" size="sm" className="w-full font-bold shadow-xs" icon={Boxes}>
            Add to Bulk Order Sheet
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function B2BCatalog() {
  const { country } = useCountryStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");

  const targetCountryCode = (country.code || "US").toUpperCase();
  const currencyCode = targetCountryCode === "CA" ? "CAD" : "USD";
  const currencySymbol = targetCountryCode === "CA" ? "CA$" : "$";

  // Load dedicated B2B Bulk Products from separate BulkProduct database table
  const { data: bulkProducts = [], isLoading } = useQuery({
    queryKey: ["b2b-catalog-bulk-products", search],
    queryFn: () => Api.b2b.getBulkProducts({ search }),
  });

  // Load shared Master Categories tree
  const { data: categories = [] } = useQuery({
    queryKey: ["shared-categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  // Load Brands
  const { data: brands = [] } = useQuery({
    queryKey: ["shared-brands"],
    queryFn: async () => {
      try {
        const res = await Api.brands.getBrands();
        return Array.isArray(res) ? res : res?.items || res?.data || [];
      } catch {
        return [];
      }
    },
  });

  // Helper function to match a product to a category
  const matchProductCategory = (product, targetCat) => {
    if (!targetCat) return false;
    const catId = targetCat.id;
    const catName = targetCat.name?.toLowerCase();
    const catSlug = targetCat.slug?.toLowerCase();

    const prodCat = (product.category || product.categoryName || "").toLowerCase();
    const prodCatId = product.categoryId;

    return (
      prodCatId === catId ||
      prodCat === catName ||
      prodCat === catSlug ||
      (catName && prodCat.includes(catName))
    );
  };

  // Group wholesale products category-wise
  const categoryGroups = useMemo(() => {
    if (!Array.isArray(bulkProducts) || bulkProducts.length === 0) return [];

    // Filter by Brand first if selected
    const brandFiltered = bulkProducts.filter((product) => {
      if (selectedBrand === "ALL") return true;
      const matchedBrand = brands.find(
        (b) => b.id === selectedBrand || b.slug === selectedBrand || b.name === selectedBrand
      );
      const brandName = (matchedBrand?.name || selectedBrand).toLowerCase();
      const prodBrand = (product.brand || product.originCountry || "").toLowerCase();
      return prodBrand === brandName || prodBrand.includes(brandName);
    });

    // Filter by Search Term
    const searchFiltered = brandFiltered.filter((product) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.brand && product.brand.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q))
      );
    });

    // 1. Group products by known categories
    const groups = [];
    const assignedProductIds = new Set();

    categories.forEach((cat) => {
      // Find all products matching this category
      const matchingProducts = searchFiltered.filter((prod) =>
        matchProductCategory(prod, cat)
      );

      if (matchingProducts.length > 0) {
        matchingProducts.forEach((p) => assignedProductIds.add(p.id));
        groups.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          products: matchingProducts,
        });
      }
    });

    // 2. Uncategorized or custom named categories
    const unassigned = searchFiltered.filter((p) => !assignedProductIds.has(p.id));
    if (unassigned.length > 0) {
      // Further group unassigned by their string category name
      const customCategoryMap = new Map();
      unassigned.forEach((prod) => {
        const catLabel = prod.category || prod.categoryName || "Other Wholesale Commodities";
        if (!customCategoryMap.has(catLabel)) {
          customCategoryMap.set(catLabel, []);
        }
        customCategoryMap.get(catLabel).push(prod);
      });

      customCategoryMap.forEach((prods, catLabel) => {
        groups.push({
          id: `custom-${catLabel}`,
          name: catLabel,
          slug: catLabel.toLowerCase().replace(/[\s\W-]+/g, "-"),
          description: "Curated wholesale products",
          imageUrl: null,
          products: prods,
        });
      });
    }

    // Filter groups if a single category is specifically chosen in the filter pill/dropdown
    if (selectedCategory !== "ALL") {
      return groups.filter(
        (g) => g.id === selectedCategory || g.slug === selectedCategory
      );
    }

    return groups;
  }, [bulkProducts, categories, brands, selectedCategory, selectedBrand, search]);

  const totalFilteredCount = categoryGroups.reduce(
    (sum, g) => sum + g.products.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* ── Catalog Header Banner ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale &amp; Bulk Catalog
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006B3C]">
              B2B Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse private wholesale commodities organized category-wise with volume-tiered commercial pricing.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Brand Filter */}
          {brands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:border-[#006B3C] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, commodity, brand..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#006B3C] focus:bg-white focus:outline-none"
            />
          </div>

          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="primary" size="sm" icon={Boxes} className="font-bold shadow-xs">
              Open Bulk Order Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Category Quick Filter Strip ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            selectedCategory === "ALL"
              ? "bg-[#006B3C] text-white border-[#006B3C] shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-[#006B3C]/50 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "ALL" : cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? "bg-[#006B3C] text-white border-[#006B3C] font-bold shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-[#006B3C]/50 hover:bg-slate-50"
              }`}
            >
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Category-Wise Products Sections ── */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-lg bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Skeleton
                    key={n}
                    className="h-80 rounded-2xl bg-white border border-slate-200"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categoryGroups.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No wholesale commodities found"
          description="Try adjusting your category filter, brand selection, or search keywords."
          className="text-slate-600 bg-white border border-slate-200 rounded-2xl p-10"
        />
      ) : (
        <div className="space-y-10">
          {categoryGroups.map((group) => (
            <section key={group.id} className="space-y-4">
              {/* Category Header Row */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  {group.imageUrl ? (
                    <img
                      src={group.imageUrl}
                      alt={group.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006B3C] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {group.name}
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {group.products.length} {group.products.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{group.description}</p>
                    )}
                  </div>
                </div>

                <Link
                  to={`${ROUTES.B2B.BULK_ORDER}?category=${encodeURIComponent(group.name)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:underline"
                >
                  <span>Order Entire Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Product Cards Grid for this category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.products.map((product) => (
                  <B2BProductCard
                    key={product.id}
                    product={product}
                    targetCountryCode={targetCountryCode}
                    currencyCode={currencyCode}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default B2BCatalog;
