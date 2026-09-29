import React from "react";
import { Lock, ShieldCheck, Loader2, Truck, AlertCircle } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";
import { Button } from "../../../components/ui/Button.jsx";

export function CheckoutOrderSummary({
  cart,
  subtotal,
  taxAmount,
  taxData,
  isCalculatingTax,
  isTaxReady,
  shipping,
  selectedRate,
  isLoadingRates,
  isShippingReady,
  grandTotal,
  country,
  loading,
  canPlaceOrder = false,
  disabledReason = null,
}) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* ── Price card ─────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Order Summary
        </h3>

        {/* Cart item list */}
        {cart.items?.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-border">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-gray-900 shrink-0">
                  {formatPrice((item.price || item.unitPrice || 0) * item.quantity, country.currency, country.symbol)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price breakdown */}
        <div className="space-y-2.5 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Subtotal ({cart.items?.length || 0} items)</span>
            <span className="font-semibold text-gray-900">
              {formatPrice(subtotal, country.currency, country.symbol)}
            </span>
          </div>

          {/* Tax breakdown */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Tax
              {taxData?.effectiveRate > 0 && (
                <span className="text-[10px] text-[#007185]">
                  ({(taxData.effectiveRate * 100).toFixed(2)}%)
                </span>
              )}
              {isCalculatingTax && <Loader2 className="w-3 h-3 animate-spin text-[#007185]" />}
            </span>
            <span className="font-semibold text-gray-900">
              {isCalculatingTax ? (
                <span className="text-gray-400 font-normal italic">Calculating…</span>
              ) : taxData !== null ? (
                formatPrice(taxAmount, country.currency, country.symbol)
              ) : (
                <span className="text-gray-400 font-normal italic">—</span>
              )}
            </span>
          </div>

          {/* Shipping breakdown (Strictly no $4.99 default) */}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-gray-500" />
              <span>Shipping</span>
              {selectedRate && (
                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[110px]">
                  ({selectedRate.carrier})
                </span>
              )}
              {shipping === 0 && selectedRate && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">FREE</span>
              )}
              {isLoadingRates && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
            </span>
            <span className="font-semibold text-gray-900">
              {isLoadingRates ? (
                <span className="text-gray-400 font-normal italic">Calculating…</span>
              ) : shipping !== null ? (
                shipping === 0 ? "FREE" : formatPrice(shipping, country.currency, country.symbol)
              ) : (
                <span className="text-amber-700 font-medium text-[11px]">Select method</span>
              )}
            </span>
          </div>
        </div>

        {/* Grand total */}
        <div className="flex justify-between items-baseline pt-3 border-t border-border">
          <span className="text-sm font-bold text-gray-900">Total Payable</span>
          <span className="text-2xl font-black text-[#185e3e]">
            {formatPrice(grandTotal, country.currency, country.symbol)}
          </span>
        </div>

        {/* CTA Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-sm"
          isLoading={loading}
          disabled={!canPlaceOrder || loading}
        >
          <Lock className="w-4 h-4 mr-1.5" />
          Place Order & Pay
        </Button>

        {/* Status notice when button is disabled */}
        {!canPlaceOrder && disabledReason && (
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="font-medium">{disabledReason}</span>
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          By placing your order you agree to Vanom's terms. Prices are validated server-side.
        </p>
      </div>

      {/* ── Trust badges ────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-2.5">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Vanom Buyer Guarantee
        </h4>
        {[
          { icon: "🔒", text: "256-bit SSL encrypted checkout" },
          { icon: "🛡️", text: "100% genuine certified products" },
          { icon: "↩️", text: "30-day hassle-free returns" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
