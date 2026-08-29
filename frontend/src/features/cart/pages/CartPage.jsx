import React from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, ChevronRight, Truck } from "lucide-react";
import { EmptyState } from "../../../components/ui/Alert.jsx";

export function CartPage() {
  const { cart, setCart, clearLocalCart } = useCartStore();
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

    const subtotal = newItems.reduce((sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  const handleRemove = (id) => {
    const newItems = cart.items.filter((item) => item.id !== id);
    const subtotal = newItems.reduce((sum, item) => sum + (item.price || item.unitPrice || 499) * item.quantity, 0);
    setCart({ items: newItems, itemCount: newItems.length, subtotal });
  };

  return (
    <div className="bg-[#ededed] min-h-screen pb-14">
      {/* ── Navy Breadcrumb Header ── */}
      <div className="bg-[#003876] text-white py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium mb-1.5">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">Shopping Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Your Cart Summary
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Review your selected items or update quantities before proceeding to checkout
          </p>
        </div>
      </div>

      {/* ── Main Cart Content ── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-5">
        {!cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#003876] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h2 className="text-xl font-black text-slate-950 mb-2">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Explore our live catalog of electronics, commercial appliances, bulk groceries, and packaging.
            </p>
            <Link to={ROUTES.PRODUCTS}>
              <button className="px-6 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-xs font-black transition-colors cursor-pointer shadow-md">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-slate-950">
                  Cart Items ({cart.items.length})
                </span>
                <button
                  onClick={clearLocalCart}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Item visual + details */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-950 truncate leading-snug">
                          {item.name || item.productName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Unit Price: <span className="font-bold text-slate-900">{formatPrice(item.price || item.unitPrice, country.currency, country.symbol)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => handleQuantity(item.id, -1)}
                          className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantity(item.id, 1)}
                          className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-black text-[#003876] block">
                          {formatPrice((item.price || item.unitPrice) * item.quantity, country.currency, country.symbol)}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center">
                  <span>Product Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(cart.subtotal, country.currency, country.symbol)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Freight</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Calculated at Checkout
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-slate-900">Inclusive</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-black text-slate-950">Estimated Total</span>
                <span className="text-2xl font-black text-[#003876]">
                  {formatPrice(cart.subtotal, country.currency, country.symbol)}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link to={ROUTES.CHECKOUT} className="block pt-2">
                <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </Link>

              {/* Assurances */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#003876] shrink-0" />
                  <span>Dispatch SLA guarantee on all orders</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
