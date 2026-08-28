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
} from "lucide-react";

const CATEGORY_DATA = [
  {
    id: "cat-1",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    gradient: "from-blue-600/80 to-indigo-900/90",
    accent: "bg-blue-500",
    iconColor: "text-blue-400",
  },
  {
    id: "cat-2",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    gradient: "from-amber-600/80 to-orange-900/90",
    accent: "bg-amber-500",
    iconColor: "text-amber-400",
  },
  {
    id: "cat-3",
    icon: Boxes,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-600/80 to-teal-900/90",
    accent: "bg-emerald-500",
    iconColor: "text-emerald-400",
  },
  {
    id: "cat-4",
    icon: CookingPot,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
    gradient: "from-rose-600/80 to-pink-900/90",
    accent: "bg-rose-500",
    iconColor: "text-rose-400",
  },
  {
    id: "cat-5",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    gradient: "from-cyan-600/80 to-blue-900/90",
    accent: "bg-cyan-500",
    iconColor: "text-cyan-400",
  },
  {
    id: "cat-6",
    icon: Hammer,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    gradient: "from-slate-600/80 to-slate-900/90",
    accent: "bg-slate-500",
    iconColor: "text-slate-300",
  },
];

export function CategorySection({ categories = [] }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  const catList = Array.isArray(categories) ? categories : (categories?.items || []);

  const enriched = catList.map((cat) => {
    const meta = CATEGORY_DATA.find((d) => d.id === cat.id) || CATEGORY_DATA[0];
    return { ...cat, ...meta };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-brand-500" />
          <h2 className="text-base font-black text-text-primary tracking-tight">Shop by Category</h2>
          <span className="text-[10px] font-bold text-text-muted bg-surface-muted border border-border px-2 py-0.5 rounded-full">
            {categories.length} categories
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 hover:bg-brand-50 shadow-xs transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-500 hover:bg-brand-50 shadow-xs transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={ROUTES.PRODUCTS}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 scrollbar-none"
      >
        {enriched.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden snap-start shrink-0 min-w-[200px] sm:min-w-[220px] h-[200px] sm:h-[220px] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Icon badge at top */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
                    {cat.count || 0}+ SKUs
                  </span>
                </div>

                {/* Name at bottom */}
                <div>
                  <h4 className="text-sm font-black text-white leading-tight drop-shadow-sm">
                    {cat.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1.5 text-white/80 text-[11px] font-semibold group-hover:gap-2 transition-all">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* "See All" card at the end */}
        <Link
          to={ROUTES.PRODUCTS}
          className="group relative rounded-2xl snap-start shrink-0 min-w-[140px] h-[200px] sm:h-[220px] bg-gradient-to-br from-brand-600 to-brand-900 flex flex-col items-center justify-center gap-3 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-brand-500/40"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-black text-center leading-tight">
            All<br />Categories
          </span>
        </Link>
      </div>
    </section>
  );
}
