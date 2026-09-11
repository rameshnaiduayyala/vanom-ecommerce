import React from "react";
import { formatPrice } from "../../../utils/formatters.js";
import { Lock, Loader2, Tag, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { CartTaxEstimator } from "./CartTaxEstimator.jsx";

export function CartSummary({
  selectedCount,
  selectedSubtotal,
  totalSavings,
  appliedCoupon,
  couponDiscount,
  couponCode,
  couponError,
  setCouponCode,
  onApplyCoupon,
  estimatedShipping,
  estimatedTax,
  taxData,
  isCalculatingTax,
  finalTotal,
  hasSelectedOutOfStock,
  country,
  destination,
  setDestination,
  onProceedToCheckout,
  onClearCart,
}) {
  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
      {/* Main Checkout Card */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        {/* Grand Total Display */}
        <div>
          <div className="flex items-baseline justify-between text-base font-normal text-gray-900">
            <span className="font-semibold text-gray-800">Grand Total ({selectedCount} items):</span>
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(finalTotal, country.currency, country.symbol)}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-xs text-[#067d62] font-bold mt-1">
              <span>Coupon ({appliedCoupon.code})</span>
              <span>- {formatPrice(couponDiscount, country.currency, country.symbol)}</span>
            </div>
          )}
        </div>

        {/* Primary Proceed to Checkout Button */}
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

        {/* Price Details Breakdown */}
        <div className="border-t border-border pt-4 space-y-2.5 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Items Subtotal ({selectedCount} items)</span>
            <span className="font-semibold text-gray-900">
              {formatPrice(selectedSubtotal, country.currency, country.symbol)}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-[#067d62] font-medium">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>- {formatPrice(couponDiscount, country.currency, country.symbol)}</span>
            </div>
          )}

          {/* Shipping Estimate */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Estimated Shipping
              {estimatedShipping === 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">FREE</span>
              )}
            </span>
            <span className="font-medium text-gray-900">
              {estimatedShipping === 0 ? "FREE" : formatPrice(estimatedShipping, country.currency, country.symbol)}
            </span>
          </div>

          {/* Estimated Tax Breakdown */}
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
              {estimatedTax > 0
                ? formatPrice(estimatedTax, country.currency, country.symbol)
                : isCalculatingTax
                ? "Calculating..."
                : formatPrice(0, country.currency, country.symbol)}
            </span>
          </div>

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

          {totalSavings > 0 && (
            <div className="flex justify-between text-[#067d62] font-bold pt-1 border-t border-dashed border-gray-200">
              <span>Total Savings on MRP</span>
              <span>{formatPrice(totalSavings + couponDiscount, country.currency, country.symbol)}</span>
            </div>
          )}
        </div>

        {/* Dynamic Destination & Tax Estimator */}
        <CartTaxEstimator
          country={country}
          destination={destination}
          setDestination={setDestination}
          isCalculatingTax={isCalculatingTax}
        />

        {/* Promo Code / Coupon Accordion */}
        <div className="border-t border-border pt-3">
          <form onSubmit={onApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#007185]" /> Apply Promo Code or Voucher
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. VANOM10"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#007185] uppercase"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs border border-gray-300 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-[11px] text-[#067d62] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.label} applied!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Trust Guarantees Widget */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Vanom Buyer Assurance</h4>
        <div className="space-y-2.5 text-xs text-text-secondary">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#067d62] shrink-0" />
            <span>100% Genuine Organic Certified Products</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#007185] shrink-0" />
            <span>256-Bit Bank-Grade Encrypted Checkout</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#FF9900] shrink-0" />
            <span>Express Dispatched with Live Tracking</span>
          </div>
        </div>
      </div>

      {/* Quick Clear Local Cart Link */}
      <div className="text-center">
        <button
          onClick={onClearCart}
          className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer font-medium"
        >
          Empty Entire Cart
        </button>
      </div>
    </div>
  );
}
