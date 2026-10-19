import React, { useMemo } from "react";
import { CategoryProductSection } from "./CategoryProductSection.jsx";

/**
 * HomeCategoryProductSections — Displays categories and products ONE BY ONE.
 * Driven by the category table configuration (showOnHome toggle).
 */
export function HomeCategoryProductSections({
  categories = [],
  featuredProducts = [],
  isLoading = false,
  pageSize = 10,
  className = "",
}) {
  // Determine categories selected to show on home page (excluding categories with 0 items)
  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];

    const hasProducts = (c) => {
      const count = c.count ?? c.directCount ?? c._count?.products;
      if (count !== undefined && count !== null) {
        return Number(count) > 0;
      }
      return true; // if count not provided upfront, let CategoryProductSection resolve it
    };

    // Filter categories explicitly toggled as "showOnHome" that have products
    const selected = categories.filter((c) => Boolean(c.showOnHome) && hasProducts(c));

    // Fallback: If no category has showOnHome toggled yet, use top root categories that have products
    if (selected.length === 0) {
      return categories.filter((c) => !c.parentId && hasProducts(c)).slice(0, 4);
    }

    return selected;
  }, [categories]);

  if (displayCategories.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section
      aria-label="Category Showcases"
      className={`w-full flex flex-col empty:hidden ${className}`}
    >
      {displayCategories.map((cat, idx) => (
        <CategoryProductSection
          key={cat.id || cat.slug || idx}
          category={cat}
          pageSize={pageSize}
          fallbackProducts={featuredProducts}
          hideIfEmpty={true}
          className="odd:bg-transparent even:bg-white/40"
        />
      ))}
    </section>
  );
}

export default HomeCategoryProductSections;
