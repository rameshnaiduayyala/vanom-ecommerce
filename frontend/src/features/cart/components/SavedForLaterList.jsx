import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../utils/formatters.js";

export function SavedForLaterList({ savedItems, country, onMoveToCart, onRemoveSaved }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved for later</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {savedItems.length} {savedItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted">
          You have no items saved for later. Click "Save for later" on any cart item to park it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border bg-white flex flex-col justify-between shadow-2xs hover:border-gray-400 transition-all"
            >
              <div>
                <div className="w-full h-36 rounded-lg bg-surface-muted overflow-hidden mb-3 border border-border/50">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-[#007185] mb-1">
                  <Link to={`/products/${item.slug || item.id}`}>{item.name}</Link>
                </h4>
                <p className="text-xs text-[#067d62] font-semibold mb-1">In stock</p>
                <div className="text-sm font-bold text-gray-900 mb-3">
                  {formatPrice(item.price || item.unitPrice || 499, country.currency, country.symbol)}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onMoveToCart(item)}
                  className="w-full py-1.5 px-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-xs font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
                >
                  Move to Cart
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveSaved(item.id)}
                  className="w-full py-1 px-3 text-xs text-[#007185] hover:text-[#C7511F] hover:underline text-center cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
