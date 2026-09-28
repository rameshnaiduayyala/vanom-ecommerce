import React from "react";
import { Truck, CheckCircle2, Clock, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";

export function CheckoutShippingSelector({
  shippingRates = [],
  selectedRateId,
  onSelectRate,
  isLoadingRates = false,
  addressValidation = null,
  currencySymbol = "$",
  originWarehouse = null,
  freeShippingEligible = false,
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Shipping Method</h3>
            <p className="text-[11px] text-gray-500">
              Live carrier rates via Shippo
              {originWarehouse?.name ? ` • Fulfilled from ${originWarehouse.name}` : ""}
            </p>
          </div>
        </div>

        {/* Address Verification Badge */}
        {addressValidation?.isValid ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Address Verified
          </span>
        ) : addressValidation && !addressValidation.isValid ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Check Address
          </span>
        ) : null}
      </div>

      {/* Free Shipping Banner if eligible */}
      {freeShippingEligible && (
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Special Offer: You unlocked Free Standard Shipping on this order!
          </span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingRates ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="w-28 h-3.5 bg-gray-200 rounded" />
                  <div className="w-44 h-2.5 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : shippingRates.length === 0 ? (
        <div className="py-6 text-center space-y-2">
          <Truck className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs font-medium text-gray-600">
            Enter your street address above to view live carrier shipping options.
          </p>
        </div>
      ) : (
        /* Rates Radio List */
        <div className="space-y-2.5">
          {shippingRates.map((rate) => {
            const isSelected = selectedRateId === rate.id;
            const amountNum = parseFloat(rate.amount || 0);
            const isFree = rate.isFreeShipping || amountNum === 0;

            return (
              <label
                key={rate.id}
                onClick={() => onSelectRate(rate)}
                className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/20 shadow-xs ring-1 ring-brand-500/20"
                    : "border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Radio indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-brand-600 bg-brand-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        {rate.carrier} • {rate.service}
                      </span>
                      {isFree && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-emerald-100 text-emerald-800">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>
                        {rate.durationTerms ||
                          (rate.estimatedDays
                            ? `Estimated ${rate.estimatedDays} business day${rate.estimatedDays > 1 ? "s" : ""}`
                            : "Standard delivery")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span
                    className={`text-sm font-extrabold ${
                      isFree ? "text-emerald-700" : "text-gray-900"
                    }`}
                  >
                    {isFree ? "FREE" : `${currencySymbol}${amountNum.toFixed(2)}`}
                  </span>
                  {rate.originalAmount && isFree && (
                    <span className="block text-[10px] text-gray-400 line-through">
                      {currencySymbol}{parseFloat(rate.originalAmount).toFixed(2)}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Trust Micro-Copy */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          Carrier Tracking provided with every order
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Powered by Shippo
        </span>
      </div>
    </div>
  );
}
