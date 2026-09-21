import React from "react";

export function BusinessRegistrationStepper({ step, onStepClick, canGoToStep2 }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E8EDE9] pb-4 mb-4">
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#00875A]">
          Step {step} of 2
        </span>
        <h2 className="text-base sm:text-lg font-black text-[#0F2B1C]">
          {step === 1 ? "Company & Principal Address" : "Company Administrator Account"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStepClick(1)}
          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            step === 1
              ? "bg-[#00875A] text-white shadow-xs"
              : "bg-[#E6F4EA] text-[#00875A] hover:bg-[#D5EFE0]"
          }`}
        >
          1
        </button>
        <div className="w-4 h-0.5 bg-[#DCE8DF]" />
        <button
          type="button"
          onClick={() => {
            if (canGoToStep2) onStepClick(2);
          }}
          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            step === 2
              ? "bg-[#00875A] text-white shadow-xs"
              : "bg-[#F0F4F2] text-[#8B9E91]"
          }`}
        >
          2
        </button>
      </div>
    </div>
  );
}

export default BusinessRegistrationStepper;
