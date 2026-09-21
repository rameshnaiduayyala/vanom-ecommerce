import React from "react";
import { Check, ShoppingCart, Ban } from "lucide-react";
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
    <div className={`flex items-center gap-1.5 w-full ${isCompact ? "pt-1" : "pt-2"}`}>
      {/* Quantity Stepper */}
      {!isOutOfStock && (
        <QuantityStepper
          quantity={quantity}
          size={isCompact ? "sm" : "md"}
          onDecrease={(e) => onStepQuantity(e, -1)}
          onIncrease={(e) => onStepQuantity(e, 1)}
        />
      )}

      {/* Add To Cart Button */}
      {isOutOfStock ? (
        <button
          type="button"
          disabled
          className={`flex-1 rounded-xl font-bold uppercase tracking-wider bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-1.5 ${
            isCompact ? "py-2 text-[10px]" : "py-2.5 px-3 text-xs"
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-gray-400" />
          <span>Out of Stock</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onAddToCart}
          disabled={addingToCart}
          className={`flex-1 rounded-xl font-black uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 border active:scale-95 ${
            isCompact ? "py-2 px-2 text-[10px] sm:text-[11px]" : "py-2.5 px-3 text-xs sm:text-sm"
          } ${
            addingToCart
              ? "bg-[#00875A] text-white border-[#00875A]"
              : "bg-[#00875A] hover:bg-[#00744D] text-white border-[#00875A] shadow-emerald-900/10"
          }`}
        >
          {addingToCart ? (
            <>
              <Check className="w-3.5 h-3.5 animate-in zoom-in" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ProductCardActions;
