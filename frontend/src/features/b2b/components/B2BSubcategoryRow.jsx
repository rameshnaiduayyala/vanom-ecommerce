import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { ROUTES } from "../../../constants/routes.js";
import { B2BProductCard } from "./B2BProductCard.jsx";

/**
 * B2BSubcategoryRow — Horizontal carousel / slider for B2B wholesale commodities
 * matching B2C SubcategoryProductRow design.
 */
export function B2BSubcategoryRow({
  subcategory,
  products = [],
  targetCountryCode,
  currencyCode,
  currencySymbol,
}) {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!products || products.length === 0) return null;

  const subcategoryName = subcategory?.name || "Commodities";
  const subcategoryImage =
    subcategory?.imageUrl || subcategory?.image || subcategory?.thumbnail;

  const bulkOrderCategoryLink = `${ROUTES.B2B.BULK_ORDER}?category=${encodeURIComponent(
    subcategoryName
  )}`;

  return (
    <div className="w-full space-y-3 pt-2">
      {/* ── Subcategory Header Row ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {subcategoryImage ? (
            <img
              src={subcategoryImage}
              alt={subcategoryName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#006B3C]/20 bg-white shadow-2xs shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-[#006B3C] font-black text-xs flex items-center justify-center border border-emerald-200 shrink-0">
              {subcategoryName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{subcategoryName}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={bulkOrderCategoryLink}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#006B3C] hover:text-emerald-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Carousel Arrows in Header */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              aria-label="Previous items"
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-700 shadow-2xs transition-all ${
                isBeginning
                  ? "opacity-35 cursor-not-allowed"
                  : "hover:bg-[#006B3C] hover:text-white cursor-pointer active:scale-95"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              aria-label="Next items"
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-700 shadow-2xs transition-all ${
                isEnd
                  ? "opacity-35 cursor-not-allowed"
                  : "hover:bg-[#006B3C] hover:text-white cursor-pointer active:scale-95"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Carousel Container ── */}
      <div className="relative group/carousel">
        {/* Floating Left Arrow */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isBeginning}
          aria-label="Scroll left"
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all ${
            isBeginning
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100 hover:bg-[#006B3C] hover:text-white active:scale-95"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Floating Right Arrow */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isEnd}
          aria-label="Scroll right"
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all ${
            isEnd
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100 hover:bg-[#006B3C] hover:text-white active:scale-95"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Navigation, FreeMode]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          freeMode={{ enabled: true, momentum: true }}
          grabCursor={true}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 16 },
            640: { slidesPerView: 2.2, spaceBetween: 16 },
            768: { slidesPerView: 2.6, spaceBetween: 18 },
            1024: { slidesPerView: 3.2, spaceBetween: 20 },
            1280: { slidesPerView: 3.8, spaceBetween: 22 },
          }}
          className="pb-2 pt-1"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="h-auto">
              <div className="h-full">
                <B2BProductCard
                  product={product}
                  targetCountryCode={targetCountryCode}
                  currencyCode={currencyCode}
                  currencySymbol={currencySymbol}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default B2BSubcategoryRow;
