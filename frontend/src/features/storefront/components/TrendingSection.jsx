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

export function TrendingSection({ products = [], categories = [], isLoading = false }) {
  const { country } = useCountryStore();
  const [activeFilter, setActiveFilter] = useState("ALL");
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2B1C] tracking-tight">
            Trending Products
          </h2>
          <p className="text-sm text-[#5E7D67] mt-1">
            {filteredProducts.length} products available • {country.name} ({country.symbol})
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-[#E8EDE9] p-1 rounded-lg">
            <button
              onClick={() => setViewMode("scroll")}
              className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === "scroll"
                ? "bg-[#F0F7F1] text-[#074428]"
                : "text-[#8B9E91] hover:text-[#3D5648]"
                }`}
              title="Carousel"
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === "grid"
                ? "bg-[#F0F7F1] text-[#074428]"
                : "text-[#8B9E91] hover:text-[#3D5648]"
                }`}
              title="Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll Buttons */}
          {viewMode === "scroll" && (
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 rounded-lg bg-white border border-[#E8EDE9] flex items-center justify-center text-[#5E7D67] hover:text-[#074428] hover:border-[#074428] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 rounded-lg bg-white border border-[#E8EDE9] flex items-center justify-center text-[#5E7D67] hover:text-[#074428] hover:border-[#074428] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            to={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#074428] hover:bg-[#0a5634] text-white text-[13px] font-medium transition-all group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all shrink-0 cursor-pointer ${activeFilter === "ALL"
            ? "bg-[#074428] text-white"
            : "bg-white text-[#3D5648] border border-[#E8EDE9] hover:border-[#074428] hover:text-[#074428]"
            }`}
        >
          All ({productList.length})
        </button>

        {catList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all shrink-0 cursor-pointer ${activeFilter === cat.id
              ? "bg-[#074428] text-white"
              : "bg-white text-[#3D5648] border border-[#E8EDE9] hover:border-[#074428] hover:text-[#074428]"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E8EDE9]">
          <Flame className="w-8 h-8 text-[#C4D1C7] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#3D5648]">No products found in this category.</p>
          <p className="text-[13px] text-[#8B9E91] mt-1">Try another filter or browse our full catalog.</p>
        </div>
      ) : viewMode === "scroll" ? (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-1 scrollbar-none"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 min-w-[280px] sm:min-w-[300px] max-w-[300px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#0F2B1C] text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#84CC16]/10 blur-3xl pointer-events-none" />

        <div className="text-center sm:text-left relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Can't find what you need?
          </h3>
          <p className="text-[13px] text-white/50 max-w-md">
            Browse our complete catalog or search for specific brands and specifications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link to={ROUTES.PRODUCTS}>
            <button className="px-6 py-3 rounded-xl bg-[#84CC16] hover:bg-[#74B626] text-[#0F2B1C] font-semibold text-[13px] transition-colors cursor-pointer whitespace-nowrap">
              Browse Catalog
            </button>
          </Link>
          <Link to={ROUTES.PRODUCTS}>
            <button className="px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:bg-white/[0.06] hover:text-white font-medium text-[13px] transition-all cursor-pointer whitespace-nowrap">
              All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
