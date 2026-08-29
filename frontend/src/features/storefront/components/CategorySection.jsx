import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const CATEGORY_DATA = [
  {
    id: "cat-1",
    name: "TV & Tech",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-4",
    name: "Appliances",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-electronics",
    name: "Cell Phones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-wearables",
    name: "Wearable Tech",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-gaming",
    name: "Video Games",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-audio",
    name: "Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-3",
    name: "Packaging & Logistics",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "cat-2",
    name: "Groceries & FMCG",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80",
  },
];

export function CategorySection({ categories = [] }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });

  const catList = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORY_DATA;
  const enriched = catList.map((cat, idx) => {
    const meta = CATEGORY_DATA.find((d) => d.id === cat.id) || CATEGORY_DATA[idx % CATEGORY_DATA.length];
    return { ...cat, ...meta };
  });

  return (
    <section className="w-full">
      {/* ── BestBuy-Style Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
            Top quality. Even better prices.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
            We inspect and verify every catalog item. All you have to do is save.
          </p>
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="text-xs sm:text-sm font-bold text-[#003876] hover:underline whitespace-nowrap mt-1 sm:mt-0 flex items-center gap-1"
        >
          Shop all Deals
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── BestBuy Outlet Feature Card + Circle Rail Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

        {/* Left Feature Card (BestBuy Outlet / Open-Box Style) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Link
            to={`${ROUTES.PRODUCTS}?filter=deals`}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003876] via-[#1a3a6b] to-[#b3203f] p-6 text-white flex flex-col justify-between h-[180px] sm:h-[200px] shadow-md hover:shadow-xl transition-all duration-300 block"
          >
            {/* Top pill badge */}
            <div className="flex items-center gap-1.5 w-fit bg-[#001E3D]/60 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-md">
              <span className="text-[11px] font-black text-[#FFE000] tracking-wider uppercase">
                VANOM OUTLET
              </span>
            </div>

            {/* Big Open-Box Headline */}
            <div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none group-hover:scale-103 transition-transform origin-left">
                Open-box
              </h3>
              <p className="text-[11px] text-white/80 font-medium mt-1">
                Save up to 40% on certified surplus & wholesale overstock
              </p>
            </div>
          </Link>
        </div>

        {/* Right Scrollable Clean Gray Circle Rail with Floating Arrow Controls */}
        <div className="lg:col-span-8 xl:col-span-9 relative">

          {/* Left Arrow Button */}
          <button
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-[#003876] hover:scale-110 transition-all cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-[#003876] hover:scale-110 transition-all cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Circle category items */}
          <div
            ref={scrollRef}
            className="flex items-start gap-4 sm:gap-6 overflow-x-auto py-2 px-4 snap-x scrollbar-none scroll-smooth"
          >
            {enriched.map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 snap-start cursor-pointer"
              >
                {/* Clean Gray Circle with Centered Transparent Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f4f4f4] hover:bg-[#e8e8e8] flex items-center justify-center p-3.5 mb-2.5 transition-colors duration-200 shadow-2xs group-hover:scale-105">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Subtitle Underneath with Hover Underline */}
                <span className="text-xs font-semibold text-slate-900 group-hover:text-[#003876] group-hover:underline transition-colors text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default CategorySection;
