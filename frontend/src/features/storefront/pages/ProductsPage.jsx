import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { ROUTES } from "../../../constants/routes.js";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  Building2,
  Grid3X3,
  LayoutGrid,
  X,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCountryStore();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [gridCols, setGridCols] = useState("standard"); // "standard" (3-col) | "compact" (4-col)

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => Api.catalog.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-list", currentCategory, currentSearch, country.code],
    queryFn: () => Api.catalog.getProducts({ category: currentCategory, search: currentSearch }),
  });

  const catList = Array.isArray(categories) ? categories : (categories?.items || []);
  const rawProducts = Array.isArray(productsData?.items) ? productsData.items : (Array.isArray(productsData) ? productsData : []);

  // Find active category details
  const activeCategoryObj = useMemo(() => {
    return catList.find((c) => c.id === currentCategory) || null;
  }, [catList, currentCategory]);

  const handleClearFilters = () => {
    setSearchParams({});
    setInStockOnly(false);
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // In Stock filter
    if (inStockOnly) {
      list = list.filter((p) => (p.stock || 10) > 0);
    }

    // Sort options
    if (sortBy === "price-asc") {
      return list.sort((a, b) => {
        const pA = a.pricing?.[country.code]?.retailPrice || a.pricing?.IN?.retailPrice || 0;
        const pB = b.pricing?.[country.code]?.retailPrice || b.pricing?.IN?.retailPrice || 0;
        return pA - pB;
      });
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => {
        const pA = a.pricing?.[country.code]?.retailPrice || a.pricing?.IN?.retailPrice || 0;
        const pB = b.pricing?.[country.code]?.retailPrice || b.pricing?.IN?.retailPrice || 0;
        return pB - pA;
      });
    }
    if (sortBy === "rating") {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [rawProducts, inStockOnly, sortBy, country.code]);

  return (
    <div className="bg-[#F8FAF9] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ─── Clean Header & Filter Control Bar ─── */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE8DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
          
          {/* Active Results Count & Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0F2B1C] tracking-tight">
              {currentSearch
                ? `Search: "${currentSearch}"`
                : activeCategoryObj
                ? activeCategoryObj.name
                : "All Products"}
            </h1>
            <span className="text-slate-300">•</span>
            <span className="text-[#5E7D67]">
              Showing <strong className="text-[#0F2B1C]">{filteredProducts.length}</strong> items
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-[#5E7D67] hidden sm:inline">
              Prices in <strong className="text-[#00875A]">{country.flag} {country.currency} ({country.symbol})</strong>
            </span>

            {/* Active filter badges */}
            {(currentCategory || currentSearch || inStockOnly) && (
              <div className="flex items-center gap-1.5 ml-2">
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4EA] text-[#00875A] font-semibold text-[11px]">
                    <span>{activeCategoryObj?.name || "Category"}</span>
                    <button
                      onClick={() => {
                        searchParams.delete("category");
                        setSearchParams(searchParams);
                      }}
                      className="hover:text-[#064027] cursor-pointer"
                      title="Remove filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {currentSearch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4EA] text-[#00875A] font-semibold text-[11px]">
                    <span>"{currentSearch}"</span>
                    <button
                      onClick={() => {
                        searchParams.delete("q");
                        setSearchParams(searchParams);
                      }}
                      className="hover:text-[#064027] cursor-pointer"
                      title="Remove search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-bold text-red-500 hover:underline ml-1 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          {/* Controls: In Stock Toggle, Sort, Grid View Switcher */}
          <div className="flex items-center gap-3 ml-auto">
            
            {/* In Stock Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-[#3D5648] cursor-pointer bg-[#F8FAF9] px-3 py-1.5 rounded-xl border border-[#DCE8DF] hover:bg-[#F2FAF5]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#00875A] focus:ring-[#00875A] cursor-pointer"
              />
              <span className="hidden sm:inline">In Stock Only</span>
              <span className="sm:hidden">In Stock</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5E7D67]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-transparent border-none text-[#0F2B1C] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Grid Layout Switcher (Desktop) */}
            <div className="hidden sm:flex items-center gap-1 bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl p-1">
              <button
                onClick={() => setGridCols("standard")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  gridCols === "standard"
                    ? "bg-[#00875A] text-white"
                    : "text-[#5E7D67] hover:text-[#0F2B1C]"
                }`}
                title="3-Column View"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridCols("compact")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  gridCols === "compact"
                    ? "bg-[#00875A] text-white"
                    : "text-[#5E7D67] hover:text-[#0F2B1C]"
                }`}
                title="4-Column View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Horizontal Category Scroll Bar for Mobile */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => {
              searchParams.delete("category");
              setSearchParams(searchParams);
            }}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !currentCategory
                ? "bg-[#00875A] text-white shadow-xs"
                : "bg-white text-[#3D5648] border border-[#DCE8DF] hover:bg-[#F0F7F1]"
            }`}
          >
            All Departments ({rawProducts.length})
          </button>
          {catList.map((cat) => {
            const isSelected = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  searchParams.set("category", cat.id);
                  setSearchParams(searchParams);
                }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#00875A] text-white font-bold shadow-xs"
                    : "bg-white text-[#3D5648] border border-[#DCE8DF] hover:bg-[#F0F7F1]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ─── 2-Column Catalog Body ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            
            {/* Department Filter Card */}
            <div className="bg-white rounded-3xl border border-[#DCE8DF] p-5 shadow-xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F2B1C] mb-3 pb-2 border-b border-[#E8EDE9] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Departments</span>
                </span>
                <span className="text-[10px] font-mono text-[#5E7D67]">({catList.length})</span>
              </h4>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    searchParams.delete("category");
                    setSearchParams(searchParams);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    !currentCategory
                      ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                      : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                  }`}
                >
                  <span>All Catalog Items</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70">
                    {rawProducts.length}
                  </span>
                </button>

                {catList.map((cat) => {
                  const isSelected = currentCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        searchParams.set("category", cat.id);
                        setSearchParams(searchParams);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                          : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F7F4] text-[#5E7D67]">
                        {cat.count || 12}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Dispatch Assurance Card */}
            <div className="p-5 rounded-3xl bg-[#064027] text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-[#4ADE80] font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4" />
                <span>DIRECT REGIONAL DISPATCH</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                All catalog items are verified for authentic multi-market delivery with guaranteed tracking across US and UK.
              </p>
              <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-[#4ADE80]">
                <span>24-48h Departure</span>
                <span>•</span>
                <span>Inspected Standard</span>
              </div>
            </div>

            {/* B2B Procurement Support */}
            <div className="p-5 rounded-3xl bg-white border border-[#DCE8DF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#00875A] font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>COMMERCIAL SUPPLY</span>
              </div>
              <p className="text-xs text-[#5E7D67] leading-relaxed">
                Need customized contract supply, scheduled deliveries, or pallet volume?
              </p>
              <Link
                to={ROUTES.B2B.QUOTES}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] hover:underline"
              >
                <span>Request Commercial Proforma</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-9 space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-84 rounded-3xl bg-white border border-[#DCE8DF] animate-pulse p-4" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#DCE8DF] p-8 sm:p-14 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0F2B1C]">No matching products found</h3>
                <p className="text-xs sm:text-sm text-[#5E7D67] max-w-md mx-auto">
                  We couldn't find any products matching your current filters. Try changing your search keywords or resetting departments.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Clear All Filters & Show Full Catalog
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridCols === "compact" ? "lg:grid-cols-4" : "lg:grid-cols-3"
                } gap-4 sm:gap-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Bottom Enterprise Procurement CTA Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#064027] via-[#0B4F32] to-[#064027] text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-700/30">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ADE80]">
                  CUSTOM VOLUMES & RECURRING SUPPLY
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Looking for Bulk Logistics & Scheduled Enterprise Freight?
                </h3>
                <p className="text-xs text-emerald-100/80 max-w-xl">
                  Vanom provides itemized proformas, cross-border customs assistance, and scheduled pallet dispatches.
                </p>
              </div>

              <Link
                to={ROUTES.B2B.QUOTES}
                className="shrink-0 px-6 py-3 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Request B2B Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductsPage;
