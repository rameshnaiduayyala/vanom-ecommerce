import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../utils/formatters.js";
import { Sparkles, Gift, Minus, Plus, Share2 } from "lucide-react";

export function CartItemCard({
  item,
  isSelected,
  isGift,
  country,
  onToggleSelect,
  onToggleGift,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  onShare,
}) {
  const unitPrice = Number(item.price || item.unitPrice || 499);
  const mrp = Number(item.mrp || Math.round(unitPrice * 1.35));
  const itemDiscount = mrp > unitPrice ? Math.round(((mrp - unitPrice) / mrp) * 100) : 15;

  return (
    <div
      className={`py-5 flex flex-col sm:flex-row gap-4 transition-colors ${!isSelected ? "opacity-60 bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6" : ""
        }`}
    >
      {/* Checkbox */}
      <div className="pt-1 flex items-start">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="w-4 h-4 rounded border-gray-300 text-[#007185] focus:ring-[#007185] cursor-pointer"
          aria-label={`Select ${item.name}`}
        />
      </div>

      {/* Product Thumbnail */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-muted border border-border overflow-hidden shrink-0 relative group">
        <img
          src={item.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details & Action Bar */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Title & Mobile Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-[#007185] leading-snug line-clamp-2">
              <Link to={`/products/${item.slug || item.id}`}>
                {item.name || item.productName}
              </Link>
            </h3>
            <div className="text-right sm:hidden shrink-0">
              <div className="text-base font-bold text-gray-900">
                {formatPrice(unitPrice, country.currency, country.symbol)}
              </div>
            </div>
          </div>

          {/* Stock & Shipping Badge */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {item.maxStock !== undefined && item.maxStock <= 0 ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Out of Stock / Sold Out
              </span>
            ) : (
              <>
                <span className="text-[#067d62] font-semibold">
                  {item.maxStock ? `In stock (${item.maxStock} available)` : "In stock"}
                </span>
                {/* <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#007185] bg-[#EBF7FD] px-2 py-0.5 rounded text-[11px]">
                  <Sparkles className="w-3 h-3 text-[#FF9900]" /> Express Shipping
                </span> */}
              </>
            )}
          </div>

          {item.specs && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">{item.specs}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs pt-2 border-t border-gray-100">
          <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="p-1.5 px-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              title="Decrease"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-bold text-gray-900 select-none text-xs">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="p-1.5 px-2 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              title="Increase"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-gray-300">|</span>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
          >
            Delete
          </button>

          <span className="text-gray-300">|</span>

          <button
            type="button"
            onClick={() => onSaveForLater(item.id)}
            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
          >
            Save for later
          </button>

          <span className="text-gray-300">|</span>

          <button
            type="button"
            onClick={() => onShare(item)}
            className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer flex items-center gap-1"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>

      {/* Desktop Price */}
      <div className="hidden sm:block text-right shrink-0">
        <div className="text-lg font-bold text-gray-900">
          {formatPrice(unitPrice, country.currency, country.symbol)}
        </div>
        {mrp > unitPrice && (
          <div className="space-y-0.5">
            <div className="text-xs text-text-muted line-through">
              M.R.P.: {formatPrice(mrp, country.currency, country.symbol)}
            </div>
            <span className="inline-block text-[11px] font-bold text-[#B12704] bg-red-50 px-1.5 py-0.5 rounded">
              {itemDiscount}% off
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
