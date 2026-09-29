import React from "react";
import { CreditCard, Star, ShieldCheck, Lock } from "lucide-react";
import {
  getProvidersForCountry,
  groupProviders,
} from "../config/paymentProviders.config.js";

// ─── Single provider tile ──────────────────────────────────────────────────────
function ProviderTile({ provider, selected, onSelect }) {
  return (
    <label
      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 select-none ${
        selected
          ? "border-[#185e3e] bg-[#185e3e]/5 shadow-sm ring-1 ring-[#185e3e]/20"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
      }`}
    >
      {/* Recommended badge */}
      {provider.recommended && (
        <span className="absolute top-2 right-2 text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
          <Star className="w-2 h-2 fill-current" /> Popular
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
          onChange={() => onSelect(provider.id)}
          className="accent-[#185e3e] cursor-pointer"
        />
      </div>

      <span className="text-[10px] text-gray-500 leading-snug">{provider.sub}</span>
    </label>
  );
}

// ─── Group header ──────────────────────────────────────────────────────────────
function GroupHeader({ label }) {
  const LABELS = {
    Card:   "Credit & Debit Cards",
    Wallet: "Digital & Instant Wallets",
    BNPL:   "Flexible Installments (BNPL)",
    Other:  "Other Payment Methods",
  };
  return (
    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5 first:mt-0">
      {LABELS[label] || label}
    </p>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function CheckoutPaymentSelector({ paymentMethod, onSelect, countryCode = "US" }) {
  const providers = getProvidersForCountry(countryCode);
  const groups    = groupProviders(providers);

  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#185e3e]/10 text-[#185e3e] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Payment Method
            </h3>
            <p className="text-[11px] text-gray-500">Choose your preferred Stripe payment option</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Stripe Protected</span>
        </div>
      </div>

      <div className="space-y-1">
        {Object.entries(groups).map(([groupName, groupProviders]) => (
          <div key={groupName}>
            <GroupHeader label={groupName} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      <div className="pt-2 text-[10px] text-gray-500 flex items-center justify-between border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          PCI-DSS Level 1 Service Provider
        </span>
        <span className="font-semibold text-slate-700">Powered by Stripe</span>
      </div>
    </div>
  );
}
