import React from "react";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";

/**
 * Reusable PriceDisplay component with localized currency and discount calculation.
 */
export function PriceDisplay({
  price,
  originalPrice,
  currency,
  symbol,
  size = "md",
  showDiscount = true,
  showTaxLabel = false,
  className = "",
}) {
  const { country } = useCountryStore();
  const activeCurrency = currency || country?.currency || "USD";
  const activeSymbol = symbol || country?.symbol || "$";

  const numPrice = Number(price) || 0;
  const numOriginal = Number(originalPrice) || 0;
  const hasDiscount = numOriginal > numPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numOriginal - numPrice) / numOriginal) * 100)
    : 0;

  const sizeStyles = {
    sm: {
      price: "text-sm font-bold",
      original: "text-xs",
      badge: "text-[10px] px-1 py-0.5",
    },
    md: {
      price: "text-base font-extrabold",
      original: "text-xs",
      badge: "text-[11px] px-1.5 py-0.5",
    },
    lg: {
      price: "text-xl font-black",
      original: "text-sm",
      badge: "text-xs px-2 py-0.5",
    },
    xl: {
      price: "text-2xl sm:text-3xl font-black",
      original: "text-base",
      badge: "text-xs px-2 py-1",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-brand-700 tracking-tight ${currentSize.price}`}>
          {formatPrice(numPrice, activeCurrency, activeSymbol)}
        </span>

        {hasDiscount && (
          <span className={`text-text-muted line-through font-normal ${currentSize.original}`}>
            {formatPrice(numOriginal, activeCurrency, activeSymbol)}
          </span>
        )}

        {showDiscount && hasDiscount && discountPercent >= 3 && (
          <span className={`font-black rounded-full bg-red-100 text-red-700 border border-red-200 ${currentSize.badge}`}>
            Save {discountPercent}%
          </span>
        )}
      </div>

      {showTaxLabel && (
        <span className="text-[10px] text-text-muted">
          All prices inclusive of local VAT/GST
        </span>
      )}
    </div>
  );
}

export default PriceDisplay;
