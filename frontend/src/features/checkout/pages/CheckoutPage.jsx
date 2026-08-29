import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ChevronRight,
  Package,
  Building2,
} from "lucide-react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Ramesh Sharma",
    email: "ramesh.sharma@example.com",
    phone: "+91 79894 19864",
    addressLine1: "Suite 402, Trade Avenue",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    paymentMethod: "CARD",
  });

  const subtotal = cart.subtotal || 998;
  const taxAmount = Number((subtotal * 0.12).toFixed(2));
  const shippingCost = subtotal > 2999 ? 0 : 45;
  const grandTotal = subtotal + taxAmount + shippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await Api.cart.placeOrder({
        items:
          cart.items.length > 0
            ? cart.items
            : [
                {
                  id: "prod-1",
                  name: "Commercial Pallet Consignment",
                  quantity: 1,
                  price: subtotal,
                },
              ],
        shippingAddress: {
          name: formData.fullName,
          line1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: country.name,
        },
        paymentMethod: formData.paymentMethod,
        currency: country.currency,
      });

      clearLocalCart();

      // Confetti Cannon
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#003876", "#FFE000", "#10B981", "#0284C7"],
        });
      } catch (err) {}

      addToast({
        title: "Order Placed Successfully!",
        message: `Order #${order.orderNumber || "ORD-20260228-8921"} confirmed.`,
        type: "success",
      });

      navigate(`${ROUTES.ORDERS}/${order.id || "ord-101"}`);
    } catch (err) {
      addToast({
        title: "Checkout Error",
        message: err.message || "Failed to place order. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ededed] min-h-screen pb-16">
      {/* ── Navy Breadcrumb Header ── */}
      <div className="bg-[#003876] text-white py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium mb-1.5">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={ROUTES.CART} className="hover:text-white transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">Checkout</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Secure Fast Checkout
              </h1>
              <p className="text-xs text-white/60 mt-0.5">
                Multi-tax validation & encrypted SSL transaction processing
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/20 text-xs font-bold text-white self-start sm:self-auto">
              <Lock className="w-4 h-4 text-[#FFE000]" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Form Container ── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 mt-5">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Delivery & Payment Details (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Shipping Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#003876]/10 text-[#003876] flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                    Delivery Address ({country.name})
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {country.currency} Billing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-[#003876]/10 text-[#003876] flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "CARD",
                    title: "Credit / Debit Card",
                    sub: "Visa, MasterCard, Amex",
                    icon: CreditCard,
                  },
                  {
                    id: "NET30",
                    title: "NET 30 Corporate",
                    sub: "Invoicing with VAT / Tax ID",
                    icon: Building2,
                  },
                  {
                    id: "STRIPE",
                    title: "Instant Pay",
                    sub: "Stripe 1-Click Checkout",
                    icon: Lock,
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.paymentMethod === pm.id
                        ? "border-[#003876] bg-blue-50/70 shadow-2xs ring-1 ring-[#003876]"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <pm.icon className="w-4 h-4 text-[#003876]" />
                        <span className="text-xs font-bold text-slate-900">{pm.title}</span>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === pm.id}
                        onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                        className="text-[#003876]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight">
                      {pm.sub}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Total & Instant Checkout CTA (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Itemized lines */}
            <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(subtotal, country.currency, country.symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (Sales Tax / VAT)</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(taxAmount, country.currency, country.symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Freight</span>
                <span className="font-bold text-emerald-700">
                  {shippingCost === 0
                    ? "FREE"
                    : formatPrice(shippingCost, country.currency, country.symbol)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-black text-slate-950">Payable Total</span>
              <span className="text-2xl font-black text-[#003876]">
                {formatPrice(grandTotal, country.currency, country.symbol)}
              </span>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order & Pay"}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Assurances */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PCI-DSS Level 1 Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#003876] shrink-0" />
                <span>Automated Tax Invoicing via Email</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
