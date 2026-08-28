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
          accent: "#00c136",
          bg: "from-[#011409] via-[#021f0f] to-[#010c06]",
          pillColor: "bg-[#008522]",
          stats: [
            { icon: Users, value: "50K+", label: "Buyers" },
            { icon: Globe2, value: "US & UK", label: "Markets" },
            { icon: ShieldCheck, value: "ISO", label: "Certified" },
          ],
        },
        {
          accent: "#F5B800",
          bg: "from-[#160e01] via-[#241703] to-[#0d0800]",
          pillColor: "bg-[#D9A000]",
          stats: [
            { icon: Boxes, value: "5,000+", label: "In Stock" },
            { icon: Globe2, value: "Direct", label: "Millers" },
            { icon: Zap, value: "Tier 3", label: "Wholesale" },
          ],
        },
        {
          accent: "#10B981",
          bg: "from-[#021812] via-[#04281e] to-[#01100b]",
          pillColor: "bg-emerald-600",
          stats: [
            { icon: Boxes, value: "3-Ply", label: "Corrugated" },
            { icon: ShieldCheck, value: "24-Hr", label: "Dispatch" },
            { icon: Zap, value: "MOQ 10", label: "Bundles" },
          ],
        },
        {
          accent: "#EAB308",
          bg: "from-[#0f1710] via-[#162419] to-[#070e08]",
          pillColor: "bg-amber-600",
          stats: [
            { icon: ShieldCheck, value: "4K UHD", label: "Night Vision" },
            { icon: Globe2, value: "PoE", label: "Plug & Play" },
            { icon: Users, value: "3-Yr", label: "Warranty" },
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
        description: p.description || "B2C delivery + B2B pallet trade across the US $ and UK £ with automated tax compliance.",
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
      className="relative overflow-hidden select-none text-white bg-slate-950 border-b border-slate-800"
      style={{ height: "clamp(380px, 46vw, 500px)" }}
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
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg}`}
        >
          <img
            src={s.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.20] filter saturate-125"
          />
          {/* Subtle vignette gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
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

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="grid lg:grid-cols-12 gap-8 w-full items-center">

          {/* ─── LEFT: Editorial Headline & Actions ─── */}
          <div className="lg:col-span-7 space-y-4 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${s.id}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Eyebrow + Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                    {s.category}
                  </span>
                  <span className={`${s.pillColor} text-[10px] font-black px-2.5 py-0.5 rounded-full text-white shadow-xs`}>
                    Up to {s.discountPct}% off bulk orders
                  </span>
                </div>

                {/* Main Headline */}
                <h1
                  className="font-black tracking-tight leading-[1.1] text-white"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.9rem)" }}
                >
                  {s.name}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-md line-clamp-2">
                  {s.description}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to={`/products/${s.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                    style={{ backgroundColor: s.accent }}
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={ROUTES.B2B.ROOT}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>B2B Wholesale</span>
                  </Link>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-5 pt-1">
                  {s.stats.map(({ icon: Icon, value, label }, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="w-px h-5 bg-white/10" />}
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 opacity-60" style={{ color: s.accent }} />
                        <span className="text-xs font-black text-white">{value}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── RIGHT: Clean Floating Product Card ─── */}
          <div className="lg:col-span-5 hidden lg:flex justify-end items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${s.id}`}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative"
              >
                {/* Main Image Container */}
                <div className="w-[340px] h-[240px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Bottom Badge */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-6 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 shadow-xl"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.accent + "30", border: `1px solid ${s.accent}60` }}
                  >
                    <Boxes className="w-4 h-4" style={{ color: s.accent }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white leading-tight">
                      {formatPrice(s.wholesalePrice, country.currency, country.symbol)} / {s.packaging}
                    </p>
                    <p className="text-[10px] text-white/50">MOQ available · NET 30</p>
                  </div>
                </motion.div>

                {/* Top-Right Live Pricing Badge */}
                <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Pricing
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Clean Minimalist Bottom Controls Bar (As Shown in Screenshot) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Continuous Progress Line */}
        <div className="h-[2px] bg-white/10 w-full">
          <motion.div
            className="h-full"
            style={{ width: `${progress}%`, backgroundColor: s.accent }}
            transition={{ ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
          {/* Dot / Pill Indicators on the Left */}
          <div className="flex items-center gap-2">
            {catalogList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  current === idx
                    ? "w-6 h-1.5"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                }`}
                style={current === idx ? { backgroundColor: s.accent } : {}}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
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
