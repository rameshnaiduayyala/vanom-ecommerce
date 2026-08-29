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
  Layers,
} from "lucide-react";

const CATEGORY_DATA = [
  {
    id: "cat-1",
    name: "Electronics & Tech",
    subtitle: "Enterprise IT & POS",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-2",
    name: "Groceries & FMCG",
    subtitle: "Bulk Staple Consignments",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-3",
    name: "Industrial Packaging",
    subtitle: "Cartons & Pallet Films",
    icon: Boxes,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-4",
    name: "Commercial Kitchen",
    subtitle: "HORECA & Heavy Equipment",
    icon: CookingPot,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-5",
    name: "Safety & Security",
    subtitle: "PoE CCTV & Access Tech",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-6",
    name: "Building Hardware",
    subtitle: "Structural & Fasteners",
    icon: Hammer,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
  },
];

export function CategorySection({ categories = [] }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });

  const catList = Array.isArray(categories) ? categories : (categories?.items || []);

  const enriched = catList.map((cat, idx) => {
    const meta = CATEGORY_DATA.find((d) => d.id === cat.id) || CATEGORY_DATA[idx % CATEGORY_DATA.length];
    return { ...cat, ...meta };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Enterprise Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Procurement Classifications
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Direct Manufacturer Supply</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Browse by Industrial Category
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Scroll Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors group"
          >
            <span>Master Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Enterprise Circular Category Rail */}
      <div
        ref={scrollRef}
        className="flex items-start gap-6 sm:gap-10 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
      >
        {enriched.map((cat) => {
          const Icon = cat.icon || Layers;
          return (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="group flex flex-col items-center text-center shrink-0 w-28 sm:w-32 snap-start cursor-pointer"
            >
              {/* Premium Circular Avatar */}
              <div className="relative mb-3">
                <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full p-1 bg-white border border-slate-200 shadow-2xs group-hover:border-slate-900 group-hover:shadow-md group-hover:scale-104 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                  </div>
                </div>

                {/* Subtle Enterprise Corner Badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white border-2 border-white shadow-xs flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                </div>
              </div>

              {/* Title & Industrial Subtitle */}
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 leading-snug">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                {cat.subtitle || `${cat.count || 20}+ Verified SKUs`}
              </p>
            </Link>
          );
        })}

        {/* View All Enterprise Tile */}
        <Link
          to={ROUTES.PRODUCTS}
          className="group flex flex-col items-center text-center shrink-0 w-28 sm:w-32 snap-start cursor-pointer"
        >
          <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-slate-50 border border-dashed border-slate-300 group-hover:border-slate-900 group-hover:bg-slate-100 flex flex-col items-center justify-center text-slate-800 shadow-2xs group-hover:scale-104 transition-all duration-300 mb-3">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-900" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
            All Sectors
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Full Taxonomy →</p>
        </Link>
      </div>
    </section>
  );
}

export default CategorySection;
