import React from "react";
import { CartItemCard } from "./CartItemCard.jsx";
import { formatPrice } from "../../../utils/formatters.js";

export function CartItemList({
  items,
  selectedIds,
  giftOptions,
  country,
  allSelected,
  selectedCount,
  selectedSubtotal,
  onToggleSelectAll,
  onToggleSelectItem,
  onToggleGift,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  onShare,
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-end justify-between pb-3 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={onToggleSelectAll}
              className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-medium cursor-pointer"
            >
              {allSelected ? "Deselect all items" : "Select all items"}
            </button>
            <span className="text-gray-300 text-xs">•</span>
            <span className="text-xs text-text-muted">
              {items.length} {items.length === 1 ? "item" : "items"} in cart
            </span>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">Price</span>
        </div>
      </div>

      {/* Item rows */}
      {items.length === 0 ? (
        <div className="py-10 text-center text-text-secondary text-sm">
          No active items in cart. Check your saved items below.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              isGift={Boolean(giftOptions[item.id])}
              country={country}
              onToggleSelect={onToggleSelectItem}
              onToggleGift={onToggleGift}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
              onSaveForLater={onSaveForLater}
              onShare={onShare}
            />
          ))}
        </div>
      )}

      {/* Subtotal footer */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-border flex justify-end items-baseline gap-2 text-right">
          <span className="text-base font-normal text-gray-800">
            Subtotal ({selectedCount} {selectedCount === 1 ? "item" : "items"}):
          </span>
          <span className="text-xl font-black text-gray-900">
            {formatPrice(selectedSubtotal, country.currency, country.symbol)}
          </span>
        </div>
      )}
    </div>
  );
}
