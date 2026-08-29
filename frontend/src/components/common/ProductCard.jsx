import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../stores/country.store.js";
import { useCartStore } from "../../stores/cart.store.js";
import { useUIStore } from "../../stores/ui.store.js";
import { ShoppingCart, Heart, Eye, Check } from "lucide-react";
import { RatingStars } from "./RatingStars.jsx";
import { formatPrice } from "../../utils/formatters.js";

/**
 * BestBuy-style Clean White Product Card with yellow Add to Cart CTA and sharp typography
 */
export function ProductCard({ product, className = "" }) {
  const { country } = useCountryStore();
  const { cart, setCart, openCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const pricing = product?.pricing?.[country.code] || product?.pricing?.US || {};
  const price = pricing.retailPrice || 499;
  const originalPrice = pricing.mrp || (price > 100 ? price * 1.25 : price + 50);
  const savings = originalPrice > price ? Math.round(originalPrice - price) : 0;

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
    setTimeout(() => {
      setAddingToCart(false);
      openCart();
    }, 400);
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
    <div className={`group relative bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 h-full ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square w-full mb-3 flex items-center justify-center bg-white overflow-hidden">
        <Link
          to={`/products/${product.slug || product.id}`}
          className="w-full h-full flex items-center justify-center"
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Save for later"
          className="absolute top-1 right-1 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-2xs transition-colors cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Savings tag */}
        {savings > 0 && (
          <div className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tight">
            SAVE {formatPrice(savings, country.currency, country.symbol)}
          </div>
        )}
      </div>

      {/* Info & Content */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Title */}
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="text-xs sm:text-[13px] font-medium text-[#040c13] hover:text-[#003876] hover:underline line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            <RatingStars
              rating={product.rating || 4.5}
              reviewsCount={product.reviewsCount || 12}
              size="xs"
            />
          </div>
        </div>

        {/* Price & BestBuy Yellow Button */}
        <div className="pt-2">
          <div className="mb-2">
            <div className="text-base sm:text-lg font-black text-slate-900 leading-none">
              {formatPrice(price, country.currency, country.symbol)}
            </div>
            {originalPrice > price && (
              <div className="text-[11px] text-slate-500 line-through mt-0.5">
                Was {formatPrice(originalPrice, country.currency, country.symbol)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-xs font-black transition-colors cursor-pointer active:scale-98 shadow-2xs"
          >
            {addingToCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
