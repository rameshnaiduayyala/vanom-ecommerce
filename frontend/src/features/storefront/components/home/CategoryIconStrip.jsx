/**
 * CategoryIconStrip.jsx — Horizontal category strip with circle icons.
 * Matches reference: white strip with round icons, clean typography, and a "Show All" option.
 */
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Laptop,
  Home,
  UtensilsCrossed,
  Sparkles,
  HeartPulse,
  Baby,
  Dumbbell,
  BookOpen,
  PawPrint,
  Car,
  Trees,
  Grid,
} from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

const DEFAULT_CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: Laptop, color: "#006B3C", bg: "#EAF7F0" },
  { id: "home-living", name: "Home & Living", icon: Home, color: "#006B3C", bg: "#EAF7F0" },
  { id: "kitchen-dining", name: "Kitchen & Dining", icon: UtensilsCrossed, color: "#006B3C", bg: "#EAF7F0" },
  { id: "beauty-care", name: "Beauty & Personal Care", icon: Sparkles, color: "#006B3C", bg: "#EAF7F0" },
  { id: "health-wellness", name: "Health & Wellness", icon: HeartPulse, color: "#006B3C", bg: "#EAF7F0" },
  { id: "toys-baby", name: "Toys & Baby", icon: Baby, color: "#006B3C", bg: "#EAF7F0" },
  { id: "sports-fitness", name: "Sports & Fitness", icon: Dumbbell, color: "#006B3C", bg: "#EAF7F0" },
  { id: "stationery-office", name: "Stationery & Office", icon: BookOpen, color: "#006B3C", bg: "#EAF7F0" },
  { id: "pet-care", name: "Pet Care", icon: PawPrint, color: "#006B3C", bg: "#EAF7F0" },
  { id: "automotive", name: "Automotive", icon: Car, color: "#006B3C", bg: "#EAF7F0" },
  { id: "garden-outdoors", name: "Garden & Outdoors", icon: Trees, color: "#006B3C", bg: "#EAF7F0" },
];

export function CategoryIconStrip({ categories = [], activeCategory = null, onSelectCategory, className = "" }) {
  const scrollRef = useRef(null);

  const items =
    (categories.length > 0
      ? categories.map((c, i) => {
        const fb = DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length];
        return { ...fb, id: c.id || fb.id, name: c.name || fb.name };
      })
      : DEFAULT_CATEGORIES).slice(0, 10);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-[1440px] mx-auto px-8 sm:px-8 relative py-3">
        {/* Scroll Left */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous categories"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all cursor-pointer border border-gray-200/80 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable pill strip */}
        <div
          ref={scrollRef}
          className="flex items-center justify-start lg:justify-center overflow-x-auto scrollbar-none gap-2 sm:gap-3 px-6 py-2"
        >
          {items.map((cat, idx) => {
            const Icon = cat.icon;
            const isFirst = idx === 0 && !activeCategory;
            const isActive = activeCategory === cat.id || isFirst;

            return (
              <Link
                key={cat.id}
                to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full border transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer select-none font-bold text-xs uppercase tracking-wider ${isActive
                    ? "bg-[#358B5B] text-white border-[#358B5B] shadow-sm"
                    : "bg-transparent text-[#264D3B] border-[#7CA98B]/60 hover:bg-[#358B5B] hover:text-white hover:border-[#358B5B]"
                  }`}
              >
                {/* Left side outline line icon matching reference */}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-[#264D3B] group-hover:text-white"
                    }`}
                  strokeWidth={1.8}
                />
                {/* Right side category uppercase name */}
                <span>{cat.name}</span>
              </Link>
            );
          })}

          {/* "Show All" Pill */}
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-[#7CA98B]/60 text-[#264D3B] hover:bg-[#358B5B] hover:text-white hover:border-[#358B5B] transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer font-bold text-xs uppercase tracking-wider"
          >
            <Grid className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            <span>Show All</span>
          </Link>
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll(1)}
          aria-label="Next categories"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all cursor-pointer border border-gray-200/80 hover:scale-105"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryIconStrip;


