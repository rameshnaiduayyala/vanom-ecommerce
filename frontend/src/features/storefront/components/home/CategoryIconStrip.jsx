/**
 * CategoryIconStrip.jsx — Horizontal scrollable category strip with circle icons.
 * Matches reference: white bar, round green icon circles, small label below.
 */
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Laptop, Sofa, CookingPot, Sparkles, Activity, Baby, Dumbbell, BookOpen, PawPrint, Car, Leaf, UtensilsCrossed } from "lucide-react";

const FALLBACK_CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: Laptop, color: "#006B3C", bg: "#EAF7F0" },
  { id: "home-living", name: "Home & Living", icon: Sofa, color: "#B45309", bg: "#FEF3C7" },
  { id: "kitchen", name: "Kitchen & Dining", icon: CookingPot, color: "#9F1239", bg: "#FFF1F2" },
  { id: "beauty", name: "Beauty & Personal Care", icon: Sparkles, color: "#7C3AED", bg: "#F5F3FF" },
  { id: "health", name: "Health & Wellness", icon: Activity, color: "#0369A1", bg: "#F0F9FF" },
  { id: "toys", name: "Toys & Baby", icon: Baby, color: "#EA580C", bg: "#FFF7ED" },
  { id: "sports", name: "Sports & Fitness", icon: Dumbbell, color: "#15803D", bg: "#F0FDF4" },
  { id: "stationery", name: "Stationery & Office", icon: BookOpen, color: "#B45309", bg: "#FEFCE8" },
  { id: "pets", name: "Pet Care", icon: PawPrint, color: "#6D28D9", bg: "#F5F3FF" },
  { id: "auto", name: "Automotive", icon: Car, color: "#0F172A", bg: "#F1F5F9" },
  { id: "garden", name: "Garden & Outdoor", icon: Leaf, color: "#166534", bg: "#F0FDF4" },
  { id: "grocery", name: "Groceries & FMCG", icon: UtensilsCrossed, color: "#065F46", bg: "#ECFDF5" },
];

export function CategoryIconStrip({ categories = [] }) {
  const scrollRef = useRef(null);

  const items =
    categories.length > 0
      ? categories.map((c, i) => {
          const fb = FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length];
          return { ...fb, id: c.id || fb.id, name: c.name || fb.name };
        })
      : FALLBACK_CATEGORIES;

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative">
        {/* Scroll Left */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable strip */}
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto scrollbar-none gap-1 py-3 px-7"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 shrink-0 min-w-[72px] sm:min-w-[80px] group cursor-pointer px-1 py-1 rounded-xl hover:bg-gray-50 transition-all"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Icon circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} strokeWidth={2} />
                </div>
                {/* Label */}
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight max-w-[68px] line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryIconStrip;
