import React from "react";
import { Link } from "react-router-dom";
import { Package, ExternalLink } from "lucide-react";
import { formatPrice } from "../../../utils/formatters.js";
import { resolveProductImageUrl } from "../../../utils/image.js";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80";

export function OrderItemsList({ items = [], currencyCode, currencySymbol }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-[#00875A]" />
          Purchased Items ({items.length})
        </h3>
        <span className="text-xs text-text-muted">Prices include applicable tax</span>
      </div>

      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const product = item.product || {};
          const variant = item.variant || {};
          const productName = item.name || product.name || "Product Item";
          const productSlug = product.slug || product.id || item.productId;
          const imageUrl =
            resolveProductImageUrl(product) ||
            item.image ||
            item.imageUrl ||
            product.images?.[0]?.url ||
            DEFAULT_IMAGE;

          const unitPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
          const lineTotal = item.total !== undefined ? item.total : item.subtotal || unitPrice * item.quantity;
          const sku = item.sku || variant.sku || product.sku;

          return (
            <div
              key={item.id || index}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Product Thumbnail with Link */}
                <Link
                  to={productSlug ? `/products/${productSlug}` : "#"}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs hover:border-[#00875A] transition-all p-1"
                >
                  <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </Link>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {product.category?.name && (
                      <span className="text-[10px] font-bold text-[#00875A] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {product.category.name}
                      </span>
                    )}
                    {product.brand?.name && (
                      <span className="text-[10px] font-medium text-slate-500">
                        • {product.brand.name}
                      </span>
                    )}
                  </div>

                  <Link
                    to={productSlug ? `/products/${productSlug}` : "#"}
                    className="text-sm font-bold text-text-primary hover:text-[#00875A] leading-snug transition-colors line-clamp-1 block"
                  >
                    {productName}
                  </Link>

                  {variant.name && (
                    <p className="text-xs font-medium text-slate-600">
                      Variant: <span className="font-semibold text-slate-900">{variant.name}</span>
                    </p>
                  )}

                  {sku && (
                    <p className="text-[11px] text-text-muted font-mono tracking-tight">
                      SKU: {sku}
                    </p>
                  )}

                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Qty:</span> {item.quantity} ×{" "}
                    {formatPrice(unitPrice, currencyCode, currencySymbol)}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50 shrink-0">
                <div className="text-base font-black text-text-primary">
                  {formatPrice(lineTotal, currencyCode, currencySymbol)}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Verified Price</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderItemsList;
