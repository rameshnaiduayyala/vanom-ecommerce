import React from "react";
import { CreditCard } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCountryStore } from "@/stores/country.store.js";
import { formatPrice } from "@/utils/formatters.js";

export function B2BCreditBadge({ className = "" }) {
  const { activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  const isApproved = activeCompany?.status === "APPROVED";
  if (!isApproved) return null;

  const paymentTerms = activeCompany?.paymentTermsDays
    ? `NET ${activeCompany.paymentTermsDays}`
    : "NET 30";
  const creditAmount = activeCompany?.availableCredit ?? activeCompany?.creditLimit ?? 385000;

  return (
    <div
      className={`hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg text-xs shadow-xs ${className}`}
      title="Approved Wholesale Commercial Credit Line"
    >
      <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
      <div className="flex flex-col">
        <span className="text-[9px] text-amber-800 font-bold uppercase tracking-wider leading-none">
          Credit ({paymentTerms})
        </span>
        <span className="font-extrabold text-amber-900 leading-tight">
          {formatPrice(creditAmount, country.currency, country.symbol)}
        </span>
      </div>
    </div>
  );
}

export default B2BCreditBadge;
