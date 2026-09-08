import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Heart, Check, Star, Plus, Minus, Sparkles } from "lucide-react";

export function ProductCard({ product, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.US || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    product.price ||
    339;
  const price = Number(backendPrice);
  const originalPrice = product.mrp || pricing.mrp || (price > 0 ? Math.round(price * 1.32) : 400);
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 15);
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || product.reviews || 1104;

  const productImage =
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";

  const effectiveBadge = product.badge || badge;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);

    const cartItem = cart.items.find((i) => i.id === product.id);
    let newItems = [];
    if (cartItem) {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [
        ...cart.items,
        { id: product.id, name: product.name, price, quantity, image: productImage },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Added to Cart",
      message: `${quantity}x ${product.name} added.`,
      type: "success",
    });
    setTimeout(() => setAddingToCart(false), 800);
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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl border border-gray-100 hover:border-[rgb(60,170,130)]/50 hover:shadow-2xl hover:shadow-[rgb(60,170,130)]/12 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm"
    >
      {/* ─── Hero Full-Size Product Image Area ─── */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAF9] via-[#F3F8F5] to-[#EAF4EF]/60 overflow-hidden flex items-center justify-center border-b border-gray-100">
        <Link
          to={`/products/${product.slug || product.id}`}
          className="w-full h-full flex items-center justify-center p-5 relative"
          aria-label={product.name}
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Floating Badges (Overlaid on Image) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {effectiveBadge && (
            <div className="pointer-events-auto">
              {effectiveBadge.toLowerCase().includes("best") ? (
                <span className="inline-flex items-center gap-1 bg-[#F9BC15] text-[#1E3B2B] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  Bestseller
                </span>
              ) : effectiveBadge.toLowerCase().includes("new") ? (
                <span className="inline-flex items-center gap-1 bg-[rgb(60,170,130)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  New
                </span>
              ) : effectiveBadge.toLowerCase().includes("sale") ? (
                <span className="inline-flex items-center gap-1 bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  Sale
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[rgb(60,170,130)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  {effectiveBadge}
                </span>
              )}
            </div>
          )}
          {discount > 0 && (
            <span className="bg-[#1E3B2B] text-white text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md w-fit pointer-events-auto">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Floating Wishlist Button (Overlaid on Image) */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Add to Wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              wishlisted
                ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
                : "bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500 border border-white/80 hover:scale-110"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── Product Details & Bottom Action Bar ─── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Brand Pill */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[rgb(60,170,130)]">
              {product.category?.name || product.category || "Organic Collection"}
            </span>
            {/* Rating Stars & Count */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#F9BC15] fill-[#F9BC15]" />
              <span className="text-xs font-bold text-gray-800">{rating}</span>
              <span className="text-[11px] text-gray-400">({reviewsCount > 999 ? `${(reviewsCount / 1000).toFixed(1)}k` : reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug || product.id}`} className="block group-hover:text-[rgb(60,170,130)] transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Key Specs line */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-1 mb-3 font-normal">
            {product.specs || product.subtitle || product.description || "100% Pure Organic • Lab Certified"}
          </p>

          {/* Price, MRP Row */}
          <div className="flex items-baseline gap-2 flex-wrap mb-4">
            <span className="text-base sm:text-xl font-black text-gray-900">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {originalPrice > price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>
        </div>

        {/* ─── Bottom Action Bar: [ - qty + ] Stepper + ADD TO CART Button ─── */}
        <div className="pt-2 flex items-center gap-2 w-full">
          {/* Quantity Stepper [- 1 +] */}
          <div className="flex items-center justify-between border border-[rgb(60,170,130)]/40 bg-[rgb(60,170,130)]/8 rounded-xl px-2.5 py-2 min-w-[80px] sm:min-w-[90px]">
            <button
              type="button"
              onClick={(e) => handleStepQuantity(e, -1)}
              disabled={quantity <= 1}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-30 active:scale-90 transition-transform cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs sm:text-sm font-black text-gray-900 select-none px-1">
              {quantity}
            </span>
            <button
              type="button"
              onClick={(e) => handleStepQuantity(e, 1)}
              className="text-gray-600 hover:text-gray-900 active:scale-90 transition-transform cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ADD TO CART Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-[rgb(60,170,130)] hover:bg-[rgb(48,150,112)] active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {addingToCart ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in" />
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

export default ProductCard;
