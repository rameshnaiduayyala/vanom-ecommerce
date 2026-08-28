import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import {
  Laptop,
  UtensilsCrossed,
  Boxes,
  CookingPot,
  Shirt,
  Hammer,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORY_ICONS = {
  "cat-1": Laptop,
  "cat-2": UtensilsCrossed,
  "cat-3": Boxes,
  "cat-4": CookingPot,
  "cat-5": Shirt,
  "cat-6": Hammer,
};

const CATEGORY_COLORS = [
  "from-blue-500/10 to-indigo-500/5 text-blue-600 border-blue-200/60 hover:border-blue-400",
  "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-200/60 hover:border-amber-400",
  "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200/60 hover:border-emerald-400",
  "from-rose-500/10 to-pink-500/5 text-rose-600 border-rose-200/60 hover:border-rose-400",
  "from-purple-500/10 to-violet-500/5 text-purple-600 border-purple-200/60 hover:border-purple-400",
  "from-slate-500/10 to-zinc-500/5 text-slate-700 border-slate-200/60 hover:border-slate-400",
];

export function CategorySection({ categories = [] }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Heading & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Explore Marketplace Categories
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Scroll Arrows */}
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

          <Link
            to={ROUTES.PRODUCTS}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Category Horizontal Scroll Rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 scrollbar-none -mx-2 sm:-mx-0 px-2 sm:px-0"
      >
        {categories.map((cat, idx) => {
          const Icon = CATEGORY_ICONS[cat.id] || Boxes;
          const colorClasses = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className={`p-5 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center group justify-between min-h-[140px] min-w-[170px] sm:min-w-[190px] snap-start shrink-0 ${colorClasses}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-700 transition-colors leading-tight">
                  {cat.name}
                </h4>
                <span className="text-[10px] font-semibold text-text-muted mt-1 block">
                  {cat.count || 0}+ Products
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
