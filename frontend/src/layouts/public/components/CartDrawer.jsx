import React from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Drawer } from "../../../components/ui/Modal.jsx";
import { ROUTES } from "../../../constants/routes.js";
import { ShoppingBag, ArrowRight, Package, Trash2, Plus, Minus, ShieldCheck } from "lucide-react";

/**
 * Reusable Cart Drawer Component for public and customer layouts
 */
export function CartDrawer() {
  const { cart, isOpen, closeCart, setCart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();

  const handleQuantity = (id, delta) => {
    const newItems = cart.items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    const subtotal = newItems.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity,
      0
    );
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  const handleRemove = (id) => {
    const newItems = cart.items.filter((item) => item.id !== id);
    const subtotal = newItems.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity,
      0
    );
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title="Cart Summary">
      {!cart?.items || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-[#003876]">
            <ShoppingBag className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h4 className="text-base font-black text-slate-950 mb-1">Your cart is empty</h4>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-xs">
            Discover trending electronics, commercial appliances, bulk groceries & packaging.
          </p>
          <Link to={ROUTES.PRODUCTS} onClick={closeCart} className="w-full">
            <button className="w-full py-2.5 px-4 rounded-xl bg-[#003876] hover:bg-[#002b5c] text-white text-xs font-black transition-colors cursor-pointer shadow-xs">
              Explore Catalog
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header info strip */}
          <div className="pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              {cart.items.length} {cart.items.length === 1 ? "Product" : "Products"} in Cart
            </span>
            <button
              onClick={clearLocalCart}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              Clear Cart
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="py-3.5 flex gap-3 items-center group">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                {/* Title & Price */}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">
                    {item.name || item.productName || "Product Item"}
                  </h5>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs font-black text-slate-950">
                      {formatPrice(item.price || item.unitPrice, country.currency, country.symbol)}
                    </span>
                    <span className="text-[10px] text-slate-400">ea</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, -1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, 1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Summary Card */}
          <div className="border-t border-slate-200 pt-4 mt-auto space-y-3 bg-white">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(cart.subtotal, country.currency, country.symbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-emerald-700">Calculated at Checkout</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Estimated Total</span>
                <span className="text-lg text-[#003876]">
                  {formatPrice(cart.subtotal, country.currency, country.symbol)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Link to={ROUTES.CHECKOUT} onClick={closeCart}>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </Link>
              <Link to={ROUTES.CART} onClick={closeCart}>
                <button className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center hover:bg-slate-50">
                  View Full Cart Page
                </button>
              </Link>
            </div>

            {/* Security reassurance */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL Encrypted Checkout · Multi-Tax Compliant</span>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default CartDrawer;
