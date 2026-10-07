import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Grid } from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

export function CategoryIconStrip({
  categories = [],
  activeCategory = null,
  className = "",
}) {
  const scrollRef = useRef(null);

  const items = Array.isArray(categories)
    ? [...categories].sort((a, b) => {
      const orderA =
        a.sortOrder !== undefined && a.sortOrder !== null
          ? Number(a.sortOrder)
          : 0;

      const orderB =
        b.sortOrder !== undefined && b.sortOrder !== null
          ? Number(b.sortOrder)
          : 0;

      if (orderA !== orderB) return orderA - orderB;

      return (a.name || "").localeCompare(b.name || "");
    })
    : [];

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Category Navigation"
      className={`w-full bg-[#F1F5D6] select-none py-2 ${className}`}
    >
      <div className="relative max-w-[1440px] mx-auto px-2 sm:px-6 flex items-center">

        {/* Scroll Left Button (for mobile / tablet) */}
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous categories"
          className="lg:hidden flex absolute left-1 sm:left-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full items-center justify-center bg-white/95 border border-[#D5E4DB] text-[#264D3B] shadow-md hover:bg-[#264D3B] hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Category Pills Track: Centered, clean, transparent */}
        <div
          ref={scrollRef}
          className="flex items-center justify-start lg:justify-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none px-6 sm:px-10 lg:px-0 py-1.5 w-full scroll-smooth"
        >
          {items.map((cat, idx) => {
            const isFirst = idx === 0 && !activeCategory;
            const isActive =
              activeCategory === cat.id ||
              activeCategory === cat.slug ||
              isFirst;

            const image =
              cat.image ||
              cat.imageUrl ||
              cat.thumbnail ||
              cat.categoryImage;

            return (
              <Link
                key={cat.id || cat.slug || idx}
                to={`${ROUTES.PRODUCTS}?category=${cat.id || cat.slug}`}
                className="group shrink-0 flex items-center gap-2.5 py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer border hover:bg-[#F1F5D6] hover:border-[#2E6B4A]/50 text-gray-700 hover:text-[#1E4D34] hover:shadow-xs hover:-translate-y-0.5"
              >
                {/* Clean Micro Image */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#EAF5EF] flex items-center justify-center text-[#264D3B] text-[11px] font-bold">
                      {cat.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Category Label */}
                <span className="text-xs sm:text-[13px] tracking-tight truncate font-semibold pr-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}

          {/* Quick "All" Button */}
          <Link
            to={ROUTES.PRODUCTS}
            className="group shrink-0 flex items-center gap-2 py-1.5 px-3 rounded-full border border-dashed border-gray-300 hover:border-[#2E6B4A] bg-white/70 hover:bg-white text-gray-600 hover:text-[#1E4D34] transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#264D3B] group-hover:bg-[#264D3B] group-hover:text-white transition-colors shrink-0">
              <Grid className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold tracking-tight pr-1">
              All
            </span>
          </Link>
        </div>

        {/* Scroll Right Button (for mobile / tablet) */}
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next categories"
          className="lg:hidden flex absolute right-1 sm:right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full items-center justify-center bg-white/95 border border-[#D5E4DB] text-[#264D3B] shadow-md hover:bg-[#264D3B] hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </nav>
  );
}

export default CategoryIconStrip;