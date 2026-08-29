import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import { ProductCard } from "./ProductCard.jsx";
import {
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows3,
  Flame,
  Sparkles,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";

const TABS = [
  { id: "trending", label: "High Velocity", icon: Flame },
  { id: "new", label: "New Arrivals", icon: Sparkles },
  { id: "bestseller", label: "Best Sellers", icon: TrendingUp },
];

export function TrendingSection({ products = [], categories = [], isLoading = false }) {
  const { country } = useCountryStore();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("trending");
  const [viewMode, setViewMode] = useState("scroll");
  const scrollContainerRef = useRef(null);

  const productList = Array.isArray(products) ? products : (products?.items || []);
  const catList = Array.isArray(categories) ? categories : (categories?.items || []);

  const filteredProducts = productList.filter((p) => {
    if (activeFilter === "ALL") return true;
    return p.categoryId === activeFilter || p.category === activeFilter;
  });

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 360, behavior: "smooth" });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Enterprise Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          {/* Section Label */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Live Catalog
            </span>
            <span className="text-[11px] text-slate-400">
              {country.name} · {country.currency} pricing
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-[11px] text-slate-400">
              {filteredProducts.length} products
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Trending Procurement Lines
          </h2>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 border border-slate-200 rounded-lg w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("scroll")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "scroll" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Carousel"
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {viewMode === "scroll" && (
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 shadow-2xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 shadow-2xs transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link to={ROUTES.PRODUCTS}>
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="text-xs font-bold">
              Full Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Chips — Enterprise neutral */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
            activeFilter === "ALL"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
          }`}
        >
          All Lines ({productList.length})
        </button>

        {catList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
              activeFilter === cat.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Display */}
      {isLoading ? (
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-80 min-w-[290px] sm:min-w-[320px] rounded-2xl shrink-0" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No products in this classification.</p>
          <p className="text-xs text-slate-400 mt-1">Try another category or browse the full catalog.</p>
        </div>
      ) : viewMode === "scroll" ? (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 scrollbar-none"
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="snap-start shrink-0 min-w-[280px] sm:min-w-[310px] max-w-[310px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Enterprise CTA Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-center sm:text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Procurement Desk
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Looking for custom specifications or non-catalog SKUs?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Our commercial team handles bulk custom orders, private-label sourcing & freight coordination.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to={ROUTES.PRODUCTS}>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer">
              Browse Full Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <Link to="/b2b">
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap cursor-pointer">
              <Building2 className="w-3.5 h-3.5" />
              Open B2B Account
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
