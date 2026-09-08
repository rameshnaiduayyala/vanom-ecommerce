import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../../stores/country.store.js";
import { useCartStore } from "../../../../stores/cart.store.js";
import { useUIStore } from "../../../../stores/ui.store.js";
import { formatPrice } from "../../../../utils/formatters.js";
import { Star, Check, Plus, Minus, Heart, Sparkles } from "lucide-react";

export function ProductCardCompact({ product, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.US || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    product.price ||
    339;
  const price = Number(backendPrice);
  const originalPrice = product.mrp || pricing.mrp || (price > 0 ? Math.round(price * 1.35) : 400);
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 15);
  const rating = product.rating || 4.8;
  const reviews = product.reviewsCount || product.reviews || 1104;

  const image =
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);

    const cartItem = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (cartItem) {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [
        ...cart.items,
        { id: product.id, name: product.name, price, quantity, image },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Added to Cart",
      message: `${quantity}x ${product.name} added`,
      type: "success",
    });
    setTimeout(() => setAdded(false), 800);
  };

  const handleStepQuantity = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((q) => Math.max(1, q + delta));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((v) => !v);
    addToast({
      title: wishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
      message: product.name,
      type: wishlisted ? "info" : "success",
    });
  };

  const effectiveBadge = product.badge || badge;

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-[rgb(60,170,130)]/50 hover:shadow-xl hover:shadow-[rgb(60,170,130)]/12 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs w-full min-w-0">
      {/* ─── Hero Full-Size Product Image Area ─── */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-[#EAF4EF]/60 overflow-hidden flex items-center justify-center border-b border-gray-100">
        <Link to={`/products/${product.slug || product.id}`} className="w-full h-full flex items-center justify-center p-3 sm:p-4">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-xs"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Pill Badges (Overlaid on Image) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {effectiveBadge && (
            <div className="pointer-events-auto">
              {effectiveBadge.toLowerCase().includes("best") ? (
                <span className="inline-flex items-center gap-0.5 bg-[#F9BC15] text-[#1E3B2B] text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                  <Sparkles className="w-2 h-2 fill-current" />
                  Bestseller
                </span>
              ) : effectiveBadge.toLowerCase().includes("new") ? (
                <span className="inline-flex items-center bg-[rgb(60,170,130)] text-white text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                  New
                </span>
              ) : (
                <span className="inline-flex items-center bg-[rgb(60,170,130)] text-white text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                  {effectiveBadge}
                </span>
              )}
            </div>
          )}
          {discount > 0 && (
            <span className="bg-[#1E3B2B] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shadow-md w-fit pointer-events-auto">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Floating Wishlist Button (Overlaid on Image) */}
        <button
          onClick={handleWishlist}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${wishlisted
            ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
            : "bg-white/85 hover:bg-white text-gray-400 hover:text-rose-500 border border-white/80 hover:scale-110"
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
        </button>
      </div>

      {/* ─── Product Info Section ─── */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Category Pill & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-[rgb(60,170,130)] truncate">
              {product.category?.name || product.category || "Organic"}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 text-[#F9BC15] fill-[#F9BC15]" />
              <span className="text-[10px] font-bold text-gray-800">{rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug || product.id}`} className="block group-hover:text-[rgb(60,170,130)] transition-colors">
            <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Key Spec */}
          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 mb-2 font-normal">
            {product.subtitle || product.specs || "100% Pure Organic"}
          </p>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 flex-wrap mb-2.5">
            <span className="text-sm sm:text-base font-black text-gray-900">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {originalPrice > price && (
              <span className="text-[10px] text-gray-400 line-through font-medium">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>
        </div>

        {/* ─── Bottom Action Bar: [ - qty + ] Stepper + ADD TO CART Button ─── */}
        <div className="pt-1 flex items-center gap-1.5 w-full">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between border border-[rgb(60,170,130)]/40 bg-[rgb(60,170,130)]/8 rounded-lg px-1.5 py-1 min-w-[66px] sm:min-w-[72px]">
            <button
              type="button"
              onClick={(e) => handleStepQuantity(e, -1)}
              disabled={quantity <= 1}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-30 active:scale-90 transition-transform cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[11px] sm:text-xs font-black text-gray-900 select-none px-0.5">
              {quantity}
            </span>
            <button
              type="button"
              onClick={(e) => handleStepQuantity(e, 1)}
              className="text-gray-600 hover:text-gray-900 active:scale-90 transition-transform cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* ADD TO CART Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wide transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center gap-1 border ${added
              ? "bg-[#3e8e45] text-white border-[#3CAA82]"
              : "bg-[#3e8e45] hover:bg-green-500 text-white border-[#d7e4a7] active:scale-95"
              }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3 animate-in zoom-in" />
                <span>ADDED</span>
              </>
            ) : (
              <span>ADD TO CART</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCardCompact;
