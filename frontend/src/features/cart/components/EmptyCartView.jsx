import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, Star } from "lucide-react";
import { ROUTES } from "../../../constants/routes.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { formatPrice } from "../../../utils/formatters.js";

export function EmptyCartView({ recommendedProducts, country, onAddToCart }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Shopping Cart | Vanom Store"
        description="View your shopping cart items, manage quantities, and proceed to secure checkout on Vanom."
        noindex={true}
      />
      <div className="bg-white rounded-2xl border border-border p-8 md:p-12 shadow-sm text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FAF3DF] flex items-center justify-center border border-[#e6d8b5]">
          <ShoppingBag className="w-12 h-12 text-[#185e3e]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2">
          Your Cart is empty
        </h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
          Shop today's epic deals, explore top organic picks, value combo packs, or continue where you left off.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to={ROUTES.PRODUCTS}>
            <button className="px-6 py-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold text-sm shadow-sm transition-all border border-[#FCD200] cursor-pointer">
              Explore All Products
            </button>
          </Link>
          <Link to={ROUTES.HOME}>
            <button className="px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 shadow-2xs transition-all cursor-pointer">
              Return to Store Home
            </button>
          </Link>
        </div>
      </div>

      {/* Recommended Products for Empty State */}
      {recommendedProducts.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF9900]" />
            Customers usually buy these top-rated items
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-border hover:border-gray-400 bg-white transition-all flex flex-col justify-between group"
              >
                <Link to={`/products/${p.slug || p.id}`} className="block">
                  <div className="w-full h-36 rounded-lg bg-surface-muted overflow-hidden mb-3 border border-border/50">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary line-clamp-2 hover:text-[#007185] leading-snug mb-1">
                    {p.name}
                  </h4>
                </Link>
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex text-[#FFA41C]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#007185] font-medium">{p.rating || 4.9}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(p.price, country.currency, country.symbol)}
                    </span>
                    {p.mrp && (
                      <span className="text-xs text-text-muted line-through">
                        {formatPrice(p.mrp, country.currency, country.symbol)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(p)}
                    className="w-full py-1.5 px-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 text-xs font-bold transition-all shadow-2xs border border-[#FCD200] cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
