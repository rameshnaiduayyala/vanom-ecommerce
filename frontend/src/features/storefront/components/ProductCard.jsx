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

  const wholesalePrice = pricing.wholesaleTiers?.[0]?.unitPrice || (price * 0.78);
  const minWholesaleQty = pricing.wholesaleTiers?.[0]?.minQuantity || 10;

  return (
    <div className="group relative bg-white rounded-3xl border border-[#DCE8DF] hover:border-[#074428]/40 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer">
      {/* ─── Product Image & Interactive Overlays ─── */}
      <div className="relative aspect-4/3 bg-[#F4F7F4] overflow-hidden block shrink-0">
        <Link
          to={`/products/${product.slug}`}
          className="absolute inset-0 block z-0"
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Gentle vignette hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Top-Left Smart Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discount >= 5 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#84CC16] text-slate-950 text-[10px] font-black shadow-xs tracking-wider uppercase">
              Save {discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#074428] text-white text-[10px] font-extrabold shadow-xs tracking-wider uppercase">
              <TrendingUp className="w-2.5 h-2.5 text-[#84CC16]" />
              Enterprise Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-xs tracking-wider uppercase">
              New Arrival
            </span>
          )}
        </div>

        {/* Top-Right Quick Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            aria-label="Add to Wishlist"
            className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border shadow-sm transition-all cursor-pointer ${
              wishlisted
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-white/90 border-white/80 text-slate-700 hover:text-rose-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            aria-label="Quick View Product"
            className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white border border-white/80 flex items-center justify-center text-slate-700 hover:text-[#074428] backdrop-blur-md shadow-sm transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Quick-Add Drawer on Card Hover */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#00875A] hover:bg-[#00744D] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {addingToCart ? (
              <>
                <Zap className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                <span>Adding to Order...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>Instant Order / Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Product Card Details ─── */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div className="space-y-2">
          {/* Department & SKU Line */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#00875A] font-bold uppercase tracking-wider bg-[#E6F4EA] px-2 py-0.5 rounded-md border border-emerald-100">
              {product.category || "General Catalog"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              SKU: {product.sku || "VN-001"}
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-extrabold text-[#0F2B1C] hover:text-[#00875A] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Verified Orders */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating || 4)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#0F2B1C]">{product.rating || "4.8"}</span>
            <span className="text-[10px] text-slate-400 font-medium">({product.reviewsCount || 42} reviews)</span>
          </div>

          {/* Key Product Specification / Feature Pill */}
          <div className="mt-1 px-2.5 py-1 rounded-lg bg-[#F4F8F5] border border-emerald-100 flex items-center justify-between text-[11px]">
            <span className="text-[#4B6357] font-medium">Availability:</span>
            <strong className="text-[#00875A] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
              In Stock • Express Delivery
            </strong>
          </div>
        </div>

        {/* ─── Price & Action Footer ─── */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t border-[#E3ECE6]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#064027] tracking-tight">
                {formatPrice(price, country.currency, country.symbol)}
              </span>
              {discount >= 5 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(originalPrice, country.currency, country.symbol)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700/80 font-medium block mt-0.5">
              Taxes Included
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
              addingToCart
                ? "bg-[#E6F4EA] text-[#00875A]"
                : "bg-[#00875A] hover:bg-[#00744D] text-white hover:shadow-md hover:scale-102"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#4ADE80]" />
            <span>{addingToCart ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
