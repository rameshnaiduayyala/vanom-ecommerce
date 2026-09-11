import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../utils/formatters.js";
import { Sparkles, Star } from "lucide-react";

export function CartRecommendations({ products, country, onAddToCart }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FF9900]" />
        Customers who bought items in your cart also bought
      </h3>
      <p className="text-xs text-text-secondary mb-4">Frequently paired organic bestsellers and combo packs</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-3.5 rounded-xl border border-border hover:border-gray-400 bg-white transition-all flex flex-col justify-between group"
          >
            <Link to={`/products/${p.slug || p.id}`} className="block">
              <div className="w-full h-32 rounded-lg bg-surface-muted overflow-hidden mb-2.5 border border-border/50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 hover:text-[#007185] leading-snug mb-1">
                {p.name}
              </h4>
            </Link>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex text-[#FFA41C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-[#007185] font-medium">{p.rating || 4.8}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2.5">
                <span className="text-xs font-bold text-gray-900">
                  {formatPrice(p.price, country.currency, country.symbol)}
                </span>
                {p.mrp && (
                  <span className="text-[10px] text-text-muted line-through">
                    {formatPrice(p.mrp, country.currency, country.symbol)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(p)}
                className="w-full py-1 px-2 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-[11px] font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
