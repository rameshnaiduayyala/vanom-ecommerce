import React, { useMemo } from "react";
import { CategoryProductSection } from "./CategoryProductSection.jsx";

/**
 * HomeCategoryProductSections — Displays categories and products ONE BY ONE.
 * Shows Main Parent categories with interactive Child Subcategory chips.
 */
export function HomeCategoryProductSections({
  categories = [],
  featuredProducts = [],
  isLoading = false,
  pageSize = 10,
  className = "",
}) {
  // Determine categories selected to show on home page (top-level / main categories)
  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];

    // Check if category has products either directly or via its children
    const hasProducts = (c) => {
      const count = c.count ?? c.directCount ?? c._count?.products ?? 0;
      if (Number(count) > 0) return true;
      if (Array.isArray(c.children) && c.children.length > 0) {
        return c.children.some((child) => {
          const childCount = child.count ?? child.directCount ?? child._count?.products ?? 0;
          return Number(childCount) > 0;
        });
      }
      return false;
    };

    // 1. Only consider root / main parent categories (parentId is null or undefined)
    const mainCategories = categories.filter((c) => !c.parentId);

    // 2. Filter categories explicitly toggled as "showOnHome" that have products
    const selected = mainCategories.filter((c) => Boolean(c.showOnHome) && hasProducts(c));

    // Fallback: If no category matches showOnHome + hasProducts, show top main categories that have products
    if (selected.length === 0) {
      const activeWithProducts = mainCategories.filter(hasProducts);
      if (activeWithProducts.length > 0) {
        return activeWithProducts.slice(0, 4);
      }
      // If none have products yet, fallback to top main categories so the storefront layout is displayed
      return mainCategories.slice(0, 4);
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
          hideIfEmpty={false}
          className="odd:bg-transparent even:bg-white/40"
        />
      ))}
    </section>
  );
}

export default HomeCategoryProductSections;
