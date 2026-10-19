import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "../../../../utils/cn.js";

/**
 * Reusable Category Filter Tabs Component
 * Displays modern pill-based category selector with horizontal scrolling and active states.
 *
 * @param {Object} props
 * @param {Array} props.categories - Array of categories
 * @param {string} props.selectedCategoryId - Currently selected category ID or "all"
 * @param {Function} props.onSelectCategory - Callback when a category is clicked: (id) => void
 * @param {number} [props.allCount] - Total products count for "All" tab
 * @param {Object} [props.categoryCounts] - Map of categoryId -> count
 * @param {string} [props.allLabel="All Featured"] - Label for the "All" tab
 * @param {string} [props.className=""] - Wrapper classes
 */
export function CategoryFilterTabs({
  categories = [],
  selectedCategoryId = "all",
  onSelectCategory,
  allCount = null,
  categoryCounts = {},
  allLabel = "All Featured",
  className = "",
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll positions for directional arrows
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 240,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll categories left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-gray-200 shadow-md text-[#204B38] flex items-center justify-center hover:bg-[#204B38] hover:text-white transition-all cursor-pointer backdrop-blur-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 px-1 sm:px-2 scroll-smooth"
      >
        {/* "All" Tab */}
        <button
          type="button"
          onClick={() => onSelectCategory?.("all")}
          aria-pressed={selectedCategoryId === "all"}
          className={cn(
            "group shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border",
            selectedCategoryId === "all"
              ? "bg-[#204B38] border-[#204B38] text-white shadow-md shadow-[#204B38]/25 scale-[1.02]"
              : "bg-white/90 border-gray-200/90 text-gray-700 hover:bg-[#F2F8F4] hover:border-[#358B5B]/50 hover:text-[#204B38] shadow-xs"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
              selectedCategoryId === "all"
                ? "bg-white/20 text-white"
                : "bg-emerald-50 text-[#358B5B] group-hover:bg-[#358B5B] group-hover:text-white"
            )}
          >
            <Sparkles className="w-3 h-3" />
          </div>
          <span>{allLabel}</span>
          {typeof allCount === "number" && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                selectedCategoryId === "all"
                  ? "bg-white/25 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-[#358B5B]/15 group-hover:text-[#204B38]"
              )}
            >
              {allCount}
            </span>
          )}
        </button>

        {/* Individual Category Tabs */}
        {categories.map((cat) => {
          const catId = cat.id || cat.slug;
          const isActive = selectedCategoryId === catId || selectedCategoryId === cat.slug;
          const count = categoryCounts[catId] ?? categoryCounts[cat.slug] ?? cat.productCount;
          const image = cat.imageUrl || cat.image || cat.thumbnail || cat.categoryImage;

          return (
            <button
              key={catId}
              type="button"
              onClick={() => onSelectCategory?.(catId)}
              aria-pressed={isActive}
              className={cn(
                "group shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border",
                isActive
                  ? "bg-[#204B38] border-[#204B38] text-white font-bold shadow-md shadow-[#204B38]/25 scale-[1.02]"
                  : "bg-white/90 border-gray-200/90 text-gray-700 hover:bg-[#F2F8F4] hover:border-[#358B5B]/50 hover:text-[#204B38] shadow-xs"
              )}
            >
              {/* Category Miniature Image / Initial Avatar */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold border transition-transform group-hover:scale-105",
                  isActive ? "border-white/30 bg-white/20 text-white" : "border-gray-200 bg-gray-50 text-[#204B38]"
                )}
              >
                {image ? (
                  <img
                    src={image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{cat.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>

              {/* Name */}
              <span className="truncate max-w-[150px]">{cat.name}</span>

              {/* Optional Count badge */}
              {typeof count === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-[#358B5B]/15 group-hover:text-[#204B38]"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll categories right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-gray-200 shadow-md text-[#204B38] flex items-center justify-center hover:bg-[#204B38] hover:text-white transition-all cursor-pointer backdrop-blur-xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default CategoryFilterTabs;
