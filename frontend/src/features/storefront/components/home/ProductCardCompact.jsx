import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../../stores/country.store.js";
import { useCartStore } from "../../../../stores/cart.store.js";
import { useUIStore } from "../../../../stores/ui.store.js";
import { formatPrice } from "../../../../utils/formatters.js";
import { Heart, ShoppingCart, Star, Check, Flame, Sparkles, TrendingUp } from "lucide-react";

export function ProductCardCompact({ product, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    499;
  const price = Number(backendPrice);
  const originalPrice = pricing.mrp || (price > 0 ? price * 1.25 : 599);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const rating = product.rating || 4.3;
  const reviews = product.reviewsCount || product.reviews || 128;

  const image =
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    const existing = cart.items.find((i) => i.id === product.id);
    const newItems = existing
      ? cart.items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart.items, { id: product.id, name: product.name, price, quantity: 1, image }];
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: product.name, type: "success" });
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#006B3C]/30 hover:shadow-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badge === "best-seller" && (
            <span className="flex items-center gap-1 bg-[#D9A514] text-[#003D2B] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              <TrendingUp className="w-2.5 h-2.5" /> Best Seller
            </span>
          )}
          {badge === "new" && (
            <span className="flex items-center gap-1 bg-blue-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
          {badge === "sale" && discount >= 5 && (
            <span className="flex items-center gap-1 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              <Flame className="w-2.5 h-2.5" /> -{discount}%
            </span>
          )}
          {!badge && discount >= 5 && (
            <span className="bg-[#006B3C] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((v) => !v);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
            wishlisted ? "bg-rose-500 text-white" : "bg-white/90 text-gray-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Details */}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <Link to={`/products/${product.slug || product.id}`} className="group-hover:text-[#006B3C] transition-colors">
          <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(rating) ? "text-[#D9A514] fill-[#D9A514]" : "text-gray-200"}`} />
            ))}
          </div>
          <span className="text-[9px] text-gray-400">({reviews})</span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-sm font-black text-gray-900">{formatPrice(price, country.currency, country.symbol)}</span>
            {discount >= 5 && (
              <span className="text-[10px] text-gray-400 line-through ml-1">{formatPrice(originalPrice, country.currency, country.symbol)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
              added ? "bg-[#006B3C] text-white" : "bg-[#003D2B] hover:bg-[#006B3C] text-white"
            }`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCardCompact;
