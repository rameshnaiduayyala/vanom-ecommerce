/**
 * HeroBanner.jsx — Full-width hero banner slider with automatic scroll & vertical right-side dots.
 * Displays admin-uploaded banners directly with link to product or category.
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes.js";
import { useStoreSettingsStore } from "@/stores/store.store.js";

const AUTO_SCROLL_INTERVAL = 4500;

export function HeroBanner({ banners = [] }) {
  const { store, fetchPublicStore } = useStoreSettingsStore();

  useEffect(() => {
    fetchPublicStore();
  }, [fetchPublicStore]);

  const customBanners = Array.isArray(store?.metadata?.heroBanners)
    ? store.metadata.heroBanners
    : [];

  const slides = useMemo(() => {
    if (banners.length > 0) return banners;
    return customBanners;
  }, [banners, customBanners]);

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  // If no banners are added by admin, don't show empty block
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 select-none">
      <div className="relative w-full">
        {slides.map((s, idx) => (
          <Link
            key={s.id || idx}
            to={s.ctaLink || ROUTES.PRODUCTS || "/products"}
            className={`w-full cursor-pointer transition-opacity duration-700 ease-in-out ${
              idx === 0 ? "relative block" : "absolute inset-0"
            } ${
              idx === current
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={s.image}
              alt="Hero banner"
              className="block w-full h-auto"
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </Link>
        ))}

        {/* Vertical Dot Indicators */}
        {slides.length > 1 && (
          <div className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-2 z-20 bg-black/40 backdrop-blur-md px-1 sm:px-1.5 py-2 sm:py-3 rounded-full border border-white/20 shadow-md">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === current
                    ? "h-3.5 sm:h-5 w-1 sm:w-1.5 bg-[#F9BC15] shadow-xs"
                    : "h-1 sm:h-1.5 w-1 sm:w-1.5 bg-white/60 hover:bg-white hover:scale-125"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroBanner;
