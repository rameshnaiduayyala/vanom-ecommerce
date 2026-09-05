import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ShoppingCart, Star, Heart, Eye, Zap, TrendingUp } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";

export function ProductCard({ product }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const price = pricing.retailPrice || 499;
  const originalPrice = pricing.mrp || price * 1.2; // fallback MRP 20% above retail
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    setAddingToCart(true);
    const existing = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (existing) {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [
        ...cart.items,
        { id: product.id, name: product.name, price, quantity: 1, image: product.image },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: `${product.name} added.`, type: "success" });
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    setWishlisted((v) => !v);
    addToast({
      title: wishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      message: product.name,
      type: wishlisted ? "info" : "success",
    });
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-[#DCE8DF] overflow-hidden hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image Area */}
      <div className="relative aspect-4/3 bg-[#F2F7F4] overflow-hidden block shrink-0">
        <Link
          to={`/products/${product.slug}`}
          className="absolute inset-0 block z-0"
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discount >= 5 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#84CC16] text-slate-950 text-[10px] font-black shadow-xs tracking-wider">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#074428] text-white text-[10px] font-black shadow-xs tracking-wider">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#059669] text-white text-[10px] font-black shadow-xs tracking-wider">
              <TrendingUp className="w-2.5 h-2.5 text-[#84CC16]" />
              BEST SELLER
            </span>
          )}
        </div>

        {/* Actions — top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            aria-label="Add to Wishlist"
            className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm border shadow-xs transition-all ${
              wishlisted
                ? "bg-red-500 border-red-500 text-white"
                : "bg-white/95 border-white/80 text-slate-700 hover:text-red-500"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            aria-label="Quick View Product"
            className="w-8 h-8 rounded-xl bg-white/95 border border-white/80 flex items-center justify-center text-slate-700 hover:text-[#074428] backdrop-blur-sm shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick-add hover bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#074428] hover:bg-[#0a5634] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {addingToCart ? (
              <>
                <Zap className="w-3.5 h-3.5 text-[#84CC16] animate-pulse" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-[#84CC16]" />
                Quick Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(product.rating || 4) ? "text-[#84CC16] fill-[#84CC16]" : "text-slate-200 fill-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#074428]">{product.rating || "4.5"}</span>
            <span className="text-[10px] text-slate-400">({product.reviewsCount || 0})</span>
          </div>

          {/* Name */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-bold text-[#072115] hover:text-[#059669] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* SKU & Category */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono bg-[#F2F7F4] px-1.5 py-0.5 rounded">
              {product.sku}
            </span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] text-[#059669] font-bold tracking-wide uppercase">{product.category}</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t border-[#DCE8DF]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-[#074428]">
                {formatPrice(price, country.currency, country.symbol)}
              </span>
              {discount >= 5 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(originalPrice, country.currency, country.symbol)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Direct Nursery • Tax Incl.</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              addingToCart
                ? "bg-emerald-100 text-[#074428]"
                : "bg-[#074428] hover:bg-[#0a5634] text-white shadow-xs hover:shadow-md hover:scale-105"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#84CC16]" />
            {addingToCart ? "✓" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
