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
      className="relative overflow-hidden select-none text-white bg-[#042A19]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#0a5634]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#84CC16]/[0.06] rounded-full blur-[100px] pointer-events-none" />

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
                {/* Eyebrow */}
                <span className="inline-block text-[11px] font-semibold text-[#84CC16] uppercase tracking-[0.15em]">
                  {s.eyebrow}
                </span>

                {/* Headline */}
                <h1
                  className="font-black tracking-tight leading-[1.08] text-white"
                  style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}
                >
                  <span className="block text-white">
                    {s.titleLine1 || s.title}
                  </span>
                  <span className="block text-[#4ADE80]/90 mt-1">
                    {s.titleLine2 || "Across Every Global Market"}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-[15px] text-white/50 leading-relaxed max-w-lg font-light">
                  {s.subtitle || s.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[13px] font-semibold bg-white text-[#074428] hover:bg-white/90 transition-all shadow-lg cursor-pointer"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={ROUTES.B2B.QUOTES}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13px] font-medium text-white/70 border border-white/15 hover:bg-white/[0.06] hover:text-white hover:border-white/25 transition-all cursor-pointer"
                  >
                    <span>Request Quote</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 pt-6 border-t border-white/[0.08]">
                  {s.stats.map((st, i) => (
                    <div key={i}>
                      <div className="text-xl font-bold text-white tracking-tight">
                        {st.value}
                      </div>
                      <div className="text-[11px] text-white/35 font-medium mt-0.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Hero Image Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${s.id}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[460px]"
              >
                <div className="relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                  <div className="relative h-[340px] sm:h-[400px]">
                    <img
                      src={s.heroImage || s.image}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                      <span className="block text-[10px] font-semibold tracking-[0.12em] text-[#84CC16] uppercase mb-1">
                        Featured Collection
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {s.name || "Curated Products"}
                      </h4>
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
                  className={`rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "w-8 h-1.5 bg-white/15"
                      : "w-2 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      className="h-full rounded-full bg-[#84CC16]"
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
            <span className="text-[11px] text-white/25 font-mono tabular-nums mr-2">
              0{current + 1} / 0{catalogList.length}
            </span>
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
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
