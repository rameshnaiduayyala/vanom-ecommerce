import React from "react";
import { formatPrice } from "../../../utils/formatters.js";
import { Lock } from "lucide-react";
import { CartOrderSummary } from "./CartOrderSummary.jsx";
import { CartTaxEstimator } from "./CartTaxEstimator.jsx";
import { CartCoupon } from "./CartCoupon.jsx";
import { CartTrustBadges } from "./CartTrustBadges.jsx";

export function CartSummary({
  // totals
  selectedCount,
  selectedSubtotal,
  totalSavings,
  finalTotal,
  estimatedShipping,
  estimatedTax,
  taxData,
  isCalculatingTax,
  // coupon
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponDiscount,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  // tax destination
  destination,
  setDestination,
  // misc
  country,
  hasSelectedOutOfStock,
  onProceedToCheckout,
  onClearCart,
}) {
  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
      {/* ── Main checkout card ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        {/* Grand total */}
        <div>
          <div className="flex items-baseline justify-between text-base font-normal text-gray-900">
            <span className="font-semibold text-gray-800">
              Grand Total ({selectedCount} {selectedCount === 1 ? "item" : "items"}):
            </span>
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(finalTotal, country.currency, country.symbol)}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-xs text-[#067d62] font-bold mt-1">
              <span>Coupon ({appliedCoupon.code})</span>
              <span>− {formatPrice(couponDiscount, country.currency, country.symbol)}</span>
            </div>
          )}
        </div>

        {/* Checkout CTA */}
        <button
          type="button"
          onClick={onProceedToCheckout}
          disabled={selectedCount === 0 || hasSelectedOutOfStock}
          className={`w-full py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
            selectedCount > 0 && !hasSelectedOutOfStock
              ? "bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 border border-[#FCD200] active:scale-[0.99]"
              : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        >
          <Lock className="w-4 h-4 text-gray-800" />
          <span>
            {hasSelectedOutOfStock
              ? "Cannot Proceed (Items Out of Stock)"
              : `Proceed to Checkout (${selectedCount} items)`}
          </span>
        </button>

        {/* Price breakdown */}
        <CartOrderSummary
          selectedCount={selectedCount}
          selectedSubtotal={selectedSubtotal}
          totalSavings={totalSavings}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          estimatedShipping={estimatedShipping}
          estimatedTax={estimatedTax}
          taxData={taxData}
          isCalculatingTax={isCalculatingTax}
          country={country}
        />

        {/* Tax estimator */}
        <CartTaxEstimator
          country={country}
          destination={destination}
          setDestination={setDestination}
          isCalculatingTax={isCalculatingTax}
        />

        {/* Coupon */}
        <CartCoupon
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCoupon={appliedCoupon}
          couponError={couponError}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      </div>

      {/* ── Trust badges ───────────────────────────────────────────── */}
      <CartTrustBadges />

      {/* ── Clear cart ─────────────────────────────────────────────── */}
      <div className="text-center">
        <button
          type="button"
          onClick={onClearCart}
          className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer font-medium"
        >
          Empty Entire Cart
        </button>
      </div>
    </div>
  );
}
