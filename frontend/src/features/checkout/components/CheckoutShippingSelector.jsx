import React from "react";
import { Truck, CheckCircle2, Clock, ShieldCheck, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
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
  onRefreshRates = null,
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Shipping Method</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Shippo Live
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Live carrier rates
              {originWarehouse?.name ? ` • Fulfilled from ${originWarehouse.name}` : ""}
            </p>
          </div>
        </div>

        {/* Action & Verification Status */}
        <div className="flex items-center gap-2">
          {onRefreshRates && (
            <button
              type="button"
              onClick={onRefreshRates}
              disabled={isLoadingRates}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh live carrier shipping rates"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingRates ? "animate-spin text-brand-600" : ""}`} />
              <span>{isLoadingRates ? "Calculating..." : "Recalculate"}</span>
            </button>
          )}

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

      {/* Loading Skeleton only if no existing rates */}
      {isLoadingRates && shippingRates.length === 0 ? (
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
        <div className="py-6 text-center space-y-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
          <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-gray-100 text-gray-400">
            {addressValidation && !addressValidation.isValid ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <Truck className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-800">
              {addressValidation && !addressValidation.isValid
                ? "Address Verification Required"
                : "Enter & Verify Address to View Carrier Rates"}
            </p>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto leading-relaxed">
              {addressValidation && !addressValidation.isValid
                ? "Shippo could not verify the submitted delivery address. Please correct the street address or postal code above to unlock live carrier rates."
                : "Live shipping rates from USPS, UPS, and regional carriers will appear as soon as your street address and postal code are verified."}
            </p>
          </div>
          {addressValidation?.isValid && onRefreshRates && (
            <button
              type="button"
              onClick={onRefreshRates}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Calculate Live Rates
            </button>
          )}
        </div>
      ) : (
        /* Rates Radio List */
        <div className={`space-y-2.5 relative transition-opacity ${isLoadingRates ? "opacity-75 pointer-events-none" : "opacity-100"}`}>
          {isLoadingRates && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-md border text-xs font-semibold text-gray-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                Updating carrier quotes...
              </div>
            </div>
          )}
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
