import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { getLiveProducts } from "../../../services/api/mock-data.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SLIDE_DURATION = 5500;

export function HeroSlider({ products = [] }) {
  const { country } = useCountryStore();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dynamic live catalog extraction
  const catalogList = useMemo(() => {
    const raw = products.length > 0 ? products : getLiveProducts();
    return raw.slice(0, 4).map((p, idx) => {
      const pricingObj = p.pricing?.[country.code] || p.pricing?.US || {};
      const retailPrice = Number(pricingObj.retailPrice || 42.0);

      const themes = [
        {
          eyebrow: "Global Commerce",
          titleLine1: "Premium Products,",
          titleLine2: "Delivered Worldwide",
          subtitle: "Explore our curated catalog of consumer tech, lifestyle essentials, packaging, and commercial equipment with express delivery across US and UK.",
          heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "50K+", label: "Customers" },
            { value: "30+", label: "Countries" },
            { value: "100%", label: "Verified" },
          ],
        },
        {
          eyebrow: "Packaging Essentials",
          titleLine1: "Heavy-Duty Packaging &",
          titleLine2: "Quality Supplies",
          subtitle: "High-grade shipping materials, heavy-duty cartons, stretch films, and premium culinary staples delivered directly to your doorstep.",
          heroImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "24hr", label: "Dispatch" },
            { value: "4.9★", label: "Rating" },
            { value: "Secure", label: "Payments" },
          ],
        },
        {
          eyebrow: "Smart Technology",
          titleLine1: "Smart POS Systems &",
          titleLine2: "Professional Hardware",
          subtitle: "Commercial-grade surveillance cameras, point-of-sale barcode equipment, and industrial hardware backed by warranty.",
          heroImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "1,200+", label: "SKUs" },
            { value: "Warranty", label: "Backed" },
            { value: "Live", label: "Tracking" },
          ],
        },
      ];

      const theme = themes[idx % themes.length];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        category: p.category || "General Catalog",
        brand: p.brand || "Vanom",
        description: p.description || theme.subtitle,
        image: p.image || theme.heroImage,
        packaging: p.packaging?.unitName || "Unit",
        retailPrice,
        ...theme,
      };
    });
  }, [products, country.code]);

  useEffect(() => {
    if (isPaused || catalogList.length <= 1) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setCurrent((prev) => (prev + 1) % catalogList.length);
      }
    }, 40);
    return () => clearInterval(tick);
  }, [current, isPaused, catalogList.length]);

  if (!catalogList.length) return null;

  const s = catalogList[current];
  const go = (idx) => { setCurrent(idx); setProgress(0); };

  const handlePrev = () => {
    go((current - 1 + catalogList.length) % catalogList.length);
  };

  const handleNext = () => {
    go((current + 1) % catalogList.length);
  };

  return (
    <section
      className="relative overflow-hidden select-none text-white bg-[#064027]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#0B4F32]/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#4ADE80]/[0.08] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT: Editorial Headline & Actions */}
          <div className="lg:col-span-7 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${s.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B4F32] border border-[#16A34A]/40 text-[#4ADE80] font-bold text-xs uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                  <span>{s.eyebrow}</span>
                </div>

                {/* Headline */}
                <h1
                  className="font-extrabold tracking-tight leading-[1.08] text-white"
                  style={{ fontSize: "clamp(2.3rem, 4.8vw, 3.8rem)" }}
                >
                  <span className="block text-white">
                    {s.titleLine1 || s.title}
                  </span>
                  <span className="block text-[#4ADE80] mt-1.5">
                    {s.titleLine2 || "Across Every Global Market"}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-[15px] sm:text-base text-emerald-100/80 leading-relaxed max-w-xl font-normal">
                  {s.subtitle || s.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#00875A] hover:bg-[#00744D] text-white shadow-lg shadow-[#00875A]/25 transition-all cursor-pointer"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={ROUTES.B2B.QUOTES}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-white bg-[#0B472E]/70 hover:bg-[#0B472E] border border-white/20 transition-all cursor-pointer"
                  >
                    <span>Request Quote</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-6 border-t border-emerald-800/50">
                  {s.stats.map((st, i) => (
                    <div key={i}>
                      <div className="text-2xl font-black text-white tracking-tight">
                        {st.value}
                      </div>
                      <div className="text-xs text-emerald-200/70 font-medium mt-0.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Hero Image Card matching reference */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${s.id}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[480px]"
              >
                {/* White outer frame matching PlantX reference */}
                <div className="relative rounded-[2.5rem] p-3 bg-white shadow-2xl overflow-hidden">
                  <div className="relative h-[360px] sm:h-[420px] rounded-[2rem] overflow-hidden">
                    <img
                      src={s.heroImage || s.image}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />

                    {/* Bottom Floating Info Pill matching reference */}
                    <div className="absolute bottom-3 left-3 right-3 p-4 bg-[#0B3B24]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-[10px] font-bold tracking-[0.12em] text-[#4ADE80] uppercase mb-0.5">
                          FEATURED COLLECTION
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {s.name || "Curated Products"}
                        </h4>
                      </div>
                      <span className="bg-white text-[#0B3B24] font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shadow-sm">
                        VERIFIED GLOBAL
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {catalogList.map((_, idx) => {
              const isActive = current === idx;
              return (
                <button
                  key={idx}
                  onClick={() => go(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${isActive
                      ? "w-8 h-1.5 bg-white/20"
                      : "w-2 h-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      className="h-full rounded-full bg-[#4ADE80]"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-emerald-200/50 font-mono tabular-nums mr-2">
              0{current + 1} / 0{catalogList.length}
            </span>
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
