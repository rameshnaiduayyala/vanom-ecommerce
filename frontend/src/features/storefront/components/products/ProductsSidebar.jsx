import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Package, Building2, ArrowRight, ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { ROUTES } from "../../../../constants/routes.js";

export function ProductsSidebar({
  categories = [],
  currentCategory,
  totalProductsCount = 0,
  onSelectCategory,
  onClearCategory,
}) {
  const [expandedParents, setExpandedParents] = useState({});

  const toggleExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

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
            const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
            const isParentSelected = currentCategory === cat.id || currentCategory === cat.slug;
            const isChildSelected = hasChildren && cat.children.some((c) => currentCategory === c.id || currentCategory === c.slug);
            const isExpanded = expandedParents[cat.id] ?? (isParentSelected || isChildSelected);

            return (
              <div key={cat.id} className="space-y-1">
                <div
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between group ${
                    isParentSelected
                      ? "bg-[#E6F4EA] text-[#00875A] shadow-2xs font-bold"
                      : isChildSelected
                      ? "bg-[#F4FAF6] text-[#00875A] font-medium"
                      : "text-[#3D5648] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#F4F7F4] text-[#5E7D67]">
                      {typeof cat.count === "number" ? cat.count : 0}
                    </span>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className="p-1 hover:bg-black/5 rounded-md transition-colors text-gray-500 cursor-pointer"
                        aria-label="Toggle subcategories"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#00875A]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories (Children) */}
                {hasChildren && isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l-2 border-[#E6F4EA] ml-3 py-1">
                    {cat.children.map((sub) => {
                      const isSubSelected = currentCategory === sub.id || currentCategory === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSelectCategory(sub.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                            isSubSelected
                              ? "bg-[#00875A] text-white font-bold shadow-2xs"
                              : "text-[#5E7D67] hover:bg-[#F0F7F1] hover:text-[#00875A]"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                            isSubSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {typeof sub.count === "number" ? sub.count : 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

export default ProductsSidebar;
