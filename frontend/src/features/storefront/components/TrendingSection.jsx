import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import { ProductCard } from "./ProductCard.jsx";
import {
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows3,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";

const TABS = [
  { id: "trending", label: "Trending", icon: Flame, color: "text-amber-500" },
  { id: "new", label: "New Arrivals", icon: Sparkles, color: "text-blue-500" },
  { id: "bestseller", label: "Best Sellers", icon: TrendingUp, color: "text-emerald-500" },
];

export function TrendingSection({ products = [], categories = [], isLoading = false }) {
  const { country } = useCountryStore();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("trending");
  const [viewMode, setViewMode] = useState("grid");
  const scrollContainerRef = useRef(null);

  const productList = Array.isArray(products) ? products : (products?.items || []);
  const catList = Array.isArray(categories) ? categories : (categories?.items || []);

  const filteredProducts = productList.filter((p) => {
    if (activeFilter === "ALL") return true;
    return p.categoryId === activeFilter || p.category === activeFilter;
  });

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* ─── Section Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-[#E3ECE6]">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#072115] tracking-tight">
            Best Sellers & Trending Products
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B6357]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Market: <strong className="text-[#072115]">{country.name} ({country.currency} {country.symbol})</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>{filteredProducts.length} top products available now</span>
          </div>
        </div>

        {/* Right Side Header Controls */}
        <div className="flex flex-wrap items-center gap-3">


          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F4F7F4] border border-[#DCE8DF] p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("scroll")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "scroll"
                ? "bg-white text-[#074428] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
                }`}
              title="Carousel Rail"
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid"
                ? "bg-white text-[#074428] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
                }`}
              title="Grid Matrix"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll Buttons */}
          {viewMode === "scroll" && (
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-xl bg-white border border-[#DCE8DF] flex items-center justify-center text-slate-700 hover:text-[#074428] hover:border-[#074428] hover:bg-emerald-50 shadow-2xs transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 rounded-xl bg-white border border-[#DCE8DF] flex items-center justify-center text-slate-700 hover:text-[#074428] hover:border-[#074428] hover:bg-emerald-50 shadow-2xs transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <Link
            to={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] text-white text-xs font-bold transition-all shadow-xs group cursor-pointer"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ─── Category Filter Pills ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeFilter === "ALL"
            ? "bg-[#074428] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#074428] border border-[#DCE8DF] hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
        >
          All Items ({productList.length})
        </button>

        {catList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeFilter === cat.id
              ? "bg-[#074428] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#074428] border border-[#DCE8DF] hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} className="h-96 rounded-3xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#DCE8DF]">
          <Flame className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No products found in this category.</p>
          <p className="text-xs text-slate-400 mt-1">Try another category filter or view our complete catalog.</p>
        </div>
      ) : viewMode === "scroll" ? (
        /* HORIZONTAL SCROLL RAIL */
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 scrollbar-none"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 min-w-[280px] sm:min-w-[310px] max-w-[310px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* RESPONSIVE ENTERPRISE GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bottom "Explore All" Retail Discovery Banner */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-[2.2rem] bg-[#074428] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-700/40">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#84CC16]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none" />

        <div className="space-y-1.5 text-center sm:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#84CC16] uppercase tracking-widest mb-1 bg-[#0c5936] px-3 py-1 rounded-full border border-[#84CC16]/30">
            <Sparkles className="w-3 h-3 text-[#84CC16]" />
            <span>DISCOVER OVER 1,200+ CURATED PRODUCTS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Can't find what you're looking for?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-lg leading-relaxed">
            Browse our complete retail departments or search for specific brands, models, and specifications.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <Link to={ROUTES.PRODUCTS} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#84CC16] hover:bg-[#74B626] text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer whitespace-nowrap">
              Browse Full Catalog
            </button>
          </Link>
          <Link to={ROUTES.PRODUCTS} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
