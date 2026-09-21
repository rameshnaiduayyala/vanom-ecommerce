import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatPrice } from "@/utils/formatters.js";

export function ProductCardInfo({
  productUrl,
  productName,
  categoryName,
  rating,
  reviewCount,
  subtitle,
  price,
  originalPrice,
  country,
  variant = "default",
}) {
  const isCompact = variant === "compact";

  return (
    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
      <div>
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span
            className={`font-black tracking-wider uppercase text-[#00875A] truncate ${
              isCompact ? "text-[9.5px]" : "text-[10px]"
            }`}
          >
            {categoryName || "Organic"}
          </span>

          {rating ? (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 text-[#F9BC15] fill-[#F9BC15]" />
              <span className="text-[11px] font-bold text-gray-800">{rating}</span>
              {reviewCount > 0 && (
                <span className="text-[10px] text-gray-400">
                  ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Product Name Link */}
        <Link
          to={productUrl}
          className="block group-hover:text-[#00875A] transition-colors"
        >
          <h3
            className={`font-bold text-gray-900 line-clamp-2 leading-snug ${
              isCompact ? "text-xs sm:text-[13px]" : "text-sm sm:text-base"
            }`}
          >
            {productName}
          </h3>
        </Link>

        {/* Real Subtitle/Specs (if provided) */}
        {subtitle && (
          <p
            className={`text-gray-500 line-clamp-1 mt-0.5 font-normal ${
              isCompact ? "text-[10px] mb-2" : "text-xs mb-3"
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Price Row */}
        <div
          className={`flex items-baseline gap-1.5 flex-wrap ${
            isCompact ? "mb-2 mt-1.5" : "mb-3 mt-2"
          }`}
        >
          <span
            className={`font-black text-gray-900 font-mono tracking-tight ${
              isCompact ? "text-sm sm:text-base" : "text-base sm:text-xl"
            }`}
          >
            {formatPrice(price, country.currency, country.symbol)}
          </span>

          {originalPrice > price && (
            <span
              className={`text-gray-400 line-through font-medium font-mono ${
                isCompact ? "text-[10px]" : "text-xs sm:text-sm"
              }`}
            >
              {formatPrice(originalPrice, country.currency, country.symbol)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCardInfo;
