import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Search,
  Boxes,
  Package,
  Layers,
  ArrowRight,
  FolderTree,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";
import { B2BProductCard } from "../components/B2BProductCard.jsx";
import { B2BSubcategorySection } from "../components/B2BSubcategorySection.jsx";
import { AddToBulkOrderModal } from "../components/AddToBulkOrderModal.jsx";

export function B2BCatalog() {
  const { country } = useCountryStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");

  // Modal State for "Add to Bulk Order Sheet"
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);

  const targetCountryCode = (country.code || "US").toUpperCase();
  const currencyCode = targetCountryCode === "CA" ? "CAD" : "USD";
  const currencySymbol = targetCountryCode === "CA" ? "CA$" : "$";

  // Load dedicated B2B Bulk Products from separate BulkProduct database table
  const { data: bulkProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["b2b-catalog-bulk-products", search],
    queryFn: () => Api.b2b.getBulkProducts({ search }),
  });

  // Load shared Master Categories tree
  const { data: rawCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["shared-categories-tree"],
    queryFn: async () => {
      try {
        const treeRes = await Api.catalog.getCategoryTree();
        const tree = Array.isArray(treeRes?.data)
          ? treeRes.data
          : Array.isArray(treeRes)
          ? treeRes
          : [];
        if (tree.length > 0) return tree;
      } catch {
        // Fallback to flat categories list
      }
      const flatRes = await Api.catalog.getCategories();
      return Array.isArray(flatRes?.data)
        ? flatRes.data
        : Array.isArray(flatRes?.items)
        ? flatRes.items
        : Array.isArray(flatRes)
        ? flatRes
        : [];
    },
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

  // Ensure hierarchical category structure (root categories with children)
  const categoryTree = useMemo(() => {
    if (!Array.isArray(rawCategories) || rawCategories.length === 0) return [];

    // Check if it already has children hierarchy
    const hasChildren = rawCategories.some(
      (c) => Array.isArray(c.children) && c.children.length > 0
    );
    if (hasChildren) {
      return rawCategories.filter((c) => !c.parentId);
    }

    // Build tree from flat array if needed
    const roots = [];
    const map = new Map();
    rawCategories.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });

    rawCategories.forEach((c) => {
      const item = map.get(c.id);
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(item);
      } else {
        roots.push(item);
      }
    });

    return roots;
  }, [rawCategories]);

  // Helper function to match a product to a category/subcategory
  const matchProductCategory = (product, targetCat) => {
    if (!targetCat) return false;
    const catId = targetCat.id;
    const catName = targetCat.name?.toLowerCase().trim();
    const catSlug = targetCat.slug?.toLowerCase().trim();

    const prodCat = (product.category || product.categoryName || "").toLowerCase().trim();
    const prodCatId = product.categoryId;

    return (
      prodCatId === catId ||
      prodCat === catName ||
      prodCat === catSlug ||
      (catName && prodCat.includes(catName))
    );
  };

  // Group wholesale products into root categories and subcategories
  const categorizedSections = useMemo(() => {
    if (!Array.isArray(bulkProducts) || bulkProducts.length === 0) return [];

    // 1. Filter by Brand first if selected
    const brandFiltered = bulkProducts.filter((product) => {
      if (selectedBrand === "ALL") return true;
      const matchedBrand = brands.find(
        (b) => b.id === selectedBrand || b.slug === selectedBrand || b.name === selectedBrand
      );
      const brandName = (matchedBrand?.name || selectedBrand).toLowerCase();
      const prodBrand = (product.brand || product.originCountry || "").toLowerCase();
      return prodBrand === brandName || prodBrand.includes(brandName);
    });

    // 2. Filter by Search Term
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

    const assignedProductIds = new Set();
    const sections = [];

    // 3. Process each root category in the tree
    categoryTree.forEach((rootCat) => {
      const subcategories = Array.isArray(rootCat.children) ? rootCat.children : [];
      const subcategorySections = [];

      // Match products for each child subcategory
      subcategories.forEach((subCat) => {
        const subProducts = searchFiltered.filter((p) => matchProductCategory(p, subCat));
        if (subProducts.length > 0) {
          subProducts.forEach((p) => assignedProductIds.add(p.id));
          subcategorySections.push({
            subcategory: subCat,
            products: subProducts,
          });
        }
      });

      // Match products directly belonging to root category
      const rootDirectProducts = searchFiltered.filter(
        (p) => !assignedProductIds.has(p.id) && matchProductCategory(p, rootCat)
      );
      if (rootDirectProducts.length > 0) {
        rootDirectProducts.forEach((p) => assignedProductIds.add(p.id));
      }

      // If either subcategories or root direct products exist, add to sections
      if (subcategorySections.length > 0 || rootDirectProducts.length > 0) {
        const allCategoryProducts = [
          ...subcategorySections.flatMap((s) => s.products),
          ...rootDirectProducts,
        ];

        sections.push({
          category: rootCat,
          subcategories: subcategorySections,
          directProducts: rootDirectProducts,
          totalProductsCount: allCategoryProducts.length,
        });
      }
    });

    // 4. Products that did not match master categories (Uncategorized or Custom categories)
    const unassigned = searchFiltered.filter((p) => !assignedProductIds.has(p.id));
    if (unassigned.length > 0) {
      const customCategoryMap = new Map();
      unassigned.forEach((prod) => {
        const catLabel = prod.category || prod.categoryName || "Other Wholesale Commodities";
        if (!customCategoryMap.has(catLabel)) {
          customCategoryMap.set(catLabel, []);
        }
        customCategoryMap.get(catLabel).push(prod);
      });

      customCategoryMap.forEach((prods, catLabel) => {
        sections.push({
          category: {
            id: `custom-${catLabel}`,
            name: catLabel,
            slug: catLabel.toLowerCase().replace(/[\s\W-]+/g, "-"),
            description: "Curated wholesale commodities",
            imageUrl: null,
          },
          subcategories: [],
          directProducts: prods,
          totalProductsCount: prods.length,
        });
      });
    }

    // 5. Filter by selected category pill
    if (selectedCategory !== "ALL") {
      return sections.filter(
        (s) =>
          s.category.id === selectedCategory ||
          s.category.slug === selectedCategory ||
          s.category.name === selectedCategory
      );
    }

    return sections;
  }, [bulkProducts, categoryTree, brands, selectedCategory, selectedBrand, search]);

  const isLoading = loadingProducts || loadingCategories;

  const handleOpenOrderModal = (product) => {
    setSelectedProductForOrder(product);
  };

  const handleCloseOrderModal = () => {
    setSelectedProductForOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Catalog Header ── */}
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

        {categoryTree.map((cat) => {
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

      {/* ── Category-Wise Sections (Vertical Grid without Banners) ── */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-lg bg-slate-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton
                    key={n}
                    className="h-80 rounded-2xl bg-white border border-slate-200"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categorizedSections.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No wholesale commodities found"
          description="Try adjusting your category filter, brand selection, or search keywords."
          className="text-slate-600 bg-white border border-slate-200 rounded-2xl p-10"
        />
      ) : (
        <div className="space-y-12">
          {categorizedSections.map(({ category, subcategories, directProducts, totalProductsCount }) => (
            <section
              key={category.id}
              className="space-y-6 bg-white/70 p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs"
            >
              {/* Main Category Header Row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#006B3C] font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                      <FolderTree className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {category.name}
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {totalProductsCount} {totalProductsCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{category.description}</p>
                    )}
                  </div>
                </div>

                <Link
                  to={`${ROUTES.B2B.BULK_ORDER}?category=${encodeURIComponent(category.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#006B3C] hover:text-emerald-700 transition-colors"
                >
                  <span>Order Entire Category</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Subcategories Vertical Sections */}
              {subcategories.length > 0 && (
                <div className="space-y-8">
                  {subcategories.map(({ subcategory, products }) => (
                    <B2BSubcategorySection
                      key={subcategory.id}
                      subcategory={subcategory}
                      products={products}
                      targetCountryCode={targetCountryCode}
                      currencyCode={currencyCode}
                      currencySymbol={currencySymbol}
                      onOrderClick={handleOpenOrderModal}
                    />
                  ))}
                </div>
              )}

              {/* Direct products if any (or if category has no subcategories) */}
              {directProducts.length > 0 && (
                <div className="space-y-4 pt-2">
                  {subcategories.length > 0 && (
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      More in {category.name}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {directProducts.map((product) => (
                      <B2BProductCard
                        key={product.id}
                        product={product}
                        targetCountryCode={targetCountryCode}
                        currencyCode={currencyCode}
                        currencySymbol={currencySymbol}
                        onOrderClick={handleOpenOrderModal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Interactive Modal: Ask how many and variant */}
      {selectedProductForOrder && (
        <AddToBulkOrderModal
          isOpen={Boolean(selectedProductForOrder)}
          onClose={handleCloseOrderModal}
          product={selectedProductForOrder}
          targetCountryCode={targetCountryCode}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}

export default B2BCatalog;
