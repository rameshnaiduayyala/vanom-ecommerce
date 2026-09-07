/**
 * HeroBanner.jsx — Full-width hero slider matching the reference design.
 * Layout: [Left Text] [Center Product Image] [Right Feature Cards]
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?auto=format&fit=crop&w=800&q=90";

const SIDE_ITEMS = [
  { label: "Top Brands", icon: "🏆" },
  { label: "Great Prices", icon: "💰" },
  { label: "Fast Delivery", icon: "🚀" },
  { label: "Easy Returns", icon: "🔄" },
];

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    badge: "New Arrivals",
    titleLine1: "Better Products",
    titleLine2: "Brighter Everyday",
    description: "Everything you need for your home, life and beyond.",
    ctaText: "Shop Now",
    ctaLink: ROUTES.PRODUCTS,
    bg: "from-[#003D2B] via-[#004d35] to-[#006B3C]",
    image: HERO_IMAGE,
    sideItems: SIDE_ITEMS,
  },
  {
    id: "slide-2",
    badge: "Flash Sale",
    titleLine1: "Up to 50% Off",
    titleLine2: "Top Deals This Week",
    description: "Unbeatable prices on premium home and kitchen essentials.",
    ctaText: "Shop Deals",
    ctaLink: ROUTES.PRODUCTS,
    bg: "from-[#0f172a] via-[#1e293b] to-[#0f3460]",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=90",
    sideItems: SIDE_ITEMS,
  },
  {
    id: "slide-3",
    badge: "B2B Enterprise",
    titleLine1: "Wholesale Pricing",
    titleLine2: "For Your Business",
    description: "Bulk orders, custom quotes, and dedicated account management.",
    ctaText: "Get a Quote",
    ctaLink: ROUTES.B2B?.DASHBOARD || "/b2b",
    bg: "from-[#1b0036] via-[#3d0066] to-[#6b0099]",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=90",
    sideItems: [
      { label: "Bulk Orders", icon: "📦" },
      { label: "Custom Quotes", icon: "📋" },
      { label: "Dedicated Support", icon: "🎯" },
      { label: "Net-30 Terms", icon: "💳" },
    ],
  },
];

const SLIDE_DURATION = 5000;

export function HeroBanner({ banners = [] }) {
  const slides =
    banners.length > 0
      ? banners.map((b, i) => ({
          ...DEFAULT_SLIDES[i % DEFAULT_SLIDES.length],
          id: b.id,
          badge: b.badgeText || DEFAULT_SLIDES[0].badge,
          titleLine1: b.title || DEFAULT_SLIDES[0].titleLine1,
          titleLine2: b.subtitle || DEFAULT_SLIDES[0].titleLine2,
          description: b.description || DEFAULT_SLIDES[0].description,
          ctaText: b.buttonText || DEFAULT_SLIDES[0].ctaText,
          ctaLink: b.buttonLink || DEFAULT_SLIDES[0].ctaLink,
          image: b.imageUrl || DEFAULT_SLIDES[0].image,
        }))
      : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-r ${slide.bg}`}
      style={{ minHeight: 280 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Inner layout: 3 columns */}
      <div className="max-w-[1400px] mx-auto relative flex items-center min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]">

        {/* ── LEFT: Text & CTA ── */}
        <div className="flex-1 px-8 sm:px-12 py-10 z-10 max-w-sm lg:max-w-md">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A514] animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black text-white leading-[1.15] tracking-tight mb-3">
            {slide.titleLine1}
            {slide.titleLine2 && (
              <>
                <br />
                <span className="text-[#D9A514]">{slide.titleLine2}</span>
              </>
            )}
          </h1>

          <p className="text-white/75 text-sm mb-6 leading-relaxed">{slide.description}</p>

          {/* CTA Button */}
          <Link
            to={slide.ctaLink}
            className="inline-flex items-center gap-2 bg-[#D9A514] hover:bg-[#c49010] text-[#003D2B] font-bold px-6 py-2.5 rounded-full text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
          >
            {slide.ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── CENTER: Product hero image ── */}
        <div className="hidden sm:flex flex-1 items-end justify-center self-stretch relative select-none pointer-events-none overflow-hidden">
          <img
            key={slide.id}
            src={slide.image}
            alt="Featured products"
            className="absolute bottom-0 h-[105%] w-auto max-w-none object-contain object-bottom drop-shadow-2xl"
            style={{
              maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
            }}
          />
        </div>

        {/* ── RIGHT: Feature Cards ── */}
        <div className="hidden lg:flex flex-col gap-2 pr-8 shrink-0 z-10">
          {slide.sideItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-white/12 hover:bg-white/22 backdrop-blur-md border border-white/15 rounded-xl px-4 py-2.5 min-w-[148px] transition-all duration-200 cursor-pointer group"
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-white text-xs font-semibold flex-1">{item.label}</span>
              <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? "w-5 bg-[#D9A514]" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;
