import React from "react";
import { Check, ShoppingCart, Ban, Plus } from "lucide-react";
import { QuantityStepper } from "../QuantityStepper.jsx";

export function ProductCardActions({
  quantity,
  addingToCart,
  isOutOfStock,
  onStepQuantity,
  onAddToCart,
  variant = "default",
}) {
  const isCompact = variant === "compact";

  return (
    <div className={`flex flex-col gap-2 ${isCompact ? "pt-0" : "pt-0"}`}>
      {/* Thin separator */}
      <div className="h-px bg-slate-100 rounded-full" />

      <div className="flex items-center gap-2 w-full">
        {/* Quantity Stepper */}
        {!isOutOfStock && (
          <QuantityStepper
            quantity={quantity}
            size={isCompact ? "sm" : "md"}
            onDecrease={(e) => onStepQuantity(e, -1)}
            onIncrease={(e) => onStepQuantity(e, 1)}
          />
        )}

        {/* Add To Cart / Out of Stock */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className={`flex-1 rounded-xl font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5 ${
              isCompact ? "py-1.5 text-[10px]" : "py-2.5 text-xs"
            }`}
          >
            <Ban className="w-3 h-3" />
            <span>Out of Stock</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddToCart}
            disabled={addingToCart}
            className={`flex-1 group/btn relative overflow-hidden rounded-xl font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border active:scale-[0.97] ${
              isCompact ? "py-1.5 text-[10px]" : "py-2.5 text-xs"
            } ${
              addingToCart
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-[#00875A] hover:bg-[#00744D] text-white border-[#00875A] hover:border-[#00744D] shadow-sm hover:shadow-emerald-800/30 hover:shadow-md"
            }`}
          >
            {/* Shine sweep on hover */}
            {!addingToCart && (
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 ease-in-out pointer-events-none" />
            )}

            {addingToCart ? (
              <>
                <Check className="w-3.5 h-3.5 animate-in zoom-in duration-200" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-200" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
export default ProductCardActions;
