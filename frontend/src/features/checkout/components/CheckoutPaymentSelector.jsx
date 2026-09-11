import React from "react";
import { CreditCard, Star } from "lucide-react";
import {
  getProvidersForCountry,
  groupProviders,
} from "../config/paymentProviders.config.js";

// ─── Single provider tile ──────────────────────────────────────────────────────
function ProviderTile({ provider, selected, onSelect }) {
  return (
    <label
      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 select-none ${
        provider.disabled
          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
          : selected
          ? "border-[#185e3e] bg-[#185e3e]/5 shadow-sm ring-1 ring-[#185e3e]/20"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {/* Coming Soon badge */}
      {provider.comingSoon && (
        <span className="absolute top-2 right-2 text-[9px] font-black bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
          Soon
        </span>
      )}

      {/* Recommended badge */}
      {provider.recommended && !provider.comingSoon && (
        <span className="absolute top-2 right-2 text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
          <Star className="w-2 h-2 fill-current" /> Best
        </span>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{provider.icon}</span>
          <span className="text-xs font-bold text-gray-900 leading-tight">{provider.label}</span>
        </div>
        <input
          type="radio"
          name="paymentMethod"
          checked={selected}
          onChange={() => !provider.disabled && onSelect(provider.id)}
          disabled={provider.disabled}
          className="accent-[#185e3e]"
        />
      </div>

      <span className="text-[10px] text-gray-500">{provider.sub}</span>
    </label>
  );
}

// ─── Group header ──────────────────────────────────────────────────────────────
function GroupHeader({ label }) {
  const LABELS = {
    Card:   "💳 Card",
    Wallet: "👜 Digital Wallets",
    BNPL:   "🔄 Buy Now, Pay Later",
    Other:  "Other",
  };
  return (
    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-3 mb-1.5 first:mt-0">
      {LABELS[label] || label}
    </p>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function CheckoutPaymentSelector({ paymentMethod, onSelect, countryCode = "US" }) {
  const providers = getProvidersForCountry(countryCode);
  const groups    = groupProviders(providers);

  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-2">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-[#185e3e]/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-[#185e3e]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Payment Method
          </h3>
          <p className="text-[11px] text-gray-500">All transactions are encrypted</p>
        </div>
      </div>

      {Object.entries(groups).map(([groupName, groupProviders]) => (
        <div key={groupName}>
          <GroupHeader label={groupName} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {groupProviders.map((provider) => (
              <ProviderTile
                key={provider.id}
                provider={provider}
                selected={paymentMethod === provider.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
