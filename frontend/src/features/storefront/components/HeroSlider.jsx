import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Globe,
  ShoppingBag,
} from "lucide-react";

const SLIDE_DURATION = 6000;

export function HeroSlider({ products = [] }) {
  const { country } = useCountryStore();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Slides inspired by the reference banner design
  const slides = useMemo(() => {
    return [
      {
        id: "curated-collection",
        category: "Web Banner Design",
        titleLine1: "Creative Banner",
        titleLine2: "Design",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
        bgGradient: "from-[#C59B76] via-[#B88E68] to-[#A0754F]",
        accentBg: "#8F643E",
        textColor: "text-[#FAF6F0]",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=85",
        ctaText: "Shop Now",
        ctaLink: ROUTES.PRODUCTS,
        contactText: "CONTACT US",
        urlText: "www.yourwebsite.com",
      },
      {
        id: "smart-tech",
        category: "Next-Gen Electronics",
        titleLine1: "Smart Hardware &",
        titleLine2: "POS Solutions",
        description:
          "Commercial-grade surveillance, point-of-sale barcode equipment, and industrial hardware backed by warranty and worldwide express shipping.",
        bgGradient: "from-[#0F3826] via-[#0A4F30] to-[#06331E]",
        accentBg: "#0E5A37",
        textColor: "text-[#EAF5ED]",
        image:
          "https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=1000&q=85",
        ctaText: "Explore Tech",
        ctaLink: ROUTES.PRODUCTS,
        contactText: "ENTERPRISE PORTAL",
        urlText: "pos.vanomcommerce.com",
      },
      {
        id: "packaging-logistics",
        category: "Sustainable Packaging",
        titleLine1: "Heavy-Duty Cartons &",
        titleLine2: "Shipping Supplies",
        description:
          "Industrial corrugated boxes, eco-friendly mailers, stretch film, and custom pallet packaging trusted by global logistics leaders.",
        bgGradient: "from-[#2A3B52] via-[#1E2C3F] to-[#141F2E]",
        accentBg: "#374A63",
        textColor: "text-[#F0F4F8]",
        image:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85",
        ctaText: "Browse Supplies",
        ctaLink: ROUTES.PRODUCTS,
        contactText: "WHOLESALE DIRECT",
        urlText: "supply.vanomcommerce.com",
      },
      {
        id: "lifestyle-living",
        category: "Modern Living & Decor",
        titleLine1: "Architectural Decor &",
        titleLine2: "Luxury Essentials",
        description:
          "Minimalist furnishings, ergonomic ambient lighting, and architectural lifestyle goods designed for modern residences and hospitality.",
        bgGradient: "from-[#8B4C39] via-[#783E2D] to-[#602F21]",
        accentBg: "#9E5843",
        textColor: "text-[#FDF5F2]",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
        ctaText: "Discover Living",
        ctaLink: ROUTES.PRODUCTS,
        contactText: "DESIGN COLLECTION",
        urlText: "decor.vanomcommerce.com",
      },
    ];
  }, []);

  const totalSlides = slides.length;

  const goToSlide = useCallback((idx) => {
    setCurrent(idx);
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    goToSlide((current - 1 + totalSlides) % totalSlides);
  }, [current, totalSlides, goToSlide]);

  const handleNext = useCallback(() => {
    goToSlide((current + 1) % totalSlides);
  }, [current, totalSlides, goToSlide]);

  // Autoplay ticker
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setCurrent((prev) => (prev + 1) % totalSlides);
      }
    }, 40);
    return () => clearInterval(tick);
  }, [current, isPaused, totalSlides]);

  const s = slides[current] || slides[0];

  return (
    <div className="w-full overflow-hidden select-none bg-slate-950">
      <section
        className="relative w-full overflow-hidden transition-all duration-700"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Promotional Banner Slider"
      >
        {/* FULL-WIDTH BACKGROUND GRADIENT */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${s.bgGradient} transition-colors duration-700 z-0`}
        />

        {/* Dynamic Vector Wave & Curve Overlays spanning full width */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 460"
          preserveAspectRatio="none"
        >
          <path
            d="M0,240 C320,130 440,360 800,210 C1100,90 1280,280 1440,180 L1440,460 L0,460 Z"
            fill="currentColor"
            className="text-white/10"
          />
          <path
            d="M0,120 C380,270 620,90 950,220 C1200,320 1350,160 1440,230"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <path
            d="M200,460 C500,230 800,380 1200,150 C1350,75 1400,190 1440,140"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Geometric Plus (+) Accent Markers */}
        <div className="absolute top-8 left-[46%] text-white/40 pointer-events-none z-10 hidden sm:block">
          <Plus className="w-5 h-5 stroke-[3]" />
        </div>
        <div className="absolute bottom-10 right-[10%] text-white/40 pointer-events-none z-10 hidden sm:block">
          <Plus className="w-6 h-6 stroke-[3]" />
        </div>

        {/* MAIN SLIDE CONTAINER - BALANCED HEIGHT */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16 min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
            
            {/* LEFT COLUMN: Category, Bold Headline, Description, Contact Bar */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-3.5 sm:space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`left-content-${s.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Category / Sub-heading */}
                  <div className="inline-flex items-center">
                    <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90">
                      {s.category}
                    </span>
                  </div>

                  {/* Main Creative Headline */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.9rem] font-extrabold text-white tracking-tight leading-[1.12]">
                    <span className="block">{s.titleLine1}</span>
                    <span className="block text-white/95 mt-1 font-black">
                      {s.titleLine2}
                    </span>
                  </h1>

                  {/* Description text */}
                  <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed text-white/85 max-w-lg font-normal line-clamp-3 sm:line-clamp-none">
                    {s.description}
                  </p>

                  {/* CTA & Contact / Brand Bar */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                    <Link
                      to={s.ctaLink}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.98] shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-800" />
                      <span>{s.ctaText}</span>
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    </Link>

                    <div className="text-white/90 text-xs sm:text-sm">
                      <span className="block text-[10px] font-bold tracking-wider text-white/70 uppercase">
                        {s.contactText}
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Globe className="w-3.5 h-3.5 text-white/80" />
                        <span>{s.urlText}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Stylized Double-Layer Rounded Image Frame */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-frame-${s.id}`}
                  initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.94, rotate: 2 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] h-[230px] sm:h-[280px] lg:h-[320px] flex items-center justify-center"
                >
                  {/* Outer Asymmetric Offset Backdrop Shape */}
                  <div
                    className="absolute inset-0 rounded-[2.2rem] sm:rounded-[2.8rem] transform rotate-[-4deg] scale-[1.03] transition-colors duration-500 shadow-xl"
                    style={{ backgroundColor: s.accentBg }}
                  />

                  {/* Secondary Inner Frosted Frame Accent */}
                  <div className="absolute inset-2 rounded-[2rem] sm:rounded-[2.5rem] border border-white/30 pointer-events-none z-10" />

                  {/* White Border Picture Frame */}
                  <div className="relative w-full h-full rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-2.5 bg-white shadow-2xl overflow-hidden z-20">
                    <div className="relative w-full h-full rounded-[1.6rem] sm:rounded-[2.1rem] overflow-hidden bg-slate-100">
                      <img
                        src={s.image}
                        alt={s.titleLine1}
                        className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* BOTTOM CONTROLS BAR */}
        <div className="relative z-20 px-4 sm:px-8 lg:px-12 py-2.5 bg-black/20 backdrop-blur-xs border-t border-white/10 flex items-center justify-between">
          
          {/* Slide Navigation Dots / Progress */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((_, idx) => {
              const isActive = current === idx;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? "w-7 sm:w-9 bg-white/30"
                      : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Prev / Next Arrow Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/70 font-mono mr-1.5 hidden sm:inline">
              0{current + 1} / 0{totalSlides}
            </span>

            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}

export default HeroSlider;
