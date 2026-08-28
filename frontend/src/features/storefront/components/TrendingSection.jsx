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
  const [viewMode, setViewMode] = useState("scroll");
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
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                Trending Products & Wholesale Deals
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="brand" size="sm">
                  {country.name} · {country.currency}
                </Badge>
                <span className="text-xs text-text-muted">{filteredProducts.length} products</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-xl border border-border w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-text-primary shadow-xs"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? tab.color : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-muted border border-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode("scroll")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "scroll" ? "bg-white text-brand-600 shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Carousel View"
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white text-brand-600 shadow-xs" : "text-text-muted hover:text-text-primary"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {viewMode === "scroll" && (
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 hover:bg-brand-50 shadow-xs transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 hover:bg-brand-50 shadow-xs transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link to={ROUTES.PRODUCTS}>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs font-bold"
            >
              Explore All
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeFilter === "ALL"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-text-secondary hover:text-text-primary border border-border hover:border-brand-300"
          }`}
        >
          All Items ({productList.length})
        </button>

        {catList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === cat.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-text-secondary hover:text-text-primary border border-border hover:border-brand-300"
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
        <div className="p-16 text-center bg-white rounded-2xl border border-border">
          <Flame className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold text-text-muted">No products in this category yet.</p>
          <p className="text-xs text-text-muted mt-1">Try another category or browse all items.</p>
        </div>
      ) : viewMode === "scroll" ? (
        /* HORIZONTAL SCROLL RAIL with fade edges */
        <div className="relative">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-2 scrollbar-none"
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
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bottom "Explore All" Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-brand-700/30">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="space-y-1 text-center sm:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2">
            <Sparkles className="w-3 h-3" />
            Full Catalog Available
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            Looking for specific bulk specs or custom SKUs?
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Browse our full catalog or submit custom specs directly to our commercial procurement desk.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10">
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="gold" size="md" className="font-bold text-slate-950 shadow-sm whitespace-nowrap">
              Browse Full Catalog
            </Button>
          </Link>
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button
              variant="outline"
              size="md"
              className="border-white/30 text-white hover:bg-white/10 whitespace-nowrap"
            >
              Bulk Order Sheet
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
