import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";

/**
 * useCategorySectionProducts — Custom Hook
 * Manages data fetching, normalized product list, and independent pagination for a single category block.
 * Supports activeSubcategoryId switching.
 *
 * @param {string} categoryId - ID or slug of the category (parent or active subcategory)
 * @param {Object} [options]
 * @param {number} [options.pageSize=10] - Number of products per page
 * @param {Array} [options.fallbackProducts=[]] - Optional fallback products if available in parent
 * @param {Array} [options.subcategories=[]] - Subcategories of this parent category
 */
export function useCategorySectionProducts(
  categoryId,
  { pageSize = 10, fallbackProducts = [], subcategories = [] } = {}
) {
  const { country } = useCountryStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);

  // Active category target: if a subcategory pill is active, fetch for it; otherwise fetch for the main parent category
  const activeCategoryId = selectedSubcategoryId || categoryId;

  // Reset page when subcategory tab changes
  const handleSelectSubcategory = (subId) => {
    setSelectedSubcategoryId(subId);
    setCurrentPage(1);
  };

  // Normalize product lists from API
  const normalizeList = (raw) =>
    Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
      ? raw
      : [];

  // Query products specifically for this category or active subcategory
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["category-section-products", activeCategoryId, country.code],
    queryFn: async () => {
      if (!activeCategoryId) return null;
      try {
        const res = await Api.catalog.getProducts({
          categoryId: activeCategoryId,
          limit: 60,
        });
        return res;
      } catch {
        return null;
      }
    },
    enabled: Boolean(activeCategoryId),
    staleTime: 3 * 60 * 1000,
  });

  // Calculate full products array
  const allProducts = useMemo(() => {
    const apiItems = normalizeList(data);
    if (apiItems.length > 0) {
      return apiItems;
    }
    // In-memory fallback
    if (Array.isArray(fallbackProducts) && fallbackProducts.length > 0) {
      return fallbackProducts.filter(
        (p) =>
          p.categoryId === activeCategoryId ||
          p.category?.id === activeCategoryId ||
          p.category?.slug === activeCategoryId ||
          p.category?.parentId === activeCategoryId ||
          p.category?.parent?.slug === activeCategoryId
      );
    }
    return [];
  }, [data, fallbackProducts, activeCategoryId]);

  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset page if totalPages shrinks below currentPage
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allProducts.slice(start, start + pageSize);
  }, [allProducts, currentPage, pageSize]);

  const goToPage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
  };

  return {
    products: paginatedProducts,
    allProducts,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    isFetching,
    selectedSubcategoryId,
    setSelectedSubcategory: handleSelectSubcategory,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}

export default useCategorySectionProducts;
