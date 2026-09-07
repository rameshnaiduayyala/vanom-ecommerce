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

export function CategoryIconStrip({ categories = [] }) {
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
    <div className="w-full bg-white border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative py-4">
        {/* Scroll Left */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous categories"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all cursor-pointer border border-gray-100 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable strip */}
        <div
          ref={scrollRef}
          className="flex items-center justify-start lg:justify-between overflow-x-auto scrollbar-none gap-2 sm:gap-4 px-6"
        >
          {items.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                className="flex flex-col items-center gap-2 shrink-0 min-w-[76px] sm:min-w-[88px] group cursor-pointer py-1 transition-all"
              >
                {/* Icon circle matching reference (light green bg + dark green outline/icon) */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[#EAF7F0] group-hover:bg-[#d5eee0] group-hover:scale-108 transition-all duration-200 shadow-2xs">
                  <Icon className="w-6 h-6 text-[#006B3C] group-hover:text-[#003D2B] transition-colors" strokeWidth={1.75} />
                </div>
                {/* Label */}
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-700 group-hover:text-[#003D2B] text-center leading-tight max-w-[80px] line-clamp-2 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}

          {/* "Show All" / "View All" Button */}
          <Link
            to={ROUTES.PRODUCTS}
            className="flex flex-col items-center gap-2 shrink-0 min-w-[76px] sm:min-w-[88px] group cursor-pointer py-1 transition-all"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-[#003D2B] group-hover:scale-108 transition-all duration-200 shadow-2xs">
              <Grid className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" strokeWidth={1.75} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 group-hover:text-[#003D2B] text-center leading-tight transition-colors">
              Show All
            </span>
          </Link>
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll(1)}
          aria-label="Next categories"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all cursor-pointer border border-gray-100 hover:scale-105"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryIconStrip;

