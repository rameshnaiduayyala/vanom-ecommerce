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
  const discountPercent =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <div className="flex-1 flex flex-col justify-between space-y-2">
      <div className="space-y-1.5">
        {/* Category chip + Rating */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60 truncate max-w-[65%] ${
              isCompact ? "text-[8.5px]" : "text-[9.5px]"
            }`}
          >
            {categoryName || "Organic"}
          </span>

          {rating ? (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-slate-800">{rating}</span>
              {reviewCount > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Product Name */}
        <Link to={productUrl} className="block">
          <h3
            className={`font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-200 line-clamp-2 leading-snug ${
              isCompact ? "text-xs sm:text-[13px]" : "text-sm sm:text-[15px]"
            }`}
          >
            {productName}
          </h3>
        </Link>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`text-slate-400 line-clamp-1 font-normal leading-tight ${
              isCompact ? "text-[10px]" : "text-xs"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Price Block */}
      <div className={`flex items-end gap-2 ${isCompact ? "mt-1" : "mt-1.5"}`}>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className={`font-black text-slate-900 tracking-tight leading-none ${
              isCompact ? "text-base" : "text-lg sm:text-xl"
            }`}
          >
            {formatPrice(price, country.currency, country.symbol)}
          </span>

          {originalPrice > price && (
            <span
              className={`text-slate-400 line-through font-medium ${
                isCompact ? "text-[10px]" : "text-xs sm:text-sm"
              }`}
            >
              {formatPrice(originalPrice, country.currency, country.symbol)}
            </span>
          )}
        </div>

        {discountPercent && (
          <span className="ml-auto shrink-0 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductCardInfo;
