import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { ROUTES } from "../../../constants/routes.js";
import { ProductCard } from "./ProductCard.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "../../../components/ui/Alert.jsx";

const TABS = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "grocery", label: "Grocery" },
  { id: "packaging", label: "Packaging" },
  { id: "kitchen", label: "Kitchen" },
];

export function TrendingSection({ products = [], categories = [], isLoading = false }) {
  const { country } = useCountryStore();
  const [activeTab, setActiveTab] = useState("all");
  const scrollRef = useRef(null);

  const productList = Array.isArray(products) ? products : (products?.items || []);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <section className="w-full">
      {/* BestBuy-style section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Trending Now
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-[#003876] hover:text-[#003876] transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-[#003876] hover:text-[#003876] transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-[13px] font-semibold text-[#003876] hover:underline ml-1"
          >
            Shop All ›
          </Link>
        </div>
      </div>

      {/* Filter tabs — BestBuy pill style */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === tab.id
                ? "bg-[#003876] text-white border-[#003876]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#003876] hover:text-[#003876]"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="text-[11px] text-slate-400 ml-auto whitespace-nowrap shrink-0">
          {country.name} · {country.currency}
        </span>
      </div>

      {/* Product Rail */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-72 min-w-[220px] rounded-xl shrink-0" />
          ))}
        </div>
      ) : productList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">No products available yet. Check back soon.</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x scroll-smooth pb-2 scrollbar-none"
        >
          {productList.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA strip — BestBuy dark bar style */}
      <div className="mt-6 flex items-center justify-between px-6 py-4 rounded-xl bg-[#003876] text-white">
        <div>
          <p className="text-sm font-bold">Need custom specs or non-catalog SKUs?</p>
          <p className="text-xs text-white/60 mt-0.5">
            Our procurement desk handles bulk orders, private-label & freight.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to={ROUTES.PRODUCTS}>
            <button className="px-4 py-2 rounded-lg bg-[#FFE000] text-[#003876] text-xs font-black hover:bg-[#FFD100] transition-colors cursor-pointer whitespace-nowrap">
              Full Catalog
            </button>
          </Link>
          <Link to="/b2b">
            <button className="px-4 py-2 rounded-lg border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap">
              B2B Account
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
