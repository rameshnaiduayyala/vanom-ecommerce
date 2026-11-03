import React from "react";
import { Check } from "lucide-react";

export function BusinessRegistrationStepper({ step, onStepClick, canGoToStep2 }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#006B3C]">
          Step {step} of 2
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
          {step === 1 ? "Company & Principal Address" : "Company Administrator Account"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStepClick(1)}
          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            step === 1
              ? "bg-[#006B3C] text-white shadow-xs"
              : "bg-emerald-50 text-[#006B3C] hover:bg-emerald-100"
          }`}
        >
          {step > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : "1"}
        </button>
        <div className="w-5 h-0.5 bg-slate-200" />
        <button
          type="button"
          onClick={() => {
            if (canGoToStep2) onStepClick(2);
          }}
          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            step === 2
              ? "bg-[#006B3C] text-white shadow-xs"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          2
        </button>
      </div>
    </div>
  );
}

export default BusinessRegistrationStepper;
