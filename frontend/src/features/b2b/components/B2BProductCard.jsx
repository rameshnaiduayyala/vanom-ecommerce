import React from "react";
import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";

/**
 * Single Wholesale Product Card
 */
export function B2BProductCard({
  product,
  targetCountryCode,
  currencyCode,
  currencySymbol,
  onOrderClick,
}) {
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.filter((v) => v.isActive !== false)
    : [];

  // Find starting wholesale price across weight variants
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

  const handleActionClick = (e) => {
    if (onOrderClick) {
      e.preventDefault();
      onOrderClick(product);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 hover:border-[#006B3C]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden shadow-xs group h-full">
      <div>
        {/* Image and Weight Variant Badge */}
        <Link
          to={`${ROUTES.B2B.CATALOG}/${product.slug || product.id}`}
          className="block aspect-16/9 bg-slate-100 overflow-hidden relative"
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="bg-white/95 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs font-mono">
              {variants.length > 0 ? `${variants.length} Weights` : "Wholesale"}
            </span>
            {product.brand && (
              <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-lg shadow-xs">
                {product.brand}
              </span>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              {product.category || product.categoryName || "Wholesale Commodity"}
            </span>
            <Link to={`${ROUTES.B2B.CATALOG}/${product.slug || product.id}`} className="block">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#006B3C] transition-colors leading-snug mt-0.5 line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Weight Variants Options Preview */}
          {variants.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-medium block">
                Available Weights:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v, idx) => {
                  const weightStr = v.name || `${v.weight}${v.weightUnit || "kg"}`;
                  const cp = v.countryPrices?.find(
                    (p) => p.countryCode?.toUpperCase() === targetCountryCode
                  );
                  const price = cp?.unitPrice !== undefined ? Number(cp.unitPrice) : null;

                  return (
                    <span
                      key={v.id || idx}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold font-mono"
                    >
                      {weightStr}{" "}
                      {price !== null &&
                        `(${formatPrice(price, currencyCode, currencySymbol)})`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Starting Price:</span>
            <span className="font-black text-emerald-800 text-base font-mono">
              {formatPrice(startingPrice, currencyCode, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="p-4 sm:p-5 pt-0">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleActionClick}
          className="w-full font-bold shadow-xs cursor-pointer bg-[#006B3C] hover:bg-emerald-700 text-white"
          icon={Boxes}
        >
          Add to Bulk Order Sheet
        </Button>
      </div>
    </div>
  );
}

export default B2BProductCard;
