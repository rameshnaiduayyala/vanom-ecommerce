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

const SLIDE_DURATION = 6000;

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
          accent: "#FFE000",
          bg: "from-[#001736] via-[#00285a] to-[#001026]",
          pillColor: "bg-[#FFE000] text-[#003876]",
          stats: [
            { icon: Users, value: "50K+", label: "Verified Buyers" },
            { icon: Globe2, value: "US & UK", label: "Priority Ports" },
            { icon: ShieldCheck, value: "ISO 9001", label: "Certified" },
          ],
        },
        {
          accent: "#FFE000",
          bg: "from-[#0a1b38] via-[#08234d] to-[#051124]",
          pillColor: "bg-[#FFE000] text-[#003876]",
          stats: [
            { icon: Boxes, value: "5,000+", label: "In-Stock SKUs" },
            { icon: Globe2, value: "Direct", label: "Distributor" },
            { icon: Zap, value: "Tier 3", label: "Volume Pricing" },
          ],
        },
        {
          accent: "#FFE000",
          bg: "from-[#002244] via-[#003366] to-[#001730]",
          pillColor: "bg-[#FFE000] text-[#003876]",
          stats: [
            { icon: Boxes, value: "3-Ply", label: "Corrugated" },
            { icon: ShieldCheck, value: "24-Hr", label: "Dispatch" },
            { icon: Zap, value: "MOQ 10", label: "Bundles" },
          ],
        },
        {
          accent: "#FFE000",
          bg: "from-[#051a3a] via-[#092b5c] to-[#031024]",
          pillColor: "bg-[#FFE000] text-[#003876]",
          stats: [
            { icon: ShieldCheck, value: "4K UHD", label: "Surveillance" },
            { icon: Globe2, value: "PoE", label: "Plug & Play" },
            { icon: Users, value: "3-Yr", label: "Commercial Warranty" },
          ],
        },
      ];

      const theme = themes[idx % themes.length];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        category: p.category || "Commercial Inventory",
        brand: p.brand || "Vanom",
        description: p.description || "Enterprise retail dispatch + B2B pallet trade across USA & UK with automated customs & tax compliance.",
        image: p.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85",
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
      className="relative overflow-hidden select-none text-white bg-slate-950 w-full"
      style={{ height: "clamp(340px, 32vw, 420px)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Layer with Dimmed Vignette ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${s.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg}`}
        >
          <img
            src={s.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.22] filter saturate-125"
          />
          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001736]/95 via-[#001e47]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Dot matrix texture */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Wide-Screen Responsive Grid ── */}
      <div className="relative z-10 h-full w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 w-full items-center">

          {/* ─── LEFT: Compact Smart Typography & Actions ─── */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${s.id}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-3"
              >
                {/* Eyebrow + Pill */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FFE000] bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
                    {s.category}
                  </span>
                  <span className={`${s.pillColor} text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider`}>
                    Up to {s.discountPct}% off bulk
                  </span>
                </div>

                {/* Smart Sized Headline */}
                <h1
                  className="font-black tracking-tight leading-[1.12] text-white line-clamp-2"
                  style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.4rem)" }}
                >
                  {s.name}
                </h1>

                {/* Price & Description */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl sm:text-2xl font-black text-[#FFE000]">
                    {formatPrice(s.retailPrice, country.currency, country.symbol)}
                  </span>
                  <span className="text-xs text-white/60">
                    Bulk: <span className="font-bold text-white">{formatPrice(s.wholesalePrice, country.currency, country.symbol)}/{s.packaging}</span>
                  </span>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-xs text-white/70 line-clamp-1 max-w-xs hidden sm:inline">
                    {s.description}
                  </span>
                </div>

                {/* CTAs + Stats in one compact smart row */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    to={`/products/${s.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-black bg-[#FFE000] text-[#003876] hover:bg-[#FFD100] transition-all hover:scale-103 shadow-md cursor-pointer"
                  >
                    <span>Shop Deal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={ROUTES.B2B.ROOT}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Wholesale Tiers</span>
                  </Link>

                  {/* Inline Stats */}
                  <div className="hidden xl:flex items-center gap-4 ml-2 pl-4 border-l border-white/15">
                    {s.stats.slice(0, 2).map(({ icon: Icon, value, label }, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <Icon className="w-3.5 h-3.5 text-[#FFE000]" />
                        <span className="font-black text-white">{value}</span>
                        <span className="text-[10px] text-white/50 uppercase">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── RIGHT: Smart Compact Aspect Showcase ─── */}
          <div className="lg:col-span-5 hidden lg:flex justify-end items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${s.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative"
              >
                {/* Smart Wide Image Container */}
                <div className="w-[360px] h-[220px] rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-900/90 relative group">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                </div>

                {/* Floating Bottom Info Badge */}
                <div className="absolute -bottom-3 -left-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-xl">
                  <Boxes className="w-4 h-4 text-[#FFE000]" />
                  <span className="text-xs font-black text-[#FFE000]">
                    {formatPrice(s.wholesalePrice, country.currency, country.symbol)}
                  </span>
                  <span className="text-[10px] text-white/60">Wholesale</span>
                </div>

                {/* Top-Right Badge */}
                <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Deal
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Compact Bottom Navigation Strip ── */}
      <div className="absolute bottom-2.5 left-0 right-0 z-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
          {/* Pill Indicators with Progress */}
          <div className="flex items-center gap-2">
            {catalogList.map((_, idx) => {
              const isActive = current === idx;
              return (
                <button
                  key={idx}
                  onClick={() => go(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "w-9 h-1.5 bg-white/20"
                      : "w-2.5 h-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      className="h-full rounded-full bg-[#FFE000]"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide Counter & Arrow Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50 font-mono font-bold tabular-nums">
              0{current + 1} / 0{catalogList.length}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
