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
    gradient: "from-blue-600/70 to-indigo-900/85",
  },
  {
    id: "cat-2",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    gradient: "from-amber-600/70 to-orange-900/85",
  },
  {
    id: "cat-3",
    icon: Boxes,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-600/70 to-teal-900/85",
  },
  {
    id: "cat-4",
    icon: CookingPot,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
    gradient: "from-rose-600/70 to-pink-900/85",
  },
  {
    id: "cat-5",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    gradient: "from-cyan-600/70 to-blue-900/85",
  },
  {
    id: "cat-6",
    icon: Hammer,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    gradient: "from-slate-600/70 to-slate-900/85",
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2B1C] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-sm text-[#5E7D67] mt-1">
            Browse our curated product departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-9 h-9 rounded-lg bg-white border border-[#E8EDE9] flex items-center justify-center text-[#5E7D67] hover:text-[#074428] hover:border-[#074428] transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="w-9 h-9 rounded-lg bg-white border border-[#E8EDE9] flex items-center justify-center text-[#5E7D67] hover:text-[#074428] hover:border-[#074428] transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <Link
            to={ROUTES.PRODUCTS}
            className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-[#074428] hover:text-[#059669] px-4 py-2 rounded-lg border border-[#E8EDE9] hover:border-[#074428] hover:bg-[#F6FAF7] transition-all group ml-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 scrollbar-none"
      >
        {enriched.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden snap-start shrink-0 min-w-[200px] sm:min-w-[220px] h-[200px] sm:h-[220px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/80 backdrop-blur-sm">
                    {cat.count || 0}+ items
                  </span>
                </div>

                <div>
                  <h4 className="text-[14px] font-bold text-white leading-tight">
                    {cat.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1.5 text-white/60 text-[12px] font-medium group-hover:text-white/80 group-hover:gap-2 transition-all">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* See All card */}
        <Link
          to={ROUTES.PRODUCTS}
          className="group relative rounded-2xl snap-start shrink-0 min-w-[140px] h-[200px] sm:h-[220px] bg-[#074428] flex flex-col items-center justify-center gap-3 text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-[12px] font-semibold text-center text-white/80">
            All<br />Categories
          </span>
        </Link>
      </div>
    </section>
  );
}
