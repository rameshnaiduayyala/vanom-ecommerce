import React from "react";
import { Plus, Minus } from "lucide-react";

/**
 * Reusable QuantityStepper component
 */
export function QuantityStepper({
  value = 1,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  size = "md",
  disabled = false,
  className = "",
}) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val < min) onChange(min);
      else if (val > max) onChange(max);
      else onChange(val);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  };

  const btnClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-border bg-white shadow-xs overflow-hidden ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`flex items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors ${
          btnClasses[size] || btnClasses.md
        }`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-12 text-center font-bold text-text-primary focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`flex items-center justify-center text-text-secondary hover:bg-surface-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors ${
          btnClasses[size] || btnClasses.md
        }`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default QuantityStepper;
