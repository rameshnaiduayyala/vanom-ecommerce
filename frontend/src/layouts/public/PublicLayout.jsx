import React from "react";
import { Outlet, Link } from "react-router-dom";
import { PublicHeader } from "./PublicHeader.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { useCartStore } from "../../stores/cart.store.js";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";
import { Drawer } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ROUTES } from "../../constants/routes.js";
import { ShoppingBag, ArrowRight, Package, Trash2 } from "lucide-react";


export function PublicLayout() {
  const { cart, isOpen, closeCart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />

      {/* ── Slide-out Mini Cart Drawer ── */}
      <Drawer isOpen={isOpen} onClose={closeCart} title="Cart Summary">
        {cart?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Your cart is empty</h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Browse our catalog to add products or submit a bulk order inquiry.
            </p>
            <Button variant="primary" size="sm" onClick={closeCart}>
              Browse Catalog
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Item List */}
            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              {cart.items.map((item, index) => (
                <div key={index} className="py-3.5 px-1 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">
                      {item.name || item.productName || "Cart Item"}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {formatPrice(item.unitPrice || item.price, country.currency, country.symbol)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-slate-200 pt-4 mt-auto space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal, country.currency, country.symbol)}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Taxes, duties, and shipping are calculated at checkout based on your region and order type.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Link to={ROUTES.CHECKOUT} onClick={closeCart}>
                  <Button variant="primary" className="w-full font-bold" icon={ArrowRight} iconPosition="right">
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
