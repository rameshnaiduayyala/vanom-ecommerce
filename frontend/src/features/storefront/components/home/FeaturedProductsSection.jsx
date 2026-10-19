import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen, Sparkles, X } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { CategoryFilterTabs } from "./CategoryFilterTabs.jsx";
import { Pagination } from "../../../../components/common/Pagination.jsx";
import { useFeaturedProductsByCategory } from "../../hooks/useFeaturedProductsByCategory.js";
import { ROUTES } from "../../../../constants/routes.js";

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function FeaturedSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs animate-pulse flex flex-col"
        >
          <div className="aspect-square bg-gray-100/90" />
          <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 bg-gray-200/80 rounded w-1/3" />
              <div className="h-3.5 bg-gray-200/90 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="pt-2">
              <div className="h-5 bg-gray-200 rounded w-2/5 mb-2" />
              <div className="h-8 bg-gray-100 rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export function FeaturedProductsSection({
  featuredProducts = [],
  bestSellers = [],
  categories = [],
  isLoading = false,
  pageSize = 10,
  title = "Featured Products",
  subtitle = "Handpicked organic essentials, customer favorites & best-value deals",
  className = "",
}) {
  const sectionRef = useRef(null);

  // Business Logic & State Hook (Separation of Concerns)
  const {
    selectedCategory,
    activeCategoryObj,
    categoryTabs,
    categoryCounts,
    paginatedProducts,
    allProducts,
    totalItems,
    totalPages,
    currentPage,
    isLoading: isCategoryLoading,
    selectCategory,
    goToPage,
  } = useFeaturedProductsByCategory({
    featuredProducts,
    bestSellers,
    categories,
    pageSize,
  });

  const showLoading = isLoading || isCategoryLoading;

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Featured Products Section"
      className={`py-8 sm:py-12 w-full max-w-full overflow-hidden ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 w-full min-w-0 space-y-6">
        {/* ── 1. Section Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#204B38] tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#204B38]/20 text-xs sm:text-sm font-bold text-[#204B38] hover:bg-[#204B38] hover:text-white transition-all shadow-xs group"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ── 2. Category Filter Tabs (Reusable Presentation) ────────── */}
        {categoryTabs.length > 0 && (
          <div className="pt-1">
            <CategoryFilterTabs
              categories={categoryTabs}
              selectedCategoryId={selectedCategory}
              onSelectCategory={selectCategory}
              allCount={featuredProducts.length || bestSellers.length || null}
              categoryCounts={categoryCounts}
              allLabel="All Featured"
            />
          </div>
        )}

        {/* ── 3. Active Category Indicator Bar ──────────────────────── */}
        {selectedCategory !== "all" && (
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-xs border border-gray-200/70 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filtered category:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF5EF] text-[#204B38] font-bold text-xs">
                {activeCategoryObj?.name || "Selected Category"}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            </div>

            <button
              type="button"
              onClick={() => selectCategory("all")}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* ── 4. Product Grid / Skeletons / Empty State ──────────────── */}
        {showLoading ? (
          <FeaturedSkeleton count={pageSize} />
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white/90 rounded-3xl border border-gray-200/80 p-10 sm:p-14 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#358B5B] flex items-center justify-center mx-auto shadow-inner">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#204B38]">
              No products found in this category
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              There are currently no featured items available under &ldquo;
              {activeCategoryObj?.name || "this selection"}&rdquo;.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => selectCategory("all")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#204B38] text-white text-xs font-bold rounded-xl hover:bg-[#18392B] transition-colors cursor-pointer"
              >
                <span>View All Featured Products</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {paginatedProducts.map((p, i) => (
              <ProductCardCompact
                key={p.id || p._id || i}
                product={p}
                badge={p.badge}
              />
            ))}
          </div>
        )}

        {/* ── 5. Reusable Pagination Controls ────────────────────────── */}
        {!showLoading && totalPages > 1 && (
          <div className="pt-2 border-t border-gray-200/60">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              showItemCount={true}
              itemName="products"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
