import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { Pagination } from "../../../../components/common/Pagination.jsx";
import { useCategorySectionProducts } from "../../hooks/useCategorySectionProducts.js";

function CategorySkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs animate-pulse flex flex-col"
        >
          <div className="aspect-square bg-gray-100/90" />
          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-7 bg-gray-100 rounded-lg w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * CategoryProductSection — Reusable Component
 * Renders an independent category block with its own header, product grid, and pagination.
 */
export function CategoryProductSection({
  category,
  pageSize = 10,
  fallbackProducts = [],
  hideIfEmpty = true,
  className = "",
}) {
  const sectionRef = useRef(null);

  const categoryId = category?.id || category?.slug;

  const declaredCount = category?.count ?? category?.directCount ?? category?._count?.products;
  const isKnownEmpty = declaredCount !== undefined && declaredCount !== null && Number(declaredCount) === 0;

  const {
    products,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    goToPage,
  } = useCategorySectionProducts(isKnownEmpty ? null : categoryId, {
    pageSize,
    fallbackProducts,
  });

  if (!category) return null;

  // If hideIfEmpty is enabled and there are no items in this category
  if (hideIfEmpty && (isKnownEmpty || (!isLoading && (totalItems === 0 || products.length === 0)))) {
    return null;
  }

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const categoryLink = `/products?category=${encodeURIComponent(categoryId)}`;
  const image = category.imageUrl || category.image || category.thumbnail;

  return (
    <div
      ref={sectionRef}
      className={`py-6 sm:py-8 w-full border-b border-gray-200/60 last:border-b-0 ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-5">
        {/* ── Category Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Category Miniature Image / Icon */}
            {image ? (
              <img
                src={image}
                alt={category.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-[#204B38]/15 bg-white shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EAF5EF] text-[#204B38] font-black text-base flex items-center justify-center border border-[#B7E0CA] shrink-0">
                {category.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#204B38] tracking-tight">
                  {category.name}
                </h3>
              </div>
              {category.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <Link
            to={categoryLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#358B5B] hover:text-[#204B38] transition-colors self-start sm:self-auto"
          >
            <span>View All {category.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Product Grid ── */}
        {isLoading ? (
          <CategorySkeleton count={Math.min(pageSize, 5)} />
        ) : products.length === 0 ? (
          <div className="bg-white/70 rounded-2xl border border-gray-200/60 p-8 text-center space-y-2">
            <PackageOpen className="w-7 h-7 text-[#358B5B] mx-auto opacity-70" />
            <p className="text-sm font-bold text-[#204B38]">
              No products found in this category
            </p>
            <p className="text-xs text-gray-500">
              New catalog additions will appear here shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {products.map((p, i) => (
              <ProductCardCompact
                key={p.id || p._id || i}
                product={p}
                badge={p.badge}
              />
            ))}
          </div>
        )}

        {/* ── Independent Category Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              showItemCount={true}
              itemName={`${category.name.toLowerCase()} products`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProductSection;
