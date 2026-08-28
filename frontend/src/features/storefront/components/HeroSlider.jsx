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
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";

const SLIDES = [
  {
    id: 1,
    badge: "✨ Global Multi-Jurisdiction Marketplace",
    title: "One Platform for Retail Essentials & Wholesale Pallets",
    description: "Direct-to-consumer delivery and commercial bulk orders across India (₹), the United States ($), and the United Kingdom (£).",
    primaryCta: { label: "Shop Retail Store", to: ROUTES.PRODUCTS, icon: ArrowRight },
    secondaryCta: { label: "B2B Wholesale Portal", to: ROUTES.B2B.ROOT, icon: Building2 },
    bgGradient: "from-brand-950 via-slate-900 to-brand-900",
    glowColor: "rgba(0, 133, 34, 0.25)",
    promoTag: { title: "B2B Wholesale", sub: "Save up to 35% on volume pallets" },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    badge: "🌾 FMCG & Commercial Foodservice",
    title: "Royal Heritage Basmati Rice & Bulk Food Commodities",
    description: "Moisture-sealed 25 KG poly sacks and 1-ton pallet consignments ready for restaurant chains, retailers, and distributors.",
    primaryCta: { label: "Explore Bulk Groceries", to: `${ROUTES.PRODUCTS}?category=cat-2`, icon: ArrowRight },
    secondaryCta: { label: "Wholesale Price Tiers", to: ROUTES.B2B.CATALOG, icon: Boxes },
    bgGradient: "from-amber-950 via-slate-900 to-brand-950",
    glowColor: "rgba(217, 160, 0, 0.25)",
    promoTag: { title: "25 KG Sacks", sub: "Tier 3 wholesale: ₹1,750 / sack" },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    badge: "📦 Industrial Supplies & Tech",
    title: "Heavy-Duty Packaging & Enterprise POS Hardware",
    description: "3-ply corrugated shipping master cartons, high-cling stretch films, and 10.1\" smart Android tablets for digital operations.",
    primaryCta: { label: "View Industrial Catalog", to: `${ROUTES.PRODUCTS}?category=cat-3`, icon: ArrowRight },
    secondaryCta: { label: "Request Bulk Quote", to: ROUTES.B2B.BULK_ORDER, icon: Zap },
    bgGradient: "from-slate-950 via-blue-950 to-slate-900",
    glowColor: "rgba(59, 130, 246, 0.25)",
    promoTag: { title: "Corrugated Boxes", sub: "Master bundles of 50 units" },
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[current];
  const PrimaryIcon = slide.primaryCta.icon;
  const SecondaryIcon = slide.secondaryCta.icon;

  return (
    <section
      className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[520px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Cross-fade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: slide.glowColor }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Content Area with Animated Text Entry */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-8 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <span>{slide.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {slide.description}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to={slide.primaryCta.to}>
                  <Button
                    variant="gold"
                    size="lg"
                    icon={PrimaryIcon}
                    iconPosition="right"
                    className="font-bold text-slate-950 shadow-md hover:scale-102 transition-transform"
                  >
                    {slide.primaryCta.label}
                  </Button>
                </Link>

                <Link to={slide.secondaryCta.to}>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={SecondaryIcon}
                    className="border-white/40 text-white hover:bg-white/10 backdrop-blur-md"
                  >
                    {slide.secondaryCta.label}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Floating Highlight Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-gold-300">
                  {slide.promoTag.title}
                </span>
                <span className="bg-gold-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  Commercial Grade
                </span>
              </div>

              <h4 className="text-lg font-extrabold leading-snug">
                {slide.promoTag.sub}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Automated multi-currency VAT/GST invoicing, dedicated freight support, and flexible NET 30 commercial credit terms.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Minimum Order Quantity (MOQ)</span>
                <span className="text-xs font-bold text-gold-400">Available</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${
                current === idx ? "w-6 bg-gold-400" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
