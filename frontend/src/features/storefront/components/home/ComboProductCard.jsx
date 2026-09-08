import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountryStore } from "../../../../stores/country.store.js";
import { useCartStore } from "../../../../stores/cart.store.js";
import { useUIStore } from "../../../../stores/ui.store.js";
import { formatPrice } from "../../../../utils/formatters.js";
import { Star, Check, Plus, Minus, Heart, Sparkles, PackageCheck, Layers } from "lucide-react";

export function ComboProductCard({ combo, badge = null }) {
  const { country } = useCountryStore();
  const { cart, setCart } = useCartStore();
  const { addToast } = useUIStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const pricing = combo.pricing?.[country.code] || combo.pricing?.US || combo.pricing?.IN || {};
  const backendPrice =
    combo.resolvedPrice?.unitPrice ||
    combo.prices?.[0]?.amount ||
    pricing.retailPrice ||
    combo.price ||
    699;
  const price = Number(backendPrice);
  const originalPrice = combo.mrp || pricing.mrp || Math.round(price * 1.45);
  const discount = combo.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 30);
  const savings = originalPrice - price;
  const rating = combo.rating || 4.9;
  const reviews = combo.reviewsCount || combo.reviews || 1480;

  const image =
    combo.image ||
    combo.images?.[0]?.file?.url ||
    combo.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";

  const itemsIncluded = combo.itemsIncluded || [
    "Kadha Sips for Cold Defense (30 Sachets)",
    "Pure Raw Organic Forest Honey (500g)",
  ];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);

    const cartItem = cart.items.find((i) => i.id === combo.id);
    let newItems = [];
    if (cartItem) {
      newItems = cart.items.map((i) =>
        i.id === combo.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [
        ...cart.items,
        { id: combo.id, name: combo.name, price, quantity, image, isCombo: true },
      ];
    }
    const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
    addToast({
      title: "Combo Added to Cart",
      message: `${quantity}x ${combo.name}`,
      type: "success",
    });
    setTimeout(() => setAdded(false), 900);
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
      message: combo.name,
      type: wishlisted ? "info" : "success",
    });
  };

  const effectiveBadge = combo.badge || badge || "SUPER SAVER";

  return (
    <div className="group relative bg-white rounded-3xl border border-[#3e8e45]/20 hover:border-[#3e8e45]/60 hover:shadow-2xl hover:shadow-[#3e8e45]/15 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm w-full min-w-0">
      {/* ─── 1. Combo Hero Image Area ─── */}
      <div className="relative w-full aspect-[4/3.5] bg-gradient-to-b from-[#F2F8F4] via-[#E8F3EB] to-[#DCECE0]/70 overflow-hidden flex items-center justify-center border-b border-[#E1EFE4]">
        <Link
          to={`/products/${combo.slug || combo.id}`}
          className="w-full h-full flex items-center justify-center p-4 relative"
          aria-label={combo.name}
        >
          <img
            src={image}
            alt={combo.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-md"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1">
            <span className="inline-flex items-center gap-1 bg-[#1E3B2B] text-[#F9BC15] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              <Sparkles className="w-2.5 h-2.5 fill-current text-[#F9BC15]" />
              {effectiveBadge}
            </span>
            <span className="inline-flex items-center gap-1 bg-[#3e8e45] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-md">
              <Layers className="w-2.5 h-2.5" />
              Combo
            </span>
          </div>
          {discount > 0 && (
            <span className="bg-[#EF4444] text-white text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md w-fit pointer-events-auto">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              wishlisted
                ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
                : "bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500 border border-white/80 hover:scale-110"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Bottom Bar on Image: Items Count */}
        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-gray-200/60 shadow-2xs">
          <span className="text-[10px] font-bold text-[#1E3B2B] flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-[#3e8e45]" />
            {itemsIncluded.length} Items Included
          </span>
        </div>
      </div>

      {/* ─── 2. Product Details & Included Items Box ─── */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Rating Stars & Count */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#3e8e45]">
              {combo.category || "Value Bundle"}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-xs font-bold text-gray-800">{rating}</span>
              <span className="text-[10px] text-gray-400">({reviews})</span>
            </div>
          </div>

          {/* Combo Title */}
          <Link to={`/products/${combo.slug || combo.id}`} className="block group-hover:text-[#3e8e45] transition-colors">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 line-clamp-1 leading-snug">
              {combo.name}
            </h3>
          </Link>

          {/* Subtitle / Description */}
          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 mb-2.5 font-normal">
            {combo.subtitle || combo.description || "Curated synergistic combination for maximum wellness & value"}
          </p>

          {/* ─── Included Items Mini Checklist ─── */}
          <div className="bg-[#FAFDF9] rounded-xl p-2.5 border border-[#E3EFE6] mb-3 space-y-1">
            <div className="text-[9.5px] font-black uppercase tracking-wider text-gray-600 mb-1">
              Pack Includes:
            </div>
            {itemsIncluded.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-700 leading-tight">
                <Check className="w-3 h-3 text-[#3e8e45] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>

          {/* Price Row & Savings Pill */}
          <div className="flex items-baseline justify-between gap-2 flex-wrap mb-3.5">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-gray-900">
                {formatPrice(price, country.currency, country.symbol)}
              </span>
              {originalPrice > price && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {formatPrice(originalPrice, country.currency, country.symbol)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-bold text-[#3e8e45] bg-[#3e8e45]/10 px-2 py-0.5 rounded-md">
                You save {formatPrice(savings, country.currency, country.symbol)}
              </span>
            )}
          </div>
        </div>

        {/* ─── 3. Bottom Action Bar: Quantity Stepper + ADD COMBO TO CART ─── */}
        <div className="pt-1 flex items-center gap-2 w-full">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between border border-[#3e8e45]/30 bg-[#3e8e45]/5 rounded-xl px-2 py-1.5 min-w-[76px] sm:min-w-[84px]">
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

          {/* ADD TO CART Button (Green) */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 border border-[#3e8e45] bg-[#3e8e45] hover:bg-[#347c3a] text-white active:scale-95"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in text-white" />
                <span>ADDED</span>
              </>
            ) : (
              <span>ADD COMBO</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComboProductCard;
