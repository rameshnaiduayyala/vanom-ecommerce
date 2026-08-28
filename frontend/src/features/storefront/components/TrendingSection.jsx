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
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";

export function TrendingSection({ products = [], categories = [], isLoading = false }) {
  const { country } = useCountryStore();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("scroll"); // 'scroll' | 'grid'
  const scrollContainerRef = useRef(null);

  const filteredProducts = products.filter((p) => {
    if (activeFilter === "ALL") return true;
    return p.categoryId === activeFilter || p.category === activeFilter;
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Trending Products & Wholesale Deals
              </h2>
              <Badge variant="brand" size="sm">
                Market: {country.name} ({country.currency})
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-muted border border-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode("scroll")}
              title="Horizontal Carousel Rail"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "scroll" ? "bg-white text-brand-600 shadow-2xs" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white text-brand-600 shadow-2xs" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Arrows for Horizontal Scroll */}
          {viewMode === "scroll" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 shadow-2xs transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 shadow-2xs transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link to={ROUTES.PRODUCTS}>
            <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="text-xs font-bold">
              Explore All
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeFilter === "ALL"
              ? "bg-brand-600 text-white shadow-xs"
              : "bg-surface-muted text-text-secondary hover:bg-surface-muted/80 hover:text-text-primary border border-border"
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === cat.id
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-muted text-text-secondary hover:bg-surface-muted/80 hover:text-text-primary border border-border"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Display (Horizontal Scroll Rail vs Grid View) */}
      {isLoading ? (
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-80 min-w-[290px] sm:min-w-[320px] rounded-2xl shrink-0" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border text-text-muted text-xs">
          No products found in this category.
        </div>
      ) : viewMode === "scroll" ? (
        /* HORIZONTAL SCROLL RAIL */
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 scrollbar-none -mx-2 sm:-mx-0"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 min-w-[280px] sm:min-w-[320px] max-w-[320px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MULTI-COLUMN GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bottom Explore All Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-black tracking-tight text-white">
            Looking for something specific or customized bulk specs?
          </h3>
          <p className="text-xs text-slate-300">
            Browse our full catalog or submit custom specs to our commercial procurement desk.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="gold" size="md" className="font-bold text-slate-950 shadow-sm">
              Browse Full Catalog
            </Button>
          </Link>
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="outline" size="md" className="border-white/40 text-white hover:bg-white/10">
              Bulk Order Sheet
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
