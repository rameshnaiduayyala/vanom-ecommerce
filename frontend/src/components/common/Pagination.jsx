import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn.js";

/**
 * Reusable, Enterprise-Grade Pagination Component
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current 1-based page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback invoked with new page number: (page) => void
 * @param {number} [props.totalItems] - Total count of items across all pages
 * @param {number} [props.pageSize] - Number of items displayed per page
 * @param {number} [props.siblingCount=1] - Number of page buttons shown on either side of active page
 * @param {boolean} [props.showItemCount=true] - Whether to show the "Showing X to Y of Z" label
 * @param {string} [props.itemName="products"] - Name of the item for the count label
 * @param {string} [props.className=""] - Additional class names for wrapper
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  showItemCount = true,
  itemName = "products",
  className = "",
}) {
  // If only 1 page and no items count needed, do not render controls
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 10))) {
    return null;
  }

  // Calculate start & end item indices for the summary label
  const { startIndex, endIndex } = useMemo(() => {
    if (typeof totalItems !== "number" || !pageSize) {
      return { startIndex: 0, endIndex: 0 };
    }
    if (totalItems === 0) return { startIndex: 0, endIndex: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return { startIndex: start, endIndex: end };
  }, [currentPage, pageSize, totalItems]);

  // Generate page number items with ellipsis
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + first + last + current + 2*dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 1: No left dots, but right dots needed
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1);
      return [...leftRange, "...", totalPages];
    }

    // Case 2: No right dots, but left dots needed
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, idx) => totalPages - rightItemCount + idx + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    // Case 3: Both left and right dots needed
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, idx) => leftSiblingIndex + idx
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }, [totalPages, siblingCount, currentPage]);

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange?.(page);
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none",
        className
      )}
    >
      {/* ── Summary Count (Left) ── */}
      {showItemCount && typeof totalItems === "number" && (
        <div className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
          Showing{" "}
          <span className="font-bold text-[#204B38]">{startIndex}</span> to{" "}
          <span className="font-bold text-[#204B38]">{endIndex}</span> of{" "}
          <span className="font-bold text-[#204B38]">{totalItems}</span> {itemName}
        </div>
      )}

      {/* ── Controls (Right / Center) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className={cn(
            "inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
            "border border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-[#EEF8F5] hover:border-[#358B5B]/50 hover:text-[#204B38]",
            "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Mobile Page Indicator (compact) */}
        <div className="sm:hidden px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#204B38] shadow-xs">
          {currentPage} / {totalPages}
        </div>

        {/* Desktop Numbered Page Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          {paginationRange.map((pageNumber, idx) => {
            if (pageNumber === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-xs font-bold text-gray-400 select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageClick(pageNumber)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
                className={cn(
                  "w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center",
                  isActive
                    ? "bg-[#204B38] text-white shadow-sm shadow-[#204B38]/20 scale-105"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-[#EEF8F5] hover:border-[#358B5B]/50 hover:text-[#204B38] shadow-xs hover:scale-102"
                )}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className={cn(
            "inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
            "border border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-[#EEF8F5] hover:border-[#358B5B]/50 hover:text-[#204B38]",
            "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
