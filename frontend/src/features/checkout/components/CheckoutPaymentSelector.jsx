import React from "react";
import { CreditCard } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id:    "CARD",
    title: "Credit / Debit Card",
    sub:   "Visa, Mastercard, Amex",
    icon:  "💳",
  },
  {
    id:    "PAYPAL",
    title: "PayPal",
    sub:   "Secure PayPal checkout",
    icon:  "🅿️",
  },
  {
    id:    "APPLE_PAY",
    title: "Apple Pay",
    sub:   "Touch / Face ID payment",
    icon:  "🍎",
  },
];

export function CheckoutPaymentSelector({ paymentMethod, onSelect }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-[#185e3e]/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-[#185e3e]" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Payment Method
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PAYMENT_METHODS.map((pm) => (
          <label
            key={pm.id}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
              paymentMethod === pm.id
                ? "border-[#185e3e] bg-[#185e3e]/5 shadow-sm ring-1 ring-[#185e3e]/20"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{pm.icon}</span>
                <span className="text-xs font-bold text-gray-900">{pm.title}</span>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === pm.id}
                onChange={() => onSelect(pm.id)}
                className="text-[#185e3e] accent-[#185e3e]"
              />
            </div>
            <span className="text-[10px] text-gray-500">{pm.sub}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
