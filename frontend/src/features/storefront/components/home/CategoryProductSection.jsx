import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { CategoryPromoBanner } from "./CategoryPromoBanner.jsx";
import { SubcategoryProductRow } from "./SubcategoryProductRow.jsx";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { useCategorySectionProducts } from "../../hooks/useCategorySectionProducts.js";

/**
 * CategoryProductSection — Reusable Component
 * Renders:
 * 1. Main Category Title & "View All [Category]"
 * 2. Category Advertisement / Promo Banner (Dynamically loaded from category.categoryBannerImage or fallback)
 * 3. Products Grouped Subcategory-wise with Smooth Carousel & Side Arrows
 * 4. Fallback direct products grid if no subcategories exist
 */
export function CategoryProductSection({
  category,
  fallbackProducts = [],
  className = "",
}) {
  if (!category) return null;

  const categoryId = category?.id || category?.slug;
  const categoryName = category?.name || "Category";
  const subcategories = Array.isArray(category?.children)
    ? category.children
    : [];
  const categoryImage =
    category?.imageUrl || category?.image || category?.thumbnail;

  // For parent categories that don't have subcategories or direct catalog items:
  const { products: directProducts, isLoading: loadingDirect } =
    useCategorySectionProducts(categoryId, { pageSize: 10, fallbackProducts });

  const mainCategoryLink = `/products?category=${encodeURIComponent(categoryId)}`;

  return (
    <div className={`py-6 sm:py-9 w-full ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-6">
        {/* ── 1. Main Category Header (Matching Uploaded Image) ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {categoryImage ? (
              <img
                src={categoryImage}
                alt={categoryName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#204B38]/15 bg-white shadow-2xs shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EAF5EF] text-[#204B38] font-black text-sm flex items-center justify-center border border-[#B7E0CA] shrink-0">
                {categoryName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1E3B2B] tracking-tight">
                {categoryName}
              </h3>
              {category.description && (
                <p className="text-xs text-gray-500 line-clamp-1 hidden sm:block">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <Link
            to={mainCategoryLink}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#204B38] hover:text-[#358B5B] transition-colors"
          >
            <span>View All {categoryName}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── 2. Category Advertisement / Promotion Banner (Dynamic from category) ── */}
        <CategoryPromoBanner
          category={category}
        />

        {/* ── 3. Subcategory Wise Products ── */}
        {subcategories.length > 0 ? (
          <div className="space-y-6 pt-1">
            {subcategories.map((sub) => (
              <SubcategoryProductRow
                key={sub.id || sub.slug}
                subcategory={sub}
                fallbackProducts={fallbackProducts}
              />
            ))}
          </div>
        ) : (
          /* Fallback if category has no children */
          <div className="w-full pt-2">
            {loadingDirect ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs animate-pulse space-y-3"
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : directProducts.length === 0 ? (
              <div className="bg-white/70 rounded-2xl border border-gray-200/60 p-8 text-center space-y-2">
                <PackageOpen className="w-8 h-8 text-[#358B5B] mx-auto opacity-70" />
                <p className="text-sm font-bold text-[#204B38]">
                  No products in this category yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {directProducts.map((p, idx) => (
                  <ProductCardCompact
                    key={p.id || p._id || idx}
                    product={p}
                    badge={p.badge}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProductSection;
