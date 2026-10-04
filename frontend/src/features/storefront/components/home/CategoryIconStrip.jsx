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
  const items = Array.isArray(categories) ? categories : [];

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * 320,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`w-full bg-[#FBFDFB] border-b border-[#E3ECE6] py-3 select-none ${className}`}>
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 relative flex items-center">

        {/* Compact Navigation Left */}
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous categories"
          className="flex absolute left-1 sm:left-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-[#D5E4DB] shadow-md hover:shadow-lg items-center justify-center text-[#264D3B] hover:bg-[#264D3B] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Scrollable Compact Category Icons Strip */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-none scroll-smooth px-8 sm:px-10 md:px-10 w-full overscroll-x-contain"
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
                className="group shrink-0 flex flex-col items-center gap-1.5 py-1 px-1 cursor-pointer"
              >
                {/* Clean Smart Circle Icon */}
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-[#358B5B] ring-offset-2 ring-offset-white shadow-xs"
                      : "ring-1 ring-[#D8E6DE] group-hover:ring-[#358B5B]/70 group-hover:scale-105"
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    {image ? (
                      <img
                        src={image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#EAF5EF] to-[#D5EBDC] flex items-center justify-center text-[#264D3B] text-base font-bold">
                        {cat.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimal Label */}
                <span
                  className={`text-[11px] sm:text-xs tracking-tight text-center max-w-[80px] sm:max-w-[90px] truncate transition-colors duration-200 ${
                    isActive
                      ? "text-[#264D3B] font-bold"
                      : "text-[#3D5249] font-medium group-hover:text-[#264D3B]"
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}

          {/* Quick "All" Action */}
          <Link
            to={ROUTES.PRODUCTS}
            className="group shrink-0 flex flex-col items-center gap-1.5 py-1 px-1 cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-dashed border-[#A7C8B5] bg-white group-hover:bg-[#EBF5EF] group-hover:border-[#358B5B] flex items-center justify-center text-[#264D3B] transition-all duration-300 group-hover:scale-105">
              <Grid className="w-5 h-5 text-[#358B5B]" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#264D3B] tracking-tight">
              All
            </span>
          </Link>
        </div>

        {/* Compact Navigation Right */}
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next categories"
          className="flex absolute right-1 sm:right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-[#D5E4DB] shadow-md hover:shadow-lg items-center justify-center text-[#264D3B] hover:bg-[#264D3B] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

      </div>
    </div>
  );
}

export default CategoryIconStrip;