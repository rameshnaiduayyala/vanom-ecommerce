import React from "react";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, RotateCcw } from "lucide-react";

export function ProductsHeaderBar({
  title,
  itemCount,
  country,
  currentCategory,
  activeCategoryName,
  currentSearch,
  inStockOnly,
  setInStockOnly,
  sortBy,
  setSortBy,
  gridCols,
  setGridCols,
  onClearCategory,
  onClearSearch,
  onClearAll,
}) {
  const hasActiveFilters = Boolean(currentCategory || currentSearch || inStockOnly);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE8DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Active Results Count & Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <h1 className="text-lg sm:text-xl font-extrabold text-[#0F2B1C] tracking-tight">
          {title}
        </h1>
        <span className="text-slate-300">•</span>
        <span className="text-[#5E7D67]">
          Showing <strong className="text-[#0F2B1C]">{itemCount}</strong> items
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-[#5E7D67] hidden sm:inline">
          Prices in{" "}
          <strong className="text-[#00875A]">
            {country?.flag} {country?.currency} ({country?.symbol})
          </strong>
        </span>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 ml-2">
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4EA] text-[#00875A] font-semibold text-[11px]">
                <span>{activeCategoryName || "Category"}</span>
                <button
                  onClick={onClearCategory}
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
                  onClick={onClearSearch}
                  className="hover:text-[#064027] cursor-pointer"
                  title="Remove search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={onClearAll}
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
  );
}
