import { useState, useMemo, useCallback } from "react";

/**
 * useTablePagination
 *
 * Universal, reusable pagination hook for data tables.
 * Supports both:
 * 1. Client-side pagination (slice of array data)
 * 2. Server-side / API pagination (via totalItems or serverMeta passed into the hook)
 *
 * @param {Object} options
 * @param {Array} [options.data=[]] - Full dataset (for client-side slicing)
 * @param {number} [options.initialPage=1] - Starting page number (1-based)
 * @param {number} [options.initialPageSize=10] - Initial rows per page
 * @param {Array<number>} [options.pageSizeOptions=[10, 20, 50, 100]] - Available page sizes
 * @param {number} [options.totalItems] - Explicit total count (for server-side pagination)
 * @param {Function} [options.onPageChange] - Callback when page changes: (page) => void
 * @param {Function} [options.onPageSizeChange] - Callback when page size changes: (pageSize) => void
 */
export function useTablePagination({
  data = [],
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems: explicitTotalItems,
  onPageChange,
  onPageSizeChange,
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const rawList = Array.isArray(data) ? data : data?.items || [];

  // Total items: explicit count from API or length of client-side array
  const totalItems = typeof explicitTotalItems === "number" ? explicitTotalItems : rawList.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  // Clamp current page within valid range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Client-side paginated items (if explicitTotalItems is not provided, slices the array)
  const paginatedData = useMemo(() => {
    if (typeof explicitTotalItems === "number") {
      // Server-side: data passed in is already the current page's slice
      return rawList;
    }
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return rawList.slice(startIndex, startIndex + pageSize);
  }, [rawList, safeCurrentPage, pageSize, explicitTotalItems]);

  const handlePageChange = useCallback(
    (page) => {
      const targetPage = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(targetPage);
      onPageChange?.(targetPage);
    },
    [totalPages, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      const sizeNum = Number(newSize) || initialPageSize;
      setPageSizeState(sizeNum);
      setCurrentPage(1);
      onPageSizeChange?.(sizeNum);
    },
    [initialPageSize, onPageSizeChange]
  );

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: safeCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    paginatedData,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    resetPage,
    // Convenient props bundle ready to spread directly onto <Pagination {...paginationProps} />
    paginationProps: {
      currentPage: safeCurrentPage,
      totalPages,
      totalItems,
      pageSize,
      pageSizeOptions,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
  };
}

export default useTablePagination;
