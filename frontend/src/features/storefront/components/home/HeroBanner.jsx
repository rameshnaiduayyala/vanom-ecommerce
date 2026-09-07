/**
 * HeroBanner.jsx — Full-width hero slider matching the exact reference design.
 * Visuals:
 * - Full photographic tabletop scene with electronics, home & kitchen appliances, laptop, plants, headphones, smartwatch
 * - Elegant typography: "Better Products / Brighter Everyday" with warm colors & serif accent
 * - Golden/Yellow rounded CTA button with Arrow
 * - Right side circular feature badges with dark green rounded icons ("Top Brands", "Great Prices", "Fast Delivery", "Easy Returns")
 * - Rounded slider navigation arrows and bottom dot indicators
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Award,
  BadgePercent,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    titleLine1: "Better",
    titleLine2: "Products",
    titleLine3: "Brighter",
    titleLine4: "Everyday",
    description: "Everything you need for your home, life and beyond.",
    ctaText: "Shop Now",
    ctaLink: ROUTES.PRODUCTS || "/products",
    image: "/hero-banner-main.jpg",
    sideFeatures: [
      { label: "Top Brands", icon: Award },
      { label: "Great Prices", icon: BadgePercent },
      { label: "Fast Delivery", icon: Truck },
      { label: "Easy Returns", icon: RotateCcw },
    ],
  },
  {
    id: "slide-2",
    titleLine1: "Premium",
    titleLine2: "Electronics",
    titleLine3: "Smart",
    titleLine4: "Living Deals",
    description: "Latest laptops, audio, smart watches & connected home appliances.",
    ctaText: "Explore Tech",
    ctaLink: ROUTES.PRODUCTS || "/products",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&q=85",
    sideFeatures: [
      { label: "Top Brands", icon: Award },
      { label: "Best Warranty", icon: Sparkles },
      { label: "Express Delivery", icon: Truck },
      { label: "7-Day Returns", icon: RotateCcw },
    ],
  },
  {
    id: "slide-3",
    titleLine1: "Bulk",
    titleLine2: "Procurement",
    titleLine3: "Wholesale",
    titleLine4: "Business Rates",
    description: "Custom bulk discounts, credit terms & dedicated account manager.",
    ctaText: "For Business",
    ctaLink: "/bulk-buyers",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
    sideFeatures: [
      { label: "GST Invoices", icon: Award },
      { label: "Volume Discounts", icon: BadgePercent },
      { label: "Priority Logistics", icon: Truck },
      { label: "Dedicated Manager", icon: RotateCcw },
    ],
  },
];

const SLIDE_DURATION = 6000;

export function HeroBanner({ banners = [] }) {
  const slides =
    banners.length > 0
      ? banners.map((b, i) => ({
          ...DEFAULT_SLIDES[i % DEFAULT_SLIDES.length],
          id: b.id,
          titleLine1: b.title || DEFAULT_SLIDES[0].titleLine1,
          titleLine2: "",
          titleLine3: b.subtitle || DEFAULT_SLIDES[0].titleLine3,
          titleLine4: "",
          description: b.description || DEFAULT_SLIDES[0].description,
          ctaText: b.buttonText || DEFAULT_SLIDES[0].ctaText,
          ctaLink: b.buttonLink || DEFAULT_SLIDES[0].ctaLink,
          image: b.imageUrl || DEFAULT_SLIDES[0].image,
        }))
      : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#eef2eb]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image Layer */}
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center">
        <img
          key={slide.id}
          src={slide.image}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover object-center sm:object-right transition-opacity duration-700"
          onError={(e) => {
            // fallback if local file is delayed
            e.target.src =
              "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?auto=format&fit=crop&w=1600&q=85";
          }}
        />

        {/* Soft gradient wash on the left to make text effortlessly legible while keeping photographic background visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/95 via-[#fdfbf7]/75 to-transparent sm:w-[65%] lg:w-[50%] z-0" />

        {/* Inner Content Grid */}
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 relative z-10 flex items-center justify-between">
          
          {/* ── LEFT: Typography & CTA matching reference ── */}
          <div className="max-w-md sm:max-w-lg">
            <h1 className="font-serif text-[2.2rem] sm:text-[3rem] lg:text-[3.5rem] leading-[1.08] tracking-tight text-[#1a382b]">
              <span className="block font-serif font-normal text-[#1e3c2f]">
                {slide.titleLine1} {slide.titleLine2}
              </span>
              <span className="block font-serif font-semibold text-[#8a5d2d] sm:text-[#966b36]">
                {slide.titleLine3} {slide.titleLine4}
              </span>
            </h1>

            <p className="text-gray-700 text-sm sm:text-base mt-3 sm:mt-4 max-w-sm leading-relaxed font-sans">
              {slide.description}
            </p>

            {/* CTA Button matching the reference bright gold/yellow pill */}
            <div className="mt-5 sm:mt-6">
              <Link
                to={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-[#F9BC15] hover:bg-[#eab012] text-[#003D2B] font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 group cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Feature Badges matching reference (circular green icons + clean label) ── */}
          <div className="hidden lg:flex flex-col gap-3 shrink-0">
            {slide.sideFeatures?.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/70 hover:bg-white/95 backdrop-blur-md rounded-full py-1.5 pl-2 pr-4 border border-white/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#003D2B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <IconComp className="w-4 h-4 text-[#e2f0d9]" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── Navigation Arrows matching reference ── */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ── Dot Indicators matching reference (center bottom) ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-6 bg-[#003D2B]"
                  : "w-2 bg-gray-400/60 hover:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;

