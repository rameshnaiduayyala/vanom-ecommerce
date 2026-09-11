import React from "react";
import { Package } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80";

export function OrderItemsList({ items = [], currencyCode, currencySymbol }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-600" />
          Purchased Items ({items.length})
        </h3>
        <span className="text-xs text-text-muted">Prices include applicable tax</span>
      </div>

      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-muted border border-border overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                <img
                  src={item.image || DEFAULT_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary leading-snug">{item.name}</h4>
                {item.sku && (
                  <p className="text-xs text-text-muted font-mono tracking-tight">SKU: {item.sku}</p>
                )}
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Qty:</span> {item.quantity} ×{" "}
                  {formatPrice(item.unitPrice, currencyCode, currencySymbol)}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
              <div className="text-sm font-bold text-text-primary">
                {formatPrice(item.subtotal || item.unitPrice * item.quantity, currencyCode, currencySymbol)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Verified Price</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
