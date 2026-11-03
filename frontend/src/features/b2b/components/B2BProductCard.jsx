import React from "react";
import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

/**
 * Enterprise Minimalist B2B Product Card
 * Shows available weight packs with their respective wholesale prices.
 */
export function B2BProductCard({
  product,
  targetCountryCode,
  currencyCode,
  currencySymbol,
  onOrderClick,
}) {
  const variants =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants.filter((v) => v.isActive !== false)
      : [];

  // Find minimum starting wholesale price across weight variants
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
    const cp = product.countryPrices?.find(
      (p) => p.countryCode?.toUpperCase() === targetCountryCode
    );
    startingPrice =
      cp?.unitPrice !== undefined ? Number(cp.unitPrice) : product.basePriceUSD || 30.0;
  }

  const productImage = resolveProductImageUrl(product);
  const productDetailLink = `${ROUTES.B2B.CATALOG}/${product.slug || product.id}`;
  const categoryLabel = product.category || product.categoryName || "Wholesale";

  const handleActionClick = (e) => {
    if (onOrderClick) {
      e.preventDefault();
      e.stopPropagation();
      onOrderClick(product);
    }
  };

  return (
    <div className="group/b2b-card rounded-2xl bg-white border border-slate-200/90 hover:border-[#006B3C]/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs h-full">
      <div>
        {/* ── 1. Clean Product Image ── */}
        <Link
          to={productDetailLink}
          className="block aspect-square bg-[#FBFBFA] overflow-hidden relative border-b border-slate-100 p-5"
        >
          <img
            src={productImage}
            alt={product.name}
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
            <span className="text-[10px] font-bold text-[#006B3C] uppercase tracking-wider block truncate">
              {categoryLabel}
            </span>

            <Link to={productDetailLink} className="block mt-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover/b2b-card:text-[#006B3C] transition-colors leading-snug line-clamp-2 min-h-10">
                {product.name}
              </h3>
            </Link>

            {product.minOrderQuantity && (
              <span className="text-xs text-slate-500 font-medium block mt-1">
                MOQ: {product.minOrderQuantity} units
              </span>
            )}
          </div>

          {/* ── 3. Weight Options with Individual Prices ── */}
          {variants.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Weights & Pricing:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {variants.map((v, idx) => {
                  const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                  const cp = v.countryPrices?.find(
                    (p) => p.countryCode?.toUpperCase() === targetCountryCode
                  );
                  const price = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;

                  return (
                    <span
                      key={v.id || idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                    >
                      <span className="font-bold text-slate-800">{weightStr}</span>
                      {price !== null && (
                        <span className="font-black text-[#006B3C]">
                          {formatPrice(price, currencyCode, currencySymbol)}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 4. Starting Price Line ── */}
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-950 font-mono tracking-tight">
                {formatPrice(startingPrice, currencyCode, currencySymbol)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">/ unit</span>
            </div>
          </div>
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
          <span>Add to Bulk Order Sheet</span>
        </button>
      </div>
    </div>
  );
}

export default B2BProductCard;
