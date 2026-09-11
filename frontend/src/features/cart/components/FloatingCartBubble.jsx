import React, { useEffect, useRef } from "react";
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";

// ─── Mini Cart Item Row ────────────────────────────────────────────────────────
function MiniCartItem({ item, country, onIncrease, onDecrease, onRemove }) {
  const unitPrice = Number(item.price || item.unitPrice || 0);
  const href = `/products/${item.slug || item.id}`;

  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-100 last:border-0 group animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Thumbnail */}
      <a
        href={href}
        className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 hover:border-[#007185] transition-colors"
      >
        <img
          src={item.image || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </a>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <a
          href={href}
          className="text-xs font-semibold text-gray-900 hover:text-[#007185] line-clamp-2 leading-snug block"
        >
          {item.name}
        </a>
        <div className="text-sm font-bold text-gray-900 mt-1">
          {formatPrice(unitPrice * item.quantity, country.currency, country.symbol)}
        </div>
        {/* Qty stepper */}
        <div className="flex items-center gap-0 mt-1.5 border border-gray-200 rounded-lg overflow-hidden w-fit bg-white">
          <button
            type="button"
            onClick={() => onDecrease(item.id, item.quantity - 1)}
            className="p-1 px-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 text-center text-xs font-bold text-gray-900 select-none">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease(item.id, item.quantity + 1)}
            className="p-1 px-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="self-start mt-0.5 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Floating Cart Bubble + Drawer ────────────────────────────────────────────
export function FloatingCartBubble() {
  const { cart, isOpen, openCart, closeCart, updateItemQuantity, removeItem } = useCartStore();
  const { country } = useCountryStore();
  const drawerRef = useRef(null);

  const itemCount  = cart?.itemCount || cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const items      = cart?.items || [];
  const subtotal   = Number(cart?.subtotal || items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0));
  const hasItems   = itemCount > 0;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        closeCart();
      }
    };
    // slight delay so the open-click doesn't immediately close
    const id = setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Don't render bubble if cart is empty
  if (!hasItems) return null;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ── Side Drawer ──────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mini cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#185e3e] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Your Cart</h2>
              <p className="text-[11px] text-gray-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-1 overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-10">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <MiniCartItem
                  key={item.id}
                  item={item}
                  country={country}
                  onIncrease={(id, qty) => updateItemQuantity(id, qty)}
                  onDecrease={(id, qty) => {
                    if (qty <= 0) removeItem(id);
                    else updateItemQuantity(id, qty);
                  }}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Subtotal</span>
              <span className="text-lg font-black text-gray-900">
                {formatPrice(subtotal, country.currency, country.symbol)}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-1">
              Tax & shipping calculated at checkout
            </p>

            {/* View full cart */}
            <button
              type="button"
              onClick={() => { closeCart(); window.location.href = ROUTES.CART; }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200 cursor-pointer"
            >
              View Full Cart
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Checkout */}
            <button
              type="button"
              onClick={() => { closeCart(); window.location.href = ROUTES.CHECKOUT; }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold text-sm border border-[#FCD200] shadow-sm active:scale-[0.99] transition-all cursor-pointer"
            >
              Checkout ({itemCount} items)
            </button>

            {/* Free shipping progress */}
            {subtotal < 500 && (
              <div className="pt-1">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Add <span className="font-bold text-[#007185]">{formatPrice(500 - subtotal, country.currency, country.symbol)}</span> more for free shipping</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#185e3e] to-[#00a67e] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 500 && (
              <p className="text-[11px] text-[#067d62] font-semibold text-center">
                🎉 You've unlocked free shipping!
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Floating Bubble (FAB) ────────────────────────────────── */}
      <button
        type="button"
        onClick={openCart}
        aria-label={`Open cart (${itemCount} items)`}
        className={`fixed bottom-6 right-6 z-[89] group flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-[#185e3e] text-white shadow-[0_8px_32px_rgba(24,94,62,0.45)] hover:shadow-[0_12px_40px_rgba(24,94,62,0.55)] hover:bg-[#14523a] active:scale-95 transition-all duration-200 cursor-pointer ${
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
      >
        {/* Icon */}
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {/* Bounce badge */}
          <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#FFD814] text-gray-900 text-[10px] font-black leading-none shadow-sm animate-bounce">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </div>
        {/* Label */}
        <span className="text-sm font-bold tracking-tight">
          {formatPrice(subtotal, country.currency, country.symbol)}
        </span>
      </button>
    </>
  );
}
