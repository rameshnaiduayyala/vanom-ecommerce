import React from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
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

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          action={
            <Link to={ROUTES.PRODUCTS}>
              <Button variant="primary" size="sm">
                Explore Products
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Shopping Cart ({cart.items.length} items)</h1>
        <Button variant="ghost" size="sm" onClick={clearLocalCart} className="text-red-600 hover:bg-red-50 text-xs">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-white border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-muted border border-border overflow-hidden shrink-0">
                  <img src={item.image || "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{item.name || item.productName}</h4>
                  <p className="text-xs text-brand-700 font-bold mt-1">
                    {formatPrice(item.price || item.unitPrice, country.currency, country.symbol)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg bg-white">
                  <button onClick={() => handleQuantity(item.id, -1)} className="p-1.5 hover:bg-surface-muted">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.id, 1)} className="p-1.5 hover:bg-surface-muted">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => handleRemove(item.id)} className="text-text-muted hover:text-red-600 p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-border space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-2 text-xs text-text-secondary border-b border-border pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-text-primary">{formatPrice(cart.subtotal, country.currency, country.symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-emerald-700 font-medium">Standard Ground</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-base font-bold text-text-primary">
              <span>Estimated Total</span>
              <span className="text-xl text-brand-700 font-black">{formatPrice(cart.subtotal, country.currency, country.symbol)}</span>
            </div>

            <Link to={ROUTES.CHECKOUT} className="block">
              <Button variant="primary" size="lg" className="w-full font-bold" icon={ArrowRight} iconPosition="right">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
