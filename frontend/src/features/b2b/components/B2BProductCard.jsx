import React from "react";
import { Link } from "react-router-dom";
import { Boxes, Scale } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

/**
 * Enterprise Minimalist B2B Product Card
 * - Shows complete, untruncated weight & wholesale prices in a fixed-height scrollable pack section for uniform card heights.
 */
export function B2BProductCard({
  product,
  targetCountryCode,
  currencyCode,
  currencySymbol,
  onOrderClick,
}) {
  const variants =
    Array.isArray(product?.variants) && product.variants.length > 0
      ? product.variants.filter((v) => v.isActive !== false)
      : [];

  // Minimum starting wholesale price across weight variants
  let startingPrice = null;
  if (variants.length > 0) {
    const prices = variants
      .map((v) => {
        const cp = v.countryPrices?.find(
          (p) => p.countryCode?.toUpperCase() === targetCountryCode
        );
        return cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;
      })
      .filter((p) => p !== null && !isNaN(p) && p > 0);

    if (prices.length > 0) {
      startingPrice = Math.min(...prices);
    }
  }

  if (startingPrice === null) {
    const cp = product?.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode
    );
    startingPrice =
      cp?.unitPrice !== undefined ? Number(cp.unitPrice) : product?.basePriceUSD || null;
  }

  // Real MOQ only from product/variants — no default fallback
  const moq =
    product?.minOrderQuantity ||
    product?.moq ||
    variants.find((v) => v.minOrderQuantity || v.moq)?.minOrderQuantity ||
    variants.find((v) => v.minOrderQuantity || v.moq)?.moq ||
    null;

  const productImage = resolveProductImageUrl(product);
  const productDetailLink = `${ROUTES.B2B.CATALOG}/${product?.slug || product?.id}`;
  const categoryLabel = product?.category || product?.categoryName || "Wholesale Commodity";

  const handleActionClick = (e) => {
    if (onOrderClick) {
      e.preventDefault();
      e.stopPropagation();
      onOrderClick(product);
    }
  };

  return (
    <div className="group/b2b-card rounded-2xl bg-white border border-slate-200/90 hover:border-[#006B3C]/60 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs h-full">
      <div>
        {/* ── 1. Clean Product Image (No badges / overlays) ── */}
        <Link
          to={productDetailLink}
          className="block aspect-square bg-[#FBFBFA] overflow-hidden relative border-b border-slate-100 p-5"
        >
          <img
            src={productImage}
            alt={product?.name || "Product"}
            className="w-full h-full object-contain mix-blend-multiply group-hover/b2b-card:scale-104 transition-transform duration-300 ease-out"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
        </Link>

        {/* ── 2. Card Details ── */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            {/* Header: Category & Real MOQ */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-[#006B3C] uppercase tracking-wider truncate">
                {categoryLabel}
              </span>

              {moq && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black font-mono shrink-0 shadow-2xs whitespace-nowrap">
                  MOQ: {moq} units
                </span>
              )}
            </div>

            <Link to={productDetailLink} className="block mt-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover/b2b-card:text-[#006B3C] transition-colors leading-snug line-clamp-2 min-h-10">
                {product?.name}
              </h3>
            </Link>
          </div>

          {/* ── 3. Available Packs: Fixed Height with Smooth Vertical Scroll ── */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5">
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#006B3C]" />
                <span>Available Packs</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {variants.length > 0 ? `${variants.length} tiers` : "Single pack"}
              </span>
            </div>

            {/* Fixed Height Container with Custom Slim Scrollbar */}
            <div className="h-16 overflow-y-auto pr-1 flex flex-wrap content-start gap-1.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
              {variants.length > 0 ? (
                variants.map((v, idx) => {
                  const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                  const cp = v.countryPrices?.find(
                    (p) => p.countryCode?.toUpperCase() === targetCountryCode
                  );
                  const price = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;

                  return (
                    <div
                      key={v.id || idx}
                      className="inline-flex items-center text-[11px] font-mono rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-[#006B3C]/50 hover:bg-[#F4F9F6] transition-all overflow-hidden whitespace-nowrap"
                    >
                      {/* Weight Tag */}
                      <span className="px-2 py-0.5 font-bold text-slate-800 bg-slate-50 border-r border-slate-200/80">
                        {weightStr}
                      </span>
                      {/* Price Tag */}
                      <span className="px-2 py-0.5 font-black text-[#006B3C] tracking-tight">
                        {price !== null
                          ? formatPrice(price, currencyCode, currencySymbol)
                          : "—"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Standard Case Pack
                </div>
              )}
            </div>
          </div>

          {/* ── 4. Starting Price Line ── */}
          {startingPrice !== null && (
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-950 font-mono tracking-tight">
                  {formatPrice(startingPrice, currencyCode, currencySymbol)}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">/ unit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Enterprise Action Button ── */}
      <div className="p-4 sm:p-5 pt-0">
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full py-2.5 px-3 rounded-xl bg-[#006B3C] hover:bg-[#00542F] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          <Boxes className="w-4 h-4" />
          <span>Add to sheet</span>
        </button>
      </div>
    </div>
  );
}

export default B2BProductCard;
