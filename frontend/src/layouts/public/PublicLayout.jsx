import React from "react";
import { Outlet, Link } from "react-router-dom";
import { PublicHeader, PublicNavigation } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { useCartStore } from "../../stores/cart.store.js";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";
import { Drawer } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ROUTES } from "../../constants/routes.js";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";

export function PublicLayout() {
  const { cart, isOpen, closeCart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary">
      <PublicHeader />
      <PublicNavigation />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />

      {/* Slide-out Mini Cart Drawer */}
      <Drawer isOpen={isOpen} onClose={closeCart} title="Your Shopping Cart">
        {cart?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="w-12 h-12 text-text-muted mb-3" />
            <h4 className="text-sm font-semibold text-text-primary mb-1">Your cart is empty</h4>
            <p className="text-xs text-text-muted mb-4">Add fresh soils, planters, or foliage to get started.</p>
            <Button variant="primary" size="sm" onClick={closeCart}>
              Browse Store
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 divide-y divide-border overflow-y-auto pr-1">
              {cart.items.map((item, index) => (
                <div key={index} className="py-3 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-surface-muted border border-border flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-text-primary truncate">{item.name || item.productName || "Cart Item"}</h5>
                    <p className="text-[11px] text-text-muted">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-brand-700">
                      {formatPrice(item.unitPrice || item.price, country.currency, country.symbol)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-auto">
              <div className="flex justify-between items-center mb-3 text-sm font-semibold text-text-primary">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal, country.currency, country.symbol)}</span>
              </div>
              <p className="text-[11px] text-text-muted mb-4">Taxes and shipping calculated securely at checkout.</p>
              <div className="flex flex-col gap-2">
                <Link to={ROUTES.CHECKOUT} onClick={closeCart}>
                  <Button variant="primary" className="w-full" icon={ArrowRight} iconPosition="right">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to={ROUTES.CART} onClick={closeCart}>
                  <Button variant="secondary" className="w-full text-xs">
                    View Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
