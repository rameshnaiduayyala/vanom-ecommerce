import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../stores/country.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { useUIStore } from "../../stores/ui.store.js";
import { ShoppingCart, Heart, Eye, Zap, TrendingUp } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay.jsx";
import { RatingStars } from "./RatingStars.jsx";

/**
 * Standardized ProductCard component for catalogs, search, and recommendation carousels.
 */
export function ProductCard({ product, className = "" }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const pricing = product?.pricing?.[country.code] || product?.pricing?.IN || {};
  const price = pricing.retailPrice || 499;
  const originalPrice = pricing.mrp || price * 1.2;
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
    setTimeout(() => setAddingToCart(false), 600);
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
    <div className={`group relative bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 flex flex-col ${className}`}>
      {/* Image Area */}
      <div className="relative aspect-4/3 bg-surface-muted overflow-hidden block shrink-0">
        <Link
          to={`/products/${product.slug || product.id}`}
          className="absolute inset-0 block z-0"
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discount >= 5 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-xs">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-xs">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs">
              <TrendingUp className="w-2.5 h-2.5" />
              BEST SELLER
            </span>
          )}
        </div>

        {/* Action icons — top right */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            aria-label="Add to Wishlist"
            className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm border shadow-xs transition-all ${
              wishlisted
                ? "bg-red-500 border-red-500 text-white"
                : "bg-white/90 border-white/60 text-text-secondary hover:text-red-500"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <Link
            to={`/products/${product.slug || product.id}`}
            aria-label="Quick View Product"
            className="w-8 h-8 rounded-xl bg-white/90 border border-white/60 flex items-center justify-center text-text-secondary hover:text-brand-600 backdrop-blur-sm shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick-add hover bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {addingToCart ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Rating */}
          <RatingStars
            rating={product.rating || 4.5}
            reviewsCount={product.reviewsCount || 0}
            size="xs"
          />

          {/* Name */}
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="text-sm font-bold text-text-primary hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* SKU & Category */}
          <div className="flex items-center gap-2">
            {product.sku && (
              <span className="text-[10px] text-text-muted font-mono bg-surface-muted px-1.5 py-0.5 rounded">
                {product.sku}
              </span>
            )}
            {product.category && (
              <>
                <span className="text-[10px] text-text-muted">•</span>
                <span className="text-[10px] text-text-secondary font-semibold">{product.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border">
          <PriceDisplay
            price={price}
            originalPrice={originalPrice}
            currency={country.currency}
            symbol={country.symbol}
            size="sm"
            showTaxLabel
          />

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              addingToCart
                ? "bg-brand-100 text-brand-600"
                : "bg-brand-600 hover:bg-brand-700 text-white shadow-xs hover:shadow-sm hover:scale-105"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {addingToCart ? "✓" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
