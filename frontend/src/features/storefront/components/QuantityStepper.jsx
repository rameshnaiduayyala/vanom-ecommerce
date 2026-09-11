import React from "react";
import { Minus, Plus } from "lucide-react";

/**
 * Reusable quantity stepper — shared between ProductCard and ProductCardCompact.
 * size: "sm" (compact cards) | "md" (standard cards)
 */
export function QuantityStepper({ quantity, onIncrease, onDecrease, size = "md" }) {
  const isSm = size === "sm";

  return (
    <div
      className={`flex items-center justify-between border border-[rgb(60,170,130)]/40 bg-[rgb(60,170,130)]/8 rounded-lg ${
        isSm ? "px-1.5 py-1 min-w-[66px]" : "px-2.5 py-2 min-w-[80px] sm:min-w-[90px]"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="text-gray-600 hover:text-gray-900 disabled:opacity-30 active:scale-90 transition-transform cursor-pointer"
      >
        <Minus className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>

      <span
        className={`font-black text-gray-900 select-none px-1 ${
          isSm ? "text-[11px]" : "text-xs sm:text-sm"
        }`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        aria-label="Increase quantity"
        className="text-gray-600 hover:text-gray-900 active:scale-90 transition-transform cursor-pointer"
      >
        <Plus className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>
    </div>
  );
}
