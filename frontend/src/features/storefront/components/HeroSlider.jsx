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
  Building2,
  Boxes,
  Users,
  Globe2,
  ShieldCheck,
  Zap,
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
      const wholesalePrice = Number(
        pricingObj.wholesaleTiers?.[0]?.unitPrice || retailPrice * 0.72
      );
      const discountPct = Math.max(10, Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100));

      const themes = [
        {
          accent: "#10B981",
          pillColor: "bg-[#0C5936] text-[#6EE7B7] border border-[#10B981]/30",
          eyebrow: "GLOBAL COMMERCE • MULTI-MARKET DELIVERY",
          titleLine1: "Premium Products,",
          titleLine2: "Delivered Worldwide",
          subtitle: "Explore our curated catalog of consumer tech, lifestyle essentials, packaging, and commercial equipment with express delivery across US and UK.",
          facility: "Vanom Global Logistics Hub, London & Mumbai",
          heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "50,000+", label: "Satisfied Customers" },
            { value: "30+ Countries", label: "Express Delivery" },
            { value: "100%", label: "Authentic & Verified" },
          ],
        },
        {
          accent: "#84CC16",
          pillColor: "bg-[#0C5936] text-[#A3E635] border border-[#84CC16]/30",
          eyebrow: "QUALITY PACKAGING & ESSENTIAL COMMODITIES",
          titleLine1: "Heavy-Duty Packaging &",
          titleLine2: "Quality Essentials",
          subtitle: "High-grade shipping materials, heavy-duty cartons, stretch films, and premium culinary staples delivered directly to your doorstep.",
          facility: "Vanom Central Logistics & Fulfillment",
          heroImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "Fast Dispatch", label: "Within 24 Hours" },
            { value: "Top Rated", label: "Customer Satisfaction" },
            { value: "Secure Pay", label: "Stripe Protected" },
          ],
        },
        {
          accent: "#10B981",
          pillColor: "bg-[#0C5936] text-[#6EE7B7] border border-[#10B981]/30",
          eyebrow: "SMART TECH & PROFESSIONAL HARDWARE",
          titleLine1: "Smart POS Systems &",
          titleLine2: "Security Hardware",
          subtitle: "Commercial-grade surveillance cameras, point-of-sale barcode equipment, and industrial hardware backed by warranty.",
          facility: "Vanom Hardware & Tech Depot",
          heroImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=85",
          stats: [
            { value: "1,200+", label: "Curated SKUs" },
            { value: "Full Warranty", label: "Manufacturer Backed" },
            { value: "Live Tracking", label: "Doorstep Transit" },
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
        wholesalePrice,
        discountPct,
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
      className="relative overflow-hidden select-none text-white bg-[#074428] border-b border-emerald-900/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial-at-t from-[#0d5936] via-[#074428] to-[#042a19] pointer-events-none" />

      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Main Hero Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ─── LEFT: Editorial Headline & Actions ─── */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${s.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Pill Eyebrow */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c5936] text-[#a7f3d0] border border-[#10b981]/30 text-xs font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>{s.eyebrow}</span>
                </div>

                {/* Main Headline (Two-tone split matching Image 1) */}
                <h1
                  className="font-black tracking-tight leading-[1.08] text-white"
                  style={{ fontSize: "clamp(2.3rem, 4.5vw, 3.8rem)" }}
                >
                  <span className="block text-white">
                    {s.titleLine1 || s.title}
                  </span>
                  <span className="block text-[#4ADE80] mt-1">
                    {s.titleLine2 || "Across Every Global Market"}
                  </span>
                </h1>

                {/* Subtitle / Description */}
                <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed max-w-xl font-normal">
                  {s.subtitle || s.description}
                </p>

                {/* Action Buttons (Matching Image 1: Explore Products + Request Project Quote) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold bg-[#059669] hover:bg-[#047857] text-white transition-all hover:scale-[1.02] shadow-lg hover:shadow-emerald-900/40 cursor-pointer"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={ROUTES.B2B.QUOTES}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all hover:border-white/50 cursor-pointer"
                  >
                    <span>Request Project Quote</span>
                  </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  {s.stats.map((st, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {st.value}
                      </div>
                      <div className="text-[11px] sm:text-xs text-emerald-200/70 font-medium">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── RIGHT: Majestic Facility / Warehouse Card ─── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${s.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[480px]"
              >
                {/* Outer Card Container with generous rounded borders */}
                <div className="relative rounded-[2.2rem] bg-white p-2.5 sm:p-3 shadow-2xl border border-white/20">
                  {/* Inner Image Container */}
                  <div className="relative h-[320px] sm:h-[380px] rounded-[1.8rem] overflow-hidden bg-[#eaf2ec]">
                    <img
                      src={s.heroImage || s.image}
                      alt="Logistics Facility"
                      className="w-full h-full object-cover"
                    />

                    {/* Facility Overlay Box at Bottom of Image */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-[#074428]/95 backdrop-blur-md p-3.5 sm:p-4 text-white border border-white/15 shadow-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold tracking-widest text-[#84CC16] uppercase">
                          TRADE & LOGISTICS FACILITY
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                          {s.facility}
                        </h4>
                      </div>

                      {/* Pill Tag */}
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-white text-[#074428] text-[10px] font-black tracking-wider uppercase shadow-xs">
                        ISO 9001 CERTIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>


      {/* ── Clean Minimalist Bottom Controls Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
          {/* Subtle Pill Indicators with Integrated Progress on the Left */}
          <div className="flex items-center gap-2">
            {catalogList.map((_, idx) => {
              const isActive = current === idx;
              return (
                <button
                  key={idx}
                  onClick={() => go(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "w-8 h-1.5 bg-white/20"
                      : "w-2 h-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: s.accent }}
                      transition={{ ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Minimalist Slide Counter & Arrow Buttons on the Right */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40 font-mono tabular-nums">
              0{current + 1} / 0{catalogList.length}
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
