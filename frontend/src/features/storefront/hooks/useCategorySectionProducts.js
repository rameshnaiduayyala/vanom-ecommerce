import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";

/**
 * useCategorySectionProducts — Custom Hook (Separation of Concerns)
 * Manages data fetching, normalized product list, and independent pagination for a single category block.
 *
 * @param {string} categoryId - ID or slug of the category
 * @param {Object} [options]
 * @param {number} [options.pageSize=10] - Number of products per page
 * @param {Array} [options.fallbackProducts=[]] - Optional fallback products if available in parent
 */
export function useCategorySectionProducts(categoryId, { pageSize = 10, fallbackProducts = [] } = {}) {
  const { country } = useCountryStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Normalize product lists from API
  const normalizeList = (raw) =>
    Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
      ? raw
      : [];

  // Query products specifically for this category
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["category-section-products", categoryId, country.code],
    queryFn: async () => {
      if (!categoryId) return null;
      try {
        const res = await Api.catalog.getProducts({
          categoryId,
          limit: 60,
        });
        return res;
      } catch {
        return null;
      }
    },
    enabled: Boolean(categoryId),
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
          p.categoryId === categoryId ||
          p.category?.id === categoryId ||
          p.category?.slug === categoryId
      );
    }
    return [];
  }, [data, fallbackProducts, categoryId]);

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
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}

export default useCategorySectionProducts;
