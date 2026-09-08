import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../../stores/country.store.js";
import { useCartStore } from "../../../../stores/cart.store.js";
import { useUIStore } from "../../../../stores/ui.store.js";
import { formatPrice } from "../../../../utils/formatters.js";
import { Star, ShoppingCart, Check } from "lucide-react";

export function ProductCardCompact({ product, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [added, setAdded] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    product.price ||
    1499;
  const price = Number(backendPrice);
  const originalPrice = product.mrp || pricing.mrp || (price > 0 ? Math.round(price * 1.35) : 2199);
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const rating = product.rating || 4.5;
  const reviews = product.reviewsCount || product.reviews || 2340;

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
      ? cart.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...cart.items, { id: product.id, name: product.name, price, quantity: 1, image }];
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: product.name, type: "success" });
    setTimeout(() => setAdded(false), 1200);
  };

  const effectiveBadge = product.badge || badge;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/90 hover:border-[#358B5B]/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden p-2.5 sm:p-3 w-full min-w-0">
      {/* Product Image Box */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50/60 flex items-center justify-center p-2 mb-2">
        <Link to={`/products/${product.slug || product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Pill Badge (Bestseller gold / New green) */}
        {effectiveBadge && (
          <div className="absolute top-2 left-2 z-10">
            {effectiveBadge.toLowerCase().includes("best") ? (
              <span className="bg-[#F9BC15] text-[#204B38] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                Bestseller
              </span>
            ) : effectiveBadge.toLowerCase().includes("new") ? (
              <span className="bg-[#358B5B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                New
              </span>
            ) : (
              <span className="bg-[#358B5B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                {effectiveBadge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title */}
        <Link to={`/products/${product.slug || product.id}`} className="group-hover:text-[#358B5B] transition-colors">
          <h3 className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Key Spec */}
        <p className="text-[10px] text-gray-500 line-clamp-1 mb-1.5">
          {product.subtitle || product.category || "Premium Quality"}
        </p>

        {/* Price & Discount Row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-xs sm:text-sm font-black text-gray-900">
            {formatPrice(price, country.currency, country.symbol)}
          </span>
          {originalPrice > price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(originalPrice, country.currency, country.symbol)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[9px] font-bold text-[#358B5B] bg-[#EAF7F0] px-1.5 py-0.2 rounded">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Rating Stars & Count */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-2.5 h-2.5 ${
                  s <= Math.round(rating)
                    ? "text-[#F9BC15] fill-[#F9BC15]"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-400">({reviews.toLocaleString()})</span>
        </div>

        {/* Full-width Add to Cart Button */}
        <div className="mt-auto pt-1">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${
              added
                ? "bg-[#358B5B] text-white"
                : "bg-[#358B5B] hover:bg-[#204B38] text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCardCompact;
