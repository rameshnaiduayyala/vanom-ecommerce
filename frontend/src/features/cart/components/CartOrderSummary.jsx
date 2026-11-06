import React from "react";
import { formatPrice } from "../../../utils/formatters.js";

export function CartOrderSummary({
  selectedCount,
  selectedSubtotal,
  totalSavings,
  appliedCoupon,
  couponDiscount,
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

      {/* Note about Shipping & Taxes */}
      <div className="pt-1 text-[11px] text-gray-500 italic">
        Shipping & taxes calculated at checkout
      </div>

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
