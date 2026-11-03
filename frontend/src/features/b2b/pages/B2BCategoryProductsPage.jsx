import React, { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Search,
  ArrowLeft,
  SlidersHorizontal,
  Package,
  Layers,
  Building2,
  FolderTree,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { B2BProductCard } from "../components/B2BProductCard.jsx";
import { AddToBulkOrderModal } from "../components/AddToBulkOrderModal.jsx";

export function B2BCategoryProductsPage() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCountryStore();

  const searchParam = searchParams.get("search") || "";
  const brandParam = searchParams.get("brand") || "ALL";

  const [search, setSearch] = useState(searchParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);

  const targetCountryCode = (country.code || "US").toUpperCase();
  const currencyCode = targetCountryCode === "CA" ? "CAD" : "USD";
  const currencySymbol = targetCountryCode === "CA" ? "CA$" : "$";

  // Load bulk products
  const { data: bulkProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["b2b-catalog-bulk-products", search],
    queryFn: () => Api.b2b.getBulkProducts({ search }),
  });

  // Load Categories Tree to resolve category metadata
  const { data: rawCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["shared-categories-tree"],
    queryFn: async () => {
      try {
        const treeRes = await Api.catalog.getCategoryTree();
        const tree = Array.isArray(treeRes?.data) ? treeRes.data : Array.isArray(treeRes) ? treeRes : [];
        if (tree.length > 0) return tree;
      } catch {}
      const flatRes = await Api.catalog.getCategories();
      return Array.isArray(flatRes?.data) ? flatRes.data : Array.isArray(flatRes?.items) ? flatRes.items : [];
    },
  });

  // Flatten categories list to find current category
  const allCategories = useMemo(() => {
    const list = [];
    const traverse = (cats) => {
      for (const cat of cats) {
        list.push(cat);
        if (Array.isArray(cat.children)) {
          traverse(cat.children);
        }
      }
    };
    traverse(rawCategories);
    return list;
  }, [rawCategories]);

  // Find targeted category
  const currentCategory = useMemo(() => {
    if (!categorySlug) return null;
    const clean = decodeURIComponent(categorySlug).toLowerCase().trim();
    return (
      allCategories.find(
        (c) =>
          c.slug?.toLowerCase() === clean ||
          c.id?.toLowerCase() === clean ||
          c.name?.toLowerCase() === clean
      ) || {
        id: categorySlug,
        slug: categorySlug,
        name: decodeURIComponent(categorySlug).replace(/-/g, " "),
      }
    );
  }, [allCategories, categorySlug]);

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

  // Filter products for this specific category / subcategory
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(bulkProducts) || bulkProducts.length === 0) return [];
    if (!currentCategory) return [];

    const targetId = currentCategory.id;
    const targetSlug = currentCategory.slug?.toLowerCase();
    const targetName = currentCategory.name?.toLowerCase();

    return bulkProducts.filter((p) => {
      // 1. Category match
      const pCatId = p.categoryId;
      const pCat = (p.category || p.categoryName || "").toLowerCase().trim();
      const matchesCat =
        pCatId === targetId ||
        pCat === targetSlug ||
        pCat === targetName ||
        (targetName && pCat.includes(targetName));

      if (!matchesCat) return false;

      // 2. Brand filter
      if (selectedBrand !== "ALL") {
        const pBrand = (p.brand || "").toLowerCase();
        if (!pBrand.includes(selectedBrand.toLowerCase())) return false;
      }

      // 3. Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [bulkProducts, currentCategory, selectedBrand, search]);

  const isLoading = loadingProducts || loadingCategories;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb & Back Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Link
          to={ROUTES.B2B.CATALOG}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#006B3C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Wholesale Catalog</span>
        </Link>

        <Link
          to={`${ROUTES.B2B.BULK_ORDER}?category=${encodeURIComponent(currentCategory?.name || "")}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#006B3C] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Order Entire Category in Bulk Sheet</span>
        </Link>
      </div>

      {/* ── Category Header Banner ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentCategory?.imageUrl ? (
            <img
              src={currentCategory.imageUrl}
              alt={currentCategory.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-[#006B3C] font-black text-xl flex items-center justify-center border border-emerald-200 shrink-0">
              <FolderTree className="w-8 h-8" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentCategory?.name || "Category Commodities"}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>
            {currentCategory?.description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {currentCategory.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Search & Brand Filter Bar ── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search within ${currentCategory?.name || "category"}...`}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#006B3C] focus:ring-1 focus:ring-[#006B3C] transition-all"
          />
        </div>

        {/* Brand Dropdown */}
        {brands.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:border-[#006B3C]"
            >
              <option value="ALL">All Brands</option>
              {brands.map((b) => (
                <option key={b.id || b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Products Responsive Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No products found in ${currentCategory?.name || "this category"}`}
          description="Try clearing your search query or brand filter to see all commodities."
          actionText="Clear Filters"
          onAction={() => {
            setSearch("");
            setSelectedBrand("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <B2BProductCard
              key={product.id}
              product={product}
              targetCountryCode={targetCountryCode}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              onOrderClick={setSelectedProductForOrder}
            />
          ))}
        </div>
      )}

      {/* Add To Bulk Order Sheet Modal */}
      {selectedProductForOrder && (
        <AddToBulkOrderModal
          isOpen={Boolean(selectedProductForOrder)}
          onClose={() => setSelectedProductForOrder(null)}
          product={selectedProductForOrder}
          targetCountryCode={targetCountryCode}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}

export default B2BCategoryProductsPage;

