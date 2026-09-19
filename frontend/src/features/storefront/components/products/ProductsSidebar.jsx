import React from "react";
import { Link } from "react-router-dom";
import { Filter, Package, Building2, ArrowRight } from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

export function ProductsSidebar({
  categories = [],
  currentCategory,
  totalProductsCount = 0,
  onSelectCategory,
  onClearCategory,
}) {
  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
      {/* Department Filter Card */}
      <div className="bg-white rounded-3xl border border-[#DCE8DF] p-5 shadow-xs">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F2B1C] mb-3 pb-2 border-b border-[#E8EDE9] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Departments</span>
          </span>
          <span className="text-[10px] font-mono text-[#5E7D67]">({categories.length})</span>
        </h4>

        <div className="space-y-1">
          <button
            onClick={onClearCategory}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
              !currentCategory
                ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
            }`}
          >
            <span>All Catalog Items</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70">
              {totalProductsCount}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.id || currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                    : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F7F4] text-[#5E7D67]">
                  {typeof cat.count === "number" ? cat.count : 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality & Dispatch Assurance Card */}
      <div className="p-5 rounded-3xl bg-[#064027] text-white space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-[#4ADE80] font-bold text-xs uppercase tracking-wider">
          <Package className="w-4 h-4" />
          <span>DIRECT REGIONAL DISPATCH</span>
        </div>
        <p className="text-xs text-emerald-100/80 leading-relaxed">
          All catalog items are verified for authentic multi-market delivery with guaranteed tracking across US and UK.
        </p>
        <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-[#4ADE80]">
          <span>24-48h Departure</span>
          <span>•</span>
          <span>Inspected Standard</span>
        </div>
      </div>

      {/* B2B Procurement Support */}
      <div className="p-5 rounded-3xl bg-white border border-[#DCE8DF] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#00875A] font-bold text-xs uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>COMMERCIAL SUPPLY</span>
        </div>
        <p className="text-xs text-[#5E7D67] leading-relaxed">
          Need customized contract supply, scheduled deliveries, or pallet volume?
        </p>
        <Link
          to={ROUTES.B2B.QUOTES}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] hover:underline"
        >
          <span>Request Commercial Proforma</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}
