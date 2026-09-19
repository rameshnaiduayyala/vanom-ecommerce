import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCardCompact } from "./ProductCardCompact.jsx";
import { ROUTES } from "../../../../constants/routes.js";

export function NewLaunchesSection({ products = [], className = "" }) {
  const scrollRef = useRef(null);
  const list = Array.isArray(products) ? products : [];

  if (list.length === 0) {
    return null;
  }

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className={`py-8 sm:py-10 px-4 sm:px-8 lg:px-12 select-none w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto w-full min-w-0">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#204B38] tracking-tight">
              New Launches
            </h2>
            <p className="text-xs text-[#345547] mt-0.5">
              Discover the latest conscious formulations and handcrafted additions.
            </p>
          </div>

          {/* Controls & View All */}
          <div className="flex items-center gap-3">
            <Link
              to={`${ROUTES.PRODUCTS}?filter=new`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#358B5B] hover:text-[#204B38] hover:underline transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcb0] hover:bg-[#358B5B] hover:text-white text-gray-700 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Row */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 px-1 w-full min-w-0 touch-pan-x"
        >
          {list.map((prod) => (
            <div key={prod.id} className="w-[180px] sm:w-[220px] shrink-0">
              <ProductCardCompact product={prod} badge="New Launch" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewLaunchesSection;
