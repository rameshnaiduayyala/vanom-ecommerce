import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useCartStore } from "../../../stores/cart.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Heart, ShoppingBag, Check } from "lucide-react";

export function ProductCard({ product }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const pricing = product.pricing?.[country.code] || product.pricing?.IN || {};
  const backendPrice =
    product.resolvedPrice?.unitPrice ||
    product.prices?.[0]?.amount ||
    product.variants?.[0]?.prices?.[0]?.amount ||
    pricing.retailPrice ||
    499;
  const price = Number(backendPrice);
  const originalPrice = pricing.mrp || (price > 0 ? price * 1.2 : 599);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const productImage =
    product.image ||
    product.images?.[0]?.file?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        { id: product.id, name: product.name, price, quantity: 1, image: productImage },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({ title: "Added to Cart", message: `${product.name} added.`, type: "success" });
    setTimeout(() => setAddingToCart(false), 800);
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
    <div className="group relative bg-white rounded-[2rem] p-3 sm:p-3.5 border border-[#E2ECE5] hover:border-[#0D6B42]/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between select-none">
      
      {/* ─── Top Product Image Container matching reference ─── */}
      <div className="relative aspect-square w-full rounded-[1.6rem] overflow-hidden bg-[#F4F8F5] mb-3.5 shrink-0">
        <Link
          to={`/products/${product.slug}`}
          className="block w-full h-full"
          aria-label={product.name}
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Optional Discount / Status Badge */}
        {discount >= 5 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-[#0D6B42] text-[#4ADE80] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              -{discount}%
            </span>
          </div>
        )}

        {/* Floating Wishlist Heart Button matching reference */}
        <button
          onClick={handleWishlist}
          aria-label="Add to Wishlist"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm ${
            wishlisted
              ? "bg-rose-500 text-white shadow-rose-500/30"
              : "bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* ─── Product Details & Bottom Action Bar ─── */}
      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-[#0D6B42] transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1 font-normal">
            {product.description || "Premium commercial-grade product engineered for durability and high-performance."}
          </p>
        </div>

        {/* ─── Price & Pill 'Buy' Button matching reference ─── */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-[#0F2B1C] tracking-tight">
              {formatPrice(price, country.currency, country.symbol)}
            </span>
            {discount >= 5 && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(originalPrice, country.currency, country.symbol)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 ${
              addingToCart
                ? "bg-[#0D6B42] text-[#4ADE80]"
                : "bg-[#0F2B1C] hover:bg-[#074428] text-white shadow-[#0F2B1C]/20 hover:shadow-md"
            }`}
          >
            {addingToCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>Added</span>
              </>
            ) : (
              <span>Buy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
