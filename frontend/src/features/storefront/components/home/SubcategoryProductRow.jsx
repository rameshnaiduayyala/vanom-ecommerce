import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, PackageOpen } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useCountryStore } from "../../../../stores/country.store.js";
import { ProductCardCompact } from "./ProductCardCompact.jsx";

/**
 * SubcategoryProductRow — Individual subcategory section
 * Displays the Subcategory Name, View All link, and a clean Swiper carousel
 * with prominent side arrows matching user mockup.
 */
export function SubcategoryProductRow({
  subcategory,
  fallbackProducts = [],
}) {
  const swiperRef = useRef(null);
  const { country } = useCountryStore();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const subcategoryId = subcategory?.id || subcategory?.slug;
  const subcategoryName = subcategory?.name || "Products";
  const subcategoryImage = subcategory?.imageUrl || subcategory?.image || subcategory?.thumbnail;

  // Query products for this specific subcategory
  const { data, isLoading } = useQuery({
    queryKey: ["subcategory-products", subcategoryId, country.code],
    queryFn: async () => {
      if (!subcategoryId) return null;
      try {
        const res = await Api.catalog.getProducts({
          categoryId: subcategoryId,
          limit: 20,
        });
        return res;
      } catch {
        return null;
      }
    },
    enabled: Boolean(subcategoryId),
    staleTime: 3 * 60 * 1000,
  });

  // Normalize product lists
  const normalizeList = (raw) =>
    Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
      ? raw
      : [];

  const rawProducts = normalizeList(data);
  const products = rawProducts.length > 0
    ? rawProducts
    : fallbackProducts.filter(
        (p) =>
          p.categoryId === subcategoryId ||
          p.category?.id === subcategoryId ||
          p.category?.slug === subcategoryId
      );

  // If loading and no products yet, show skeleton slides
  if (!isLoading && products.length === 0) {
    return null; // Keep layout clean if a subcategory has no products yet
  }

  const viewAllLink = `/products?category=${encodeURIComponent(subcategoryId)}`;

  return (
    <div className="w-full space-y-3.5 pt-2">
      {/* ── Subcategory Header Row (Matching Uploaded Mockup) ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {subcategoryImage ? (
            <img
              src={subcategoryImage}
              alt={subcategoryName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#204B38]/20 bg-white shadow-2xs shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EAF5EF] text-[#204B38] font-black text-xs flex items-center justify-center border border-[#B7E0CA] shrink-0">
              {subcategoryName.charAt(0).toUpperCase()}
            </div>
          )}

          <h4 className="text-base sm:text-lg lg:text-xl font-bold text-[#1E3B2B] tracking-tight">
            {subcategoryName}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2F734A] hover:text-[#1E3B2B] transition-colors"
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
                isBeginning ? "opacity-35 cursor-not-allowed" : "hover:bg-[#204B38] hover:text-white cursor-pointer active:scale-95"
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
                isEnd ? "opacity-35 cursor-not-allowed" : "hover:bg-[#204B38] hover:text-white cursor-pointer active:scale-95"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Carousel Container with Floating Side Arrow ── */}
      <div className="relative group/carousel">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs animate-pulse flex flex-col space-y-3"
              >
                <div className="aspect-square bg-gray-100 rounded-xl" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-lg w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              modules={[Navigation, FreeMode]}
              freeMode={{ enabled: true, momentum: true }}
              spaceBetween={14}
              slidesPerView={2}
              breakpoints={{
                480: { slidesPerView: 2.3, spaceBetween: 14 },
                640: { slidesPerView: 3, spaceBetween: 16 },
                768: { slidesPerView: 3.5, spaceBetween: 18 },
                1024: { slidesPerView: 4.2, spaceBetween: 18 },
                1280: { slidesPerView: 5, spaceBetween: 20 },
              }}
              className="!py-1"
            >
              {products.map((p, idx) => (
                <SwiperSlide key={p.id || p._id || idx} className="!h-auto flex">
                  <div className="w-full flex">
                    <ProductCardCompact product={p} badge={p.badge} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Prominent floating right side arrow matching the user's circle highlight */}
            {!isEnd && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next slide"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200/90 text-[#204B38] shadow-md flex items-center justify-center hover:bg-[#204B38] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Floating left side arrow */}
            {!isBeginning && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous slide"
                className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200/90 text-[#204B38] shadow-md flex items-center justify-center hover:bg-[#204B38] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SubcategoryProductRow;

