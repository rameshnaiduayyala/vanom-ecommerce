import React from "react";
import { Lock, ShieldCheck, Loader2, Truck } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";
import { Button } from "../../../components/ui/Button.jsx";

export function CheckoutOrderSummary({
  cart,
  subtotal,
  taxAmount,
  taxData,
  isCalculatingTax,
  shipping,
  grandTotal,
  country,
  loading,
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
              {isCalculatingTax ? "…" : formatPrice(taxAmount, country.currency, country.symbol)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" /> Shipping
              {shipping === 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">FREE</span>
              )}
            </span>
            <span className="font-semibold text-gray-900">
              {shipping === 0 ? "FREE" : formatPrice(shipping, country.currency, country.symbol)}
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

        {/* CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-sm"
          isLoading={loading}
        >
          <Lock className="w-4 h-4 mr-1.5" />
          Place Order & Pay
        </Button>

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
