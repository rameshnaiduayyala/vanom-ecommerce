import React from "react";
import { Tag, CheckCircle2 } from "lucide-react";

export function CartCoupon({
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  return (
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
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#067d62] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.label} applied!
            </p>
            {onRemoveCoupon && (
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-[11px] text-red-500 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
