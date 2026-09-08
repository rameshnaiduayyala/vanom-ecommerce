/**
 * CategoryIconStrip.jsx — Responsive horizontal category pill strip.
 * Matches reference: rounded outline pills with icons, responsive touch scrolling on mobile, arrow controls on desktop.
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
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "home-living", name: "Home & Living", icon: Home },
  { id: "kitchen-dining", name: "Kitchen & Dining", icon: UtensilsCrossed },
  { id: "beauty-care", name: "Beauty & Personal Care", icon: Sparkles },
  { id: "health-wellness", name: "Health & Wellness", icon: HeartPulse },
  { id: "toys-baby", name: "Toys & Baby", icon: Baby },
  { id: "sports-fitness", name: "Sports & Fitness", icon: Dumbbell },
  { id: "stationery-office", name: "Stationery & Office", icon: BookOpen },
  { id: "pet-care", name: "Pet Care", icon: PawPrint },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "garden-outdoors", name: "Garden & Outdoors", icon: Trees },
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

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  return (
    <div className={`w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto relative py-2.5 px-0 sm:px-12 w-full min-w-0">
        
        {/* Desktop Left Scroll Button */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous categories"
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/95 shadow-md rounded-full items-center justify-center text-gray-700 hover:text-gray-900 transition-all cursor-pointer border border-gray-200/80 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pill Container (Touch-scrollable on mobile, seamless overflow) */}
        <div
          ref={scrollRef}
          className="flex items-center justify-start lg:justify-center overflow-x-auto scrollbar-none gap-2 sm:gap-2.5 px-4 sm:px-2 py-1 w-full min-w-0 touch-pan-x"
        >
          {items.map((cat, idx) => {
            const Icon = cat.icon;
            const isFirst = idx === 0 && !activeCategory;
            const isActive = activeCategory === cat.id || isFirst;

            return (
              <Link
                key={cat.id}
                to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                className={`flex items-center gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full border transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer select-none font-bold text-[11px] sm:text-xs uppercase tracking-wider ${isActive
                  ? "bg-[#358B5B] text-white border-[#358B5B] shadow-xs"
                  : "bg-transparent text-[#264D3B] border-[#7CA98B]/60 hover:bg-[#358B5B] hover:text-white hover:border-[#358B5B]"
                  }`}
              >
                {/* Left side outline line icon matching reference */}
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-[#264D3B] group-hover:text-white"
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
            className="flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full border border-[#7CA98B]/60 text-[#264D3B] hover:bg-[#358B5B] hover:text-white hover:border-[#358B5B] transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer font-bold text-[11px] sm:text-xs uppercase tracking-wider"
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={1.8} />
            <span>Show All</span>
          </Link>
        </div>

        {/* Desktop Right Scroll Button */}
        <button
          onClick={() => scroll(1)}
          aria-label="Next categories"
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/95 shadow-md rounded-full items-center justify-center text-gray-700 hover:text-gray-900 transition-all cursor-pointer border border-gray-200/80 hover:scale-105"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryIconStrip;
