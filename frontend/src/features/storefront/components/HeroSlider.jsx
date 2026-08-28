import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "../../../constants/routes.js";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  Boxes,
  Zap,
  Users,
  Globe2,
  TrendingUp,
  Star,
  ShieldCheck,
} from "lucide-react";

const SLIDES = [
  {
    id: 1,
    eyebrow: "Global Multi-Jurisdiction Marketplace",
    title: "Retail & Wholesale,\nOne Platform",
    highlight: "One Platform",
    description: "B2C delivery + B2B pallet trade across the US $ and UK £ with automated tax compliance.",
    primaryCta: { label: "Shop Now", to: ROUTES.PRODUCTS },
    secondaryCta: { label: "B2B Wholesale", to: ROUTES.B2B.ROOT },
    pill: { text: "Up to 35% off bulk orders", color: "bg-emerald-500" },
    bg: "from-[#020c1b] via-[#021a0a] to-[#020c1b]",
    accent: "#00c136",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85",
    stats: [
      { icon: Users, value: "50K+", label: "Buyers" },
      { icon: Globe2, value: "30+", label: "Countries" },
      { icon: ShieldCheck, value: "ISO", label: "Certified" },
    ],
  },
  {
    id: 2,
    eyebrow: "FMCG & Commercial Foodservice",
    title: "Royal Basmati Rice\n& Bulk Commodities",
    highlight: "Bulk Commodities",
    description: "25 KG moisture-sealed sacks and 1-ton pallet consignments for chains, retailers and distributors.",
    primaryCta: { label: "Explore Groceries", to: `${ROUTES.PRODUCTS}?category=cat-2` },
    secondaryCta: { label: "Wholesale Tiers", to: ROUTES.B2B.CATALOG },
    pill: { text: "$28.00 / sack — Tier 3", color: "bg-amber-500" },
    bg: "from-[#1a0c00] via-[#0f0800] to-[#020c1b]",
    accent: "#f59e0b",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1400&q=85",
    stats: [
      { icon: Star, value: "4.9★", label: "Rating" },
      { icon: Boxes, value: "500+", label: "FMCG SKUs" },
      { icon: TrendingUp, value: "10T+", label: "Monthly" },
    ],
  },
  {
    id: 3,
    eyebrow: "Industrial & Enterprise Hardware",
    title: "Packaging & POS\nHardware Catalog",
    highlight: "POS\nHardware Catalog",
    description: "3-ply corrugated cartons, stretch films, and smart Android POS tablets for retail operations.",
    primaryCta: { label: "View Catalog", to: `${ROUTES.PRODUCTS}?category=cat-3` },
    secondaryCta: { label: "Request Quote", to: ROUTES.B2B.BULK_ORDER },
    pill: { text: "48hr dispatch SLA", color: "bg-blue-600" },
    bg: "from-[#020c1b] via-[#030f2a] to-[#020c1b]",
    accent: "#3b82f6",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1400&q=85",
    stats: [
      { icon: Boxes, value: "200+", label: "Industrial SKUs" },
      { icon: Globe2, value: "ISO", label: "9001:2015" },
      { icon: TrendingUp, value: "48hr", label: "Dispatch" },
    ],
  },
];

const SLIDE_DURATION = 5500;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setCurrent((p) => (p + 1) % SLIDES.length);
      }
    }, 40);
    return () => clearInterval(tick);
  }, [current, isPaused]);

  const slide = SLIDES[current];

  const go = (idx) => { setCurrent(idx); setProgress(0); };

  return (
    <section
      className="relative overflow-hidden select-none text-white"
      style={{ height: "clamp(360px, 46vw, 500px)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background layer ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
          />
          {/* vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          {/* subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 w-full items-center">

          {/* LEFT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${slide.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-4 max-w-xl"
            >
              {/* Eyebrow + pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                  {slide.eyebrow}
                </span>
                <span className={`${slide.pill.color} text-[10px] font-black px-2.5 py-0.5 rounded-full text-white`}>
                  {slide.pill.text}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-black tracking-tight leading-[1.1] text-white"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
              >
                {slide.title.split("\n").map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed max-w-md">
                {slide.description}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  to={slide.primaryCta.to}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: slide.accent }}
                >
                  {slide.primaryCta.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={slide.secondaryCta.to}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  {slide.secondaryCta.label}
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 pt-1">
                {slide.stats.map(({ icon: Icon, value, label }, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-6 bg-white/10" />}
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-xs font-black text-white">{value}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT — Image card (desktop only) */}
          <div className="hidden lg:flex justify-end items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${slide.id}`}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {/* Main image */}
                <div className="w-[340px] h-[260px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={slide.image}
                    alt={slide.eyebrow}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badge — bottom left */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-6 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: slide.accent + "30", border: `1px solid ${slide.accent}50` }}
                  >
                    <Boxes className="w-4 h-4" style={{ color: slide.accent }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white leading-tight">{slide.pill.text}</p>
                    <p className="text-[10px] text-white/50">MOQ available · NET 30</p>
                  </div>
                </motion.div>

                {/* Top-right live badge */}
                <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Pricing
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Bottom bar — progress + controls ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Progress bar */}
        <div className="h-[2px] bg-white/10">
          <motion.div
            className="h-full"
            style={{ width: `${progress}%`, backgroundColor: slide.accent }}
            transition={{ ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                className={`rounded-full transition-all duration-300 ${
                  current === idx ? "w-6 h-1.5" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/40"
                }`}
                style={current === idx ? { backgroundColor: slide.accent } : {}}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide counter + arrows */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/30 font-mono tabular-nums">
              {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
                className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => go((current + 1) % SLIDES.length)}
                className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                aria-label="Next"
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
