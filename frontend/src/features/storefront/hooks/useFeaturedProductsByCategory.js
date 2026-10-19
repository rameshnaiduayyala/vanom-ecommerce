import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../stores/country.store.js";

/**
 * useFeaturedProductsByCategory — Custom hook embodying Separation of Concerns
 * Encapsulates all data fetching, category switching, and pagination state.
 *
 * @param {Object} options
 * @param {Array} [options.featuredProducts=[]] - Preloaded featured products
 * @param {Array} [options.bestSellers=[]] - Preloaded best seller products (fallback)
 * @param {Array} [options.categories=[]] - Category tree or list
 * @param {number} [options.pageSize=10] - Items per page
 * @param {string} [options.initialCategory="all"] - Initial selected category
 */
export function useFeaturedProductsByCategory({
  featuredProducts = [],
  bestSellers = [],
  categories = [],
  pageSize = 10,
  initialCategory = "all",
} = {}) {
  const { country } = useCountryStore();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to normalize product arrays from various API response shapes
  const normalizeList = (raw) =>
    Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
      ? raw
      : [];

  // Flattened categories list for fast lookup and tabs
  const flatCategories = useMemo(() => {
    const list = [];
    const traverse = (items) => {
      if (!Array.isArray(items)) return;
      for (const cat of items) {
        list.push(cat);
        if (Array.isArray(cat.children)) {
          traverse(cat.children);
        }
      }
    };
    traverse(categories);
    return list;
  }, [categories]);

  // Find active category object
  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === "all") return null;
    return (
      flatCategories.find(
        (c) => c.id === selectedCategory || c.slug === selectedCategory
      ) || null
    );
  }, [flatCategories, selectedCategory]);

  // Combined fallback pool of preloaded items
  const basePool = useMemo(() => {
    const list = featuredProducts.length > 0 ? featuredProducts : bestSellers;
    return normalizeList(list);
  }, [featuredProducts, bestSellers]);

  // Query category-specific products if a specific category is selected
  const isCategoryQuery = selectedCategory !== "all";

  const {
    data: categoryApiData,
    isLoading: isLoadingCategory,
    isFetching: isFetchingCategory,
  } = useQuery({
    queryKey: ["featured-category-products", selectedCategory, country.code],
    queryFn: async () => {
      if (!isCategoryQuery) return null;
      try {
        const res = await Api.catalog.getProducts({
          categoryId: selectedCategory,
          limit: 60,
        });
        return res;
      } catch {
        return null;
      }
    },
    enabled: isCategoryQuery,
    staleTime: 3 * 60 * 1000,
  });

  // Category counts across preloaded products
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const p of basePool) {
      const cId = p.categoryId || p.category?.id;
      const cSlug = p.category?.slug || (typeof p.category === "string" ? p.category : null);
      if (cId) counts[cId] = (counts[cId] || 0) + 1;
      if (cSlug) counts[cSlug] = (counts[cSlug] || 0) + 1;
    }
    return counts;
  }, [basePool]);

  // Top category tabs to show (categories that have items or root categories)
  const categoryTabs = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    // Prioritize root categories or categories with products
    return categories.slice(0, 8);
  }, [categories]);

  // Active products list based on selection
  const activeProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return basePool;
    }

    // If API returned items for this category, prioritize them
    const apiItems = normalizeList(categoryApiData);
    if (apiItems.length > 0) {
      // Prioritize featured ones within the category, followed by others
      return [...apiItems].sort((a, b) => {
        const featA = a.isFeatured ? 1 : 0;
        const featB = b.isFeatured ? 1 : 0;
        return featB - featA;
      });
    }

    // Fallback: filter basePool in-memory
    const inMemoryFiltered = basePool.filter((p) => {
      const cId = p.categoryId || p.category?.id;
      const cSlug = p.category?.slug || (typeof p.category === "string" ? p.category : null);
      return (
        cId === selectedCategory ||
        cSlug === selectedCategory ||
        p.category?.name?.toLowerCase() === activeCategoryObj?.name?.toLowerCase()
      );
    });

    return inMemoryFiltered;
  }, [selectedCategory, basePool, categoryApiData, activeCategoryObj]);

  // Total items & pages calculations
  const totalItems = activeProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Automatically reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Paginated slice for current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeProducts.slice(start, start + pageSize);
  }, [activeProducts, currentPage, pageSize]);

  // Indices for display label
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Actions
  const selectCategory = (catId) => {
    if (catId === selectedCategory) return;
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    selectedCategory,
    activeCategoryObj,
    categoryTabs,
    categoryCounts,
    paginatedProducts,
    allProducts: activeProducts,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    startIndex,
    endIndex,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    isLoading: isCategoryQuery ? isLoadingCategory : false,
    isFetching: isCategoryQuery ? isFetchingCategory : false,
    selectCategory,
    goToPage,
    nextPage,
    prevPage,
  };
}

export default useFeaturedProductsByCategory;
