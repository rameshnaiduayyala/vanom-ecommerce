import React from "react";
import { Loader2 } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";

export function CartOrderSummary({
  selectedCount,
  selectedSubtotal,
  totalSavings,
  appliedCoupon,
  couponDiscount,
  estimatedShipping,
  estimatedTax,
  taxData,
  isCalculatingTax,
  country,
}) {
  return (
    <div className="border-t border-border pt-4 space-y-2.5 text-xs text-text-secondary">
      {/* Subtotal */}
      <div className="flex justify-between">
        <span>Items Subtotal ({selectedCount} items)</span>
        <span className="font-semibold text-gray-900">
          {formatPrice(selectedSubtotal, country.currency, country.symbol)}
        </span>
      </div>

      {/* Coupon discount */}
      {appliedCoupon && (
        <div className="flex justify-between text-[#067d62] font-medium">
          <span>Coupon Discount ({appliedCoupon.code})</span>
          <span>− {formatPrice(couponDiscount, country.currency, country.symbol)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1">
          Estimated Shipping
          {estimatedShipping === 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">FREE</span>
          )}
        </span>
        <span className="font-medium text-gray-900">
          {estimatedShipping === 0
            ? "FREE"
            : formatPrice(estimatedShipping, country.currency, country.symbol)}
        </span>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-900 font-medium">
            Estimated Tax
            {taxData?.effectiveRate > 0 && (
              <span className="text-[11px] text-[#007185] font-semibold ml-1">
                ({(taxData.effectiveRate * 100).toFixed(2)}%)
              </span>
            )}
          </span>
          {isCalculatingTax && <Loader2 className="w-3 h-3 text-[#007185] animate-spin" />}
        </div>
        <span className="font-bold text-gray-900">
          {isCalculatingTax
            ? "Calculating..."
            : formatPrice(estimatedTax, country.currency, country.symbol)}
        </span>
      </div>

      {/* Tax jurisdiction badge */}
      {taxData?.jurisdiction && (
        <div className="text-[11px] text-[#007185] flex items-center justify-between bg-sky-50 px-2 py-1 rounded-md border border-sky-100">
          <span className="truncate">
            📍 {taxData.jurisdiction} {taxData.taxType ? `(${taxData.taxType})` : ""}
          </span>
          <span className="font-semibold shrink-0">
            {taxData.provider === "AVALARA_AVATAX" ? "AvaTax" : "Stripe Tax"}
          </span>
        </div>
      )}

      {/* Total savings */}
      {totalSavings > 0 && (
        <div className="flex justify-between text-[#067d62] font-bold pt-1 border-t border-dashed border-gray-200">
          <span>Total Savings on MRP</span>
          <span>{formatPrice(totalSavings + couponDiscount, country.currency, country.symbol)}</span>
        </div>
      )}
    </div>
  );
}
