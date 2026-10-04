import React from "react";
import { Search, Clock, ArrowRight, X, Sparkles, Folder, Package, Loader2 } from "lucide-react";
import { formatPrice } from "@/utils/formatters.js";
import { resolveProductImageUrl } from "@/utils/image.js";

export function SearchAutocompleteDropdown({
  isOpen,
  isSearching,
  searchQuery,
  searchResults = { products: [], categories: [], total: 0 },
  recentSearches = [],
  activeIndex = -1,
  onSelectProduct,
  onSelectCategory,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onViewAll,
  currency = "USD",
  currencySymbol = "$",
}) {
  if (!isOpen) return null;

  const trimmedQuery = (searchQuery || "").trim();
  const hasQuery = trimmedQuery.length >= 2;
  const products = Array.isArray(searchResults?.products) ? searchResults.products : [];
  const categories = Array.isArray(searchResults?.categories) ? searchResults.categories : [];
  const hasResults = products.length > 0 || categories.length > 0;
  const showRecent = !hasQuery && recentSearches.length > 0;

  // If nothing to show and not loading, don't show an empty floating box
  if (!hasQuery && !showRecent) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-[460px] overflow-y-auto"
      onMouseDown={(e) => {
        // Prevent input onBlur when clicking inside dropdown
        e.preventDefault();
      }}
    >
      {/* ── 1. Recent Searches (When query is empty) ── */}
      {showRecent && (
        <div className="p-3">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Recent Searches</span>
            </span>
            <button
              type="button"
              onClick={onClearRecentSearches}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recentSearches.map((term, idx) => (
              <span
                key={`${term}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 hover:bg-[#EAF7F0] border border-gray-200/80 text-xs font-medium text-gray-700 hover:text-[#003D2B] transition-all cursor-pointer group"
                onClick={() => onSelectRecentSearch(term)}
              >
                <Search className="w-3 h-3 text-gray-400 group-hover:text-[#003D2B]" />
                <span>{term}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecentSearch(term, e);
                  }}
                  className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 ml-0.5"
                  title="Remove search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. Loading Spinner ── */}
      {hasQuery && isSearching && products.length === 0 && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#00875A]" />
          <span className="text-xs font-medium">Searching catalog...</span>
        </div>
      )}

      {/* ── 3. Category Suggestions ── */}
      {hasQuery && categories.length > 0 && (
        <div className="p-3 border-b border-gray-100 bg-[#FAF9F5]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Suggested Categories
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DCE8DF] hover:border-[#00875A] text-xs font-semibold text-[#0F2B1C] hover:text-[#00875A] transition-all shadow-2xs cursor-pointer group"
              >
                <Folder className="w-3 h-3 text-[#00875A]" />
                <span>{cat.name}</span>
                {cat.productCount > 0 && (
                  <span className="text-[10px] font-normal text-gray-400">({cat.productCount})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Matching Products List ── */}
      {hasQuery && products.length > 0 && (
        <div className="py-1">
          <div className="px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Products</span>
            {isSearching && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          </div>
          <div className="divide-y divide-gray-50">
            {products.map((p, idx) => {
              const isSelected = activeIndex === idx;
              const imgUrl = resolveProductImageUrl(p);
              const pCurrency = p.currency || currency;
              const pSymbol = p.symbol || currencySymbol;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className={`px-3.5 py-2.5 flex items-center gap-3 transition-colors cursor-pointer group ${
                    isSelected ? "bg-[#EAF7F0]" : "hover:bg-[#F8FAF9]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#003D2B] transition-colors truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5 truncate">
                      {p.brand?.name && (
                        <span className="font-semibold text-gray-700">{p.brand.name}</span>
                      )}
                      {p.brand?.name && p.category?.name && <span>•</span>}
                      {p.category?.name && <span>{p.category.name}</span>}
                      {p.sku && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-gray-400">{p.sku}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & Discount */}
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#003D2B]">
                        {formatPrice(p.price, pCurrency, pSymbol)}
                      </span>
                      {p.discount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 font-bold text-[9px]">
                          -{p.discount}%
                        </span>
                      )}
                    </div>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(p.originalPrice, pCurrency, pSymbol)}
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="text-[10px] font-semibold text-rose-500">
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. No Results ── */}
      {hasQuery && !isSearching && !hasResults && (
        <div className="p-6 text-center space-y-2">
          <p className="text-xs font-bold text-gray-800">
            No products found for "{trimmedQuery}"
          </p>
          <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
            Try checking for spelling errors, using more general keywords, or viewing all products in the catalog.
          </p>
          <button
            type="button"
            onClick={onViewAll}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00875A] text-white text-xs font-semibold hover:bg-[#00744D] transition-colors cursor-pointer"
          >
            <span>Search in Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 6. Footer: View All Results ── */}
      {hasQuery && hasResults && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/70">
          <button
            type="button"
            onClick={onViewAll}
            className="w-full py-2 px-3 rounded-xl bg-[#003D2B] hover:bg-[#002b1e] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <span>View All Results for "{trimmedQuery}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchAutocompleteDropdown;
