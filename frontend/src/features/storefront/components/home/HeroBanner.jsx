/**
 * HeroBanner.jsx — Full-width hero slider with automatic scroll & vertical right-side dots.
 * Visuals:
 * - Smooth auto-scrolling photographic tabletop scenes (Groceries, Organic Staples, Tech, etc.)
 * - Elegant typography & gold rounded CTA button
 * - Right-side circular feature badges & vertical dot indicators
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgePercent,
  Truck,
  RotateCcw,
  Sparkles,
  Leaf,
  ShoppingBasket,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

const DEFAULT_SLIDES = [
  {
    id: "slide-groceries-1",
    titleLine1: "Fresh & Organic",
    titleLine2: "Groceries",
    titleLine3: "Farm To",
    titleLine4: "Kitchen",
    description: "Daily cold-pressed oils, aged Himalayan basmati rice, raw honey, and 100% certified organic pantry staples.",
    ctaText: "Shop Groceries",
    ctaLink: `${ROUTES.PRODUCTS}?category=groceries`,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85",
    sideFeatures: [
      { label: "100% Organic", icon: Leaf },
      { label: "Farm Fresh", icon: Sparkles },
      { label: "Same-Day Delivery", icon: Truck },
      { label: "Lab Certified", icon: ShieldCheck },
    ],
  },
  {
    id: "slide-groceries-2",
    titleLine1: "Pure Pantry",
    titleLine2: "Superfoods",
    titleLine3: "Health In",
    titleLine4: "Every Bite",
    description: "First-harvest ceremonial matcha, California almonds, raw seeds, spices and Ayurvedic wellness essentials.",
    ctaText: "Explore Superfoods",
    ctaLink: `${ROUTES.PRODUCTS}?category=groceries`,
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=85",
    sideFeatures: [
      { label: "Raw & Unprocessed", icon: ShoppingBasket },
      { label: "Best Value", icon: BadgePercent },
      { label: "Zero Additives", icon: Award },
      { label: "Express Shipping", icon: Truck },
    ],
  },
  {
    id: "slide-1",
    titleLine1: "Better",
    titleLine2: "Products",
    titleLine3: "Brighter",
    titleLine4: "Everyday",
    description: "Everything you need for your home, kitchen, life and beyond.",
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

const AUTO_SCROLL_INTERVAL = 4500;

export function HeroBanner({ banners = [] }) {
  const slides = DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [next, current]);

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden bg-[#eef2eb]">
      {/* Background Image Layer with Crossfade */}
      <div className="relative w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[620px] flex items-center">
        {slides.map((s, idx) => (
          <img
            key={s.id}
            src={s.image}
            alt="Hero background"
            className={`absolute inset-0 w-full h-full object-cover object-center sm:object-right transition-opacity duration-1000 ease-in-out ${
              idx === current ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            }`}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85";
            }}
          />
        ))}

        {/* Soft gradient wash on the left to make text effortlessly legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf7]/95 via-[#fdfbf7]/85 to-transparent sm:w-[65%] lg:w-[48%] z-1" />

        {/* Inner Content Grid */}
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14 relative z-10 flex items-center justify-between">
          {/* ── LEFT: Typography & CTA ── */}
          <div className="max-w-lg sm:max-w-xl transition-all duration-500 key={current}">
            <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] lg:text-[3.8rem] leading-[1.08] tracking-tight text-[#1a382b]">
              <span className="block font-serif font-normal text-[#1e3c2f]">
                {slide.titleLine1} {slide.titleLine2}
              </span>
              <span className="block font-serif font-semibold text-[#8a5d2d] sm:text-[#966b36]">
                {slide.titleLine3} {slide.titleLine4}
              </span>
            </h1>

            <p className="text-gray-700 text-sm sm:text-base mt-4 sm:mt-5 max-w-md leading-relaxed font-sans">
              {slide.description}
            </p>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-7">
              <Link
                to={slide.ctaLink}
                className="inline-flex items-center gap-2.5 bg-[#F9BC15] hover:bg-[#eab012] text-[#003D2B] font-bold text-sm sm:text-base px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 group cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Feature Badges ── */}
          <div className="hidden lg:flex flex-col gap-3 shrink-0">
            {slide.sideFeatures?.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/80 hover:bg-white/95 backdrop-blur-md rounded-full py-1.5 pl-2 pr-4 border border-white/70 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
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

        {/* ── Right-Side Vertical Small Dot Indicators ── */}
        <div className="absolute right-3.5 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 z-20 bg-black/25 backdrop-blur-md px-1.5 py-3 rounded-full border border-white/20 shadow-md">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-500 cursor-pointer ${
                i === current
                  ? "h-5 w-1.5 bg-[#F9BC15] shadow-xs"
                  : "h-1.5 w-1.5 bg-white/60 hover:bg-white hover:scale-125"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
