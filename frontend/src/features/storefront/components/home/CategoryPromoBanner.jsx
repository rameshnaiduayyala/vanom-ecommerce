import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { ROUTES } from "../../../../constants/routes.js";

/**
 * CategoryPromoBanner — Reusable Category Advertisement Banner
 * Displays the FULL banner image at its natural proportions without any cropping.
 * Renders ONLY when a category has one or more banner images configured.
 * If no banner image exists, returns null (clean, no default fallback banners).
 *
 * @param {Object} props
 * @param {Object} props.category - The main category object
 * @param {Object} [props.banner] - Optional banner overrides
 * @param {string} [props.className] - Extra Tailwind styling
 */
export function CategoryPromoBanner({
  category,
  banner = null,
  className = "",
}) {
  const swiperRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!category) return null;

  const categoryName = category.name || "Special Collection";
  const categorySlug = category.slug || category.id;

  // Extract all valid banner image URLs
  const getBannerImages = () => {
    // 1. Explicit array on category
    if (Array.isArray(category.categoryBannerImages) && category.categoryBannerImages.length > 0) {
      return category.categoryBannerImages.filter(Boolean);
    }
    // 2. Array in banner override prop
    if (Array.isArray(banner?.images) && banner.images.length > 0) {
      return banner.images.filter(Boolean);
    }
    // 3. String value (either JSON array string or direct single image URL)
    const raw =
      category.categoryBannerImage ||
      category.bannerImage ||
      banner?.bannerImage ||
      banner?.imageUrl;

    if (typeof raw === "string" && raw.trim()) {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(Boolean);
          }
        } catch {
          return [trimmed];
        }
      }
      return [trimmed];
    }

    return [];
  };

  const bannerImages = getBannerImages();

  // STRICT REQUIREMENT: If no banner images are provided, do NOT show any banner
  if (bannerImages.length === 0) {
    return null;
  }

  const ctaLink =
    banner?.ctaLink ||
    `${ROUTES.PRODUCTS}?category=${encodeURIComponent(categorySlug)}`;

  const ctaText = banner?.ctaText || "Shop Now";

  // ── Single Banner Image Mode (Full Image, Never Cropped) ──
  if (bannerImages.length === 1) {
    return (
      <section
        className={`group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-transparent transition-all duration-300 ${className}`}
      >
        <Link
          to={ctaLink}
          aria-label={`${ctaText} - ${categoryName}`}
          className="relative block w-full overflow-hidden rounded-xl sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <img
            src={bannerImages[0]}
            alt={categoryName}
            loading="lazy"
            className="block w-full h-auto rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-[1.008]"
          />
        </Link>
      </section>
    );
  }

  // ── Multiple Banner Images: Auto-scrolling Carousel (Full Images, Never Cropped) ──
  return (
    <section
      className={`group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-transparent transition-all duration-300 shadow-2xs hover:shadow-md select-none ${className}`}
    >
      <Swiper
        modules={[Autoplay]}
        autoHeight={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveSlide(swiper.realIndex);
        }}
        autoplay={{
          delay: 3800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={700}
        className="w-full rounded-xl sm:rounded-2xl overflow-hidden"
      >
        {bannerImages.map((imgUrl, idx) => (
          <SwiperSlide key={idx} className="w-full !h-auto">
            <Link
              to={ctaLink}
              aria-label={`${ctaText} - ${categoryName} (Banner ${idx + 1})`}
              className="relative block w-full overflow-hidden rounded-xl sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <img
                src={imgUrl}
                alt={`${categoryName} banner ${idx + 1}`}
                loading={idx === 0 ? "eager" : "lazy"}
                className="block w-full h-auto rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-[1.008]"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows (Visible on desktop hover) */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous banner"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white backdrop-blur-md shadow-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hidden sm:flex active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white backdrop-blur-md shadow-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hidden sm:flex active:scale-95"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Centered Pagination Pill */}
      {bannerImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md shadow-xs pointer-events-auto">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => swiperRef.current?.slideToLoop(idx)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? "w-5 h-1.5 bg-white shadow-xs"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryPromoBanner;
