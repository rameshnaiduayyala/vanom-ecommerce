import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Heart, ShoppingCart, Check, Star, Plus, Minus, Trash2 } from "lucide-react";

export function ProductCard({ product, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.US || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    product.price ||
    42990;
  const price = Number(backendPrice);
  const originalPrice = product.mrp || pricing.mrp || (price > 0 ? Math.round(price * 1.32) : 56999);
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 24);
  const rating = product.rating || 4.7;
  const reviewsCount = product.reviewsCount || product.reviews || 2349;

  const productImage =
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80";

  const effectiveBadge = product.badge || badge;

  // Cart item state for this product
  const cartItem = cart.items.find((i) => i.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    let newItems = [];
    if (cartItem) {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [
        ...cart.items,
        { id: product.id, name: product.name, price, quantity: 1, image: productImage },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: `${product.name} added.`, type: "success" });
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleUpdateQuantity = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    let newItems = [];
    const newQty = currentQuantity + delta;
    if (newQty <= 0) {
      newItems = cart.items.filter((i) => i.id !== product.id);
      addToast({ title: "Removed from Cart", message: product.name, type: "info" });
    } else {
      newItems = cart.items.map((i) =>
        i.id === product.id ? { ...i, quantity: newQty } : i
      );
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
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
    <div className="group relative bg-white rounded-2xl p-4 border border-gray-200/90 hover:border-[rgb(60,170,130)]/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* ─── Product Image Container ─── */}
      <div className="relative h-48 sm:h-52 w-full rounded-xl overflow-hidden bg-[#fafafa] mb-3 shrink-0 flex items-center justify-center p-3 border border-gray-100">
        <Link
          to={`/products/${product.slug || product.id}`}
          className="block w-full h-full flex items-center justify-center"
          aria-label={product.name}
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Pill Badges */}
        {effectiveBadge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {effectiveBadge.toLowerCase().includes("best") ? (
              <span className="bg-[#F9BC15] text-[#204B38] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                Bestseller
              </span>
            ) : effectiveBadge.toLowerCase().includes("new") ? (
              <span className="bg-[rgb(60,170,130)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                New
              </span>
            ) : effectiveBadge.toLowerCase().includes("trend") ? (
              <span className="bg-[#F59E0B] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                Trending
              </span>
            ) : effectiveBadge.toLowerCase().includes("sale") ? (
              <span className="bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                Sale
              </span>
            ) : (
              <span className="bg-[rgb(60,170,130)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {effectiveBadge}
              </span>
            )}
          </div>
        )}

        {/* Floating Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          aria-label="Add to Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all duration-200 cursor-pointer ${
            wishlisted
              ? "bg-rose-50 text-rose-600 shadow-xs"
              : "bg-white/80 hover:bg-white text-gray-400 hover:text-gray-800 shadow-2xs"
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
        </button>
      </div>

      {/* ─── Product Details & Bottom Action Bar ─── */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name */}
          <Link to={`/products/${product.slug || product.id}`} className="block group-hover:text-[rgb(60,170,130)] transition-colors">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle / Key Specs line */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 mb-2 font-normal">
            {product.specs || product.subtitle || product.description || "Premium Certified Quality"}
          </p>

          {/* Price, MRP and Discount pill */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="text-base font-black text-gray-900">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold text-[rgb(60,170,130)] bg-[rgb(60,170,130)]/10 px-1.5 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Rating Stars & Count */}
          <div className="flex items-center gap-1.5 mb-3.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(rating)
                      ? "text-[#F9BC15] fill-[#F9BC15]"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({reviewsCount.toLocaleString()})</span>
          </div>
        </div>

        {/* ─── Add to Cart / Quantity Controller (Color: rgb(60,170,130)) ─── */}
        <div>
          {currentQuantity > 0 ? (
            <div className="w-full flex items-center justify-between bg-[rgb(60,170,130)] text-white rounded-xl px-1.5 py-1 shadow-xs animate-in fade-in duration-200">
              <button
                type="button"
                onClick={(e) => handleUpdateQuantity(e, -1)}
                className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/25 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Decrease quantity"
              >
                {currentQuantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-1 px-2 font-black text-xs select-none">
                <span className="text-[10px] uppercase font-bold opacity-90">In Cart:</span>
                <span className="text-sm font-extrabold">{currentQuantity}</span>
              </div>

              <button
                type="button"
                onClick={(e) => handleUpdateQuantity(e, 1)}
                className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/25 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-xs bg-[rgb(60,170,130)] hover:brightness-95 hover:shadow-md"
            >
              {addingToCart ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
