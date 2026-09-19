import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent } from "lucide-react";
import { ComboProductCard } from "./ComboProductCard.jsx";
import { ROUTES } from "../../../../constants/routes.js";

export function ComboProductsSection({
  combos = [],
  className = "",
}) {
  const list = Array.isArray(combos) ? combos : [];

  if (list.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 sm:py-14 w-full max-w-full overflow-hidden ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 w-full min-w-0">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#7C3AED]/15 text-[#5B21B6] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 border border-[#7C3AED]/25 shadow-2xs">
              <BadgePercent className="w-3.5 h-3.5 text-[#7C3AED]" />
              Super Saver Bundles
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Curated Combos & Value Packs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Hand-picked pantry & superfood pairings designed for daily healthy living and up to 40% bundle savings.
            </p>
          </div>

          <Link
            to={`${ROUTES.PRODUCTS}?category=combos`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#7C3AED] hover:text-[#5B21B6] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>View All Combos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {list.map((combo) => (
            <ComboProductCard key={combo.id} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComboProductsSection;
