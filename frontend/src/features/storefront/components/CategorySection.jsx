import React from "react";
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
  Sparkles,
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
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Explore Marketplace Categories
          </h2>
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, idx) => {
          const Icon = CATEGORY_ICONS[cat.id] || Boxes;
          const colorClasses = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className={`p-5 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center group justify-between min-h-[140px] ${colorClasses}`}
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
