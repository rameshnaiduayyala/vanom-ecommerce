import React from "react";
import { CreditCard, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useCountryStore } from "@/stores/country.store.js";
import { formatPrice } from "@/utils/formatters.js";

export function CompanyCreditCard({ company }) {
  const { country } = useCountryStore();

  const creditLimit = company?.creditLimit ? Number(company.creditLimit) : 0;
  const availableCredit = company?.availableCredit !== undefined ? Number(company.availableCredit) : creditLimit;
  const usedCredit = Math.max(0, creditLimit - availableCredit);
  const percentUsed = creditLimit > 0 ? Math.min(100, Math.round((usedCredit / creditLimit) * 100)) : 0;
  const paymentTerms = company?.paymentTermsDays ? `NET ${company.paymentTermsDays}` : (creditLimit > 0 ? "NET 30" : "Prepaid");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>Commercial Credit Facility & Payment Terms</span>
        </h3>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-lg">
          {paymentTerms}
        </span>
      </div>

      {creditLimit > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Available Credit */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Available Credit Balance
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                {formatPrice(availableCredit, country.currency, country.symbol)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                Usable for purchase orders
              </span>
            </div>

            {/* Total Credit Limit */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Credit Limit
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatPrice(creditLimit, country.currency, country.symbol)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Approved commercial facility
              </span>
            </div>

            {/* Settlement Cycle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Settlement Window
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>{paymentTerms}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Payment window per PO invoice
              </span>
            </div>
          </div>

          {/* Credit Utilization Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Credit Facility Utilization:</span>
              <span className="font-bold text-slate-800">
                {percentUsed}% ({formatPrice(usedCredit, country.currency, country.symbol)} in active POs)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentUsed > 80 ? "bg-rose-500" : percentUsed > 50 ? "bg-amber-500" : "bg-emerald-600"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Prepaid Wholesale Account</p>
              <p className="text-slate-500">
                No credit line has been allocated yet. Orders can be paid directly via bank wire, cards, or gateway.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyCreditCard;
