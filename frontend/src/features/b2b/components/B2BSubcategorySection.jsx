import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FolderTree } from "lucide-react";
import { ROUTES } from "../../../constants/routes.js";
import { B2BProductCard } from "./B2BProductCard.jsx";

/**
 * B2BSubcategorySection — Displays a subcategory with its header and a vertical
 * responsive grid of products (matching B2C vertical product cards).
 */
export function B2BSubcategorySection({
  subcategory,
  products = [],
  targetCountryCode,
  currencyCode,
  currencySymbol,
}) {
  if (!products || products.length === 0) return null;

  const subcategoryName = subcategory?.name || "Commodities";
  const subcategoryImage =
    subcategory?.imageUrl || subcategory?.image || subcategory?.thumbnail;

  const bulkOrderCategoryLink = `${ROUTES.B2B.BULK_ORDER}?category=${encodeURIComponent(
    subcategoryName
  )}`;

  return (
    <div className="w-full space-y-4 pt-2">
      {/* ── Subcategory Header Row ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {subcategoryImage ? (
            <img
              src={subcategoryImage}
              alt={subcategoryName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#006B3C]/20 bg-white shadow-2xs shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-[#006B3C] font-black text-xs flex items-center justify-center border border-emerald-200 shrink-0">
              {subcategoryName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{subcategoryName}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
            </h4>
          </div>
        </div>

        <Link
          to={bulkOrderCategoryLink}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#006B3C] hover:text-emerald-700 transition-colors"
        >
          <span>View All in Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Vertical Product Cards Grid (Matching B2C Vertical Display) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <B2BProductCard
            key={product.id}
            product={product}
            targetCountryCode={targetCountryCode}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
        ))}
      </div>
    </div>
  );
}

export default B2BSubcategorySection;

