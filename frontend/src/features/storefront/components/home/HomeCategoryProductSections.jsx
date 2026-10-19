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
  // Determine categories selected to show on home page
  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];

    // Filter categories explicitly toggled as "showOnHome"
    const selected = categories.filter((c) => Boolean(c.showOnHome));

    // Fallback: If no category has showOnHome toggled yet, use top root categories
    if (selected.length === 0) {
      return categories.filter((c) => !c.parentId).slice(0, 4);
    }

    return selected;
  }, [categories]);

  if (displayCategories.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section
      aria-label="Category Showcases"
      className={`w-full flex flex-col ${className}`}
    >
      {displayCategories.map((cat, idx) => (
        <CategoryProductSection
          key={cat.id || cat.slug || idx}
          category={cat}
          pageSize={pageSize}
          fallbackProducts={featuredProducts}
          hideIfEmpty={false}
          className={idx % 2 === 1 ? "bg-white/40" : "bg-transparent"}
        />
      ))}
    </section>
  );
}

export default HomeCategoryProductSections;
