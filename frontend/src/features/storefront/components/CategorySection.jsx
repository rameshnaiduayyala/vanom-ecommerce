import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import {
  Laptop,
  UtensilsCrossed,
  Boxes,
  CookingPot,
  ShieldCheck,
  Hammer,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Armchair,
  ShoppingBag,
} from "lucide-react";

const CATEGORY_ITEMS = [
  {
    id: "cat-1",
    name: "Electronics & POS",
    count: "480+ Products",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    borderColor: "#1E3A8A", // Bold Deep Blue
  },
  {
    id: "cat-2",
    name: "Groceries & FMCG",
    count: "620+ Products",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    borderColor: "#B45309", // Bold Warm Amber
  },
  {
    id: "cat-3",
    name: "Industrial Packaging",
    count: "340+ Products",
    icon: Boxes,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    borderColor: "#065F46", // Bold Forest Green
  },
  {
    id: "cat-4",
    name: "Commercial Kitchen",
    count: "210+ Products",
    icon: CookingPot,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80",
    borderColor: "#9F1239", // Bold Crimson
  },
  {
    id: "cat-5",
    name: "Safety & Security",
    count: "190+ Products",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80",
    borderColor: "#0369A1", // Bold Steel Cyan
  },
  {
    id: "cat-6",
    name: "Tools & Hardware",
    count: "310+ Products",
    icon: Hammer,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    borderColor: "#4338CA", // Bold Deep Indigo
  },
  {
    id: "cat-7",
    name: "Living & Decor",
    count: "160+ Products",
    icon: Armchair,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    borderColor: "#9A3412", // Bold Terracotta
  },
  {
    id: "cat-8",
    name: "Global Essentials",
    count: "500+ Products",
    icon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    borderColor: "#0F766E", // Bold Deep Teal
  },
];

const DEFAULT_BORDER_COLORS = [
  "#1E3A8A",
  "#B45309",
  "#065F46",
  "#9F1239",
  "#0369A1",
  "#4338CA",
  "#9A3412",
  "#0F766E",
  "#15803D",
];

export function CategorySection({ categories = [] }) {
  const scrollContainerRef = useRef(null);

  const rawList = Array.isArray(categories) ? categories : (categories?.items || []);

  const displayList = rawList.length > 0
    ? rawList.map((backendCat, index) => {
        const fallback = CATEGORY_ITEMS[index % CATEGORY_ITEMS.length];
        return {
          id: backendCat.id,
          slug: backendCat.slug || backendCat.id,
          name: backendCat.name,
          count: backendCat.productCount ? `${backendCat.productCount}+ Products` : `${(index + 2) * 45}+ Products`,
          icon: fallback.icon || ShoppingBag,
          image: backendCat.imageUrl || fallback.image,
          borderColor: fallback.borderColor || DEFAULT_BORDER_COLORS[index % DEFAULT_BORDER_COLORS.length],
        };
      })
    : CATEGORY_ITEMS;

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full select-none px-4 sm:px-8 lg:px-12 py-2">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black text-slate-900 tracking-tight leading-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal max-w-xl">
            Browse our curated catalog departments with express global delivery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleScrollLeft}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleScrollRight}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <Link
            to={ROUTES.PRODUCTS}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 shadow-xs transition-all ml-1.5 group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── CLEAN PREMIUM ROUND CATEGORY RAIL ── */}
      <div
        ref={scrollContainerRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="w-full flex items-center gap-7 sm:gap-9 lg:gap-11 overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 [&::-webkit-scrollbar]:hidden"
      >
        {displayList.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="group flex flex-col items-center text-center shrink-0 w-[130px] sm:w-[155px] snap-start cursor-pointer"
            >
              {/* Bold Solid Premium Ring Frame */}
              <div
                className="relative p-[3.5px] sm:p-[4px] rounded-full transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 shadow-md group-hover:shadow-xl"
                style={{ backgroundColor: cat.borderColor }}
              >
                {/* White Inner Gap Border */}
                <div className="rounded-full p-[2.5px] bg-white">
                  
                  {/* Clean Circular Photo */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 rounded-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Subtle Dark Overlay on Hover with Icon */}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Clean Minimalist Typography */}
              <div className="mt-3.5 space-y-0.5 w-full px-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {cat.name}
                </h3>
                <span className="inline-block text-[11px] text-slate-400 font-medium">
                  {cat.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySection;
