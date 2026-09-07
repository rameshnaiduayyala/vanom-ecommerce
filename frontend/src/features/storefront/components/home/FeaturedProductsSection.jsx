import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "BEST_SELLERS", label: "Best Sellers" },
  { key: "NEW", label: "New Arrivals" },
  { key: "TOP_RATED", label: "Top Rated" },
  { key: "OFFERS", label: "Offers" },
];

function getBadgeForFilter(filter) {
  if (filter === "BEST_SELLERS") return "best-seller";
  if (filter === "NEW") return "new";
  if (filter === "OFFERS") return "sale";
  return null;
}

export function FeaturedProductsSection({
  products = [],
  featuredProducts = [],
  bestSellers = [],
  isLoading = false,
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const scrollRef = useRef(null);

  const productList = Array.isArray(products) ? products : (products?.items || []);
  const featuredList = Array.isArray(featuredProducts) ? featuredProducts : (featuredProducts?.items || []);
  const bestSellerList = Array.isArray(bestSellers) ? bestSellers : (bestSellers?.items || []);

  const displayed = React.useMemo(() => {
    let list = productList;
    if (activeFilter === "BEST_SELLERS") list = bestSellerList.length > 0 ? bestSellerList : productList.filter((p) => p.isBestSeller);
    else if (activeFilter === "NEW") list = productList.filter((p) => !p.isBestSeller).slice(0, 12);
    else if (activeFilter === "TOP_RATED") list = [...productList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (activeFilter === "OFFERS") list = productList.filter((p) => (p.pricing?.IN?.retailPrice || 0) > 0);
    else list = featuredList.length > 0 ? featuredList : productList;
    return list.slice(0, 12);
  }, [activeFilter, productList, featuredList, bestSellerList]);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Featured Products</h2>
          <div className="flex items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tab.key
                      ? "bg-[#003D2B] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:text-[#003D2B] transition-colors whitespace-nowrap"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Products Scroll Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => scroll(-1)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer border border-gray-100 hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div
              ref={scrollRef}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto scrollbar-none"
            >
              {displayed.map((p, i) => (
                <ProductCardCompact
                  key={p.id || i}
                  product={p}
                  badge={getBadgeForFilter(activeFilter) || (i === 0 ? "best-seller" : i === 1 ? "new" : null)}
                />
              ))}
            </div>
            <button
              onClick={() => scroll(1)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer border border-gray-100 hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
