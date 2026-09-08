import React from "react";
import { Outlet, Link } from "react-router-dom";
import { PublicHeader } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { AnnouncementBar } from "../../features/storefront/components/AnnouncementBar.jsx";
import { useCartStore } from "../../stores/cart.store.js";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";
import { Drawer } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ROUTES } from "../../constants/routes.js";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";

export function PublicLayout() {
  const { cart, setCart, isOpen, closeCart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();

  const handleUpdateQuantity = (id, delta) => {
    let newItems = [];
    cart.items.forEach((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
          newItems.push({ ...item, quantity: newQty });
        }
      } else {
        newItems.push(item);
      }
    });
    const subtotal = newItems.reduce((sum, item) => sum + (item.price || item.unitPrice || 0) * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  const handleRemoveItem = (id) => {
    const newItems = cart.items.filter((item) => item.id !== id);
    const subtotal = newItems.reduce((sum, item) => sum + (item.price || item.unitPrice || 0) * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7DD] text-text-primary">
      {/* Announcement bar sits above the sticky header */}
      <AnnouncementBar />
      <PublicHeader />

      <main className="flex-1 bg-[#FFF7DD]">
        <Outlet />
      </main>

      <PublicFooter />

      {/* Slide-out Mini Cart Drawer */}
      <Drawer isOpen={isOpen} onClose={closeCart} title="Your Shopping Cart">
        {cart?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="w-12 h-12 text-text-muted mb-3 opacity-40" />
            <h4 className="text-sm font-semibold text-text-primary mb-1">Your cart is empty</h4>
            <p className="text-xs text-text-muted mb-4">Add products to your cart to see them here.</p>
            <button
              onClick={closeCart}
              className="px-4 py-2 rounded-xl bg-[rgb(60,170,130)] hover:brightness-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 divide-y divide-border overflow-y-auto pr-1">
              {cart.items.map((item, index) => (
                <div key={item.id || index} className="py-3 flex gap-3 items-center justify-between">
                  <div className="flex gap-3 items-center min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-surface-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-[rgb(60,170,130)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-text-primary truncate">{item.name || item.productName || "Cart Item"}</h5>
                      <p className="text-xs font-bold text-[rgb(60,170,130)] mt-0.5">
                        {formatPrice(item.unitPrice || item.price, country.currency, country.symbol)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-surface-muted text-gray-600 transition-colors cursor-pointer"
                        title="Decrease"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-gray-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-surface-muted text-gray-600 transition-colors cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-auto">
              <div className="flex justify-between items-center mb-1.5 text-sm font-semibold text-text-primary">
                <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-base font-bold text-[rgb(60,170,130)]">{formatPrice(cart.subtotal, country.currency, country.symbol)}</span>
              </div>
              <p className="text-[11px] text-text-muted mb-4">Taxes and shipping calculated at checkout.</p>
              <div className="flex flex-col gap-2">
                <Link to={ROUTES.CHECKOUT} onClick={closeCart} className="w-full">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-[rgb(60,170,130)] hover:brightness-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to={ROUTES.CART} onClick={closeCart} className="w-full">
                  <button
                    type="button"
                    className="w-full py-2 px-4 rounded-xl border border-border hover:bg-surface-muted text-text-primary text-xs font-semibold transition-all cursor-pointer"
                  >
                    View Full Cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
