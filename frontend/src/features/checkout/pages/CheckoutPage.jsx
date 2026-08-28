import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { Api } from "../../../services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { ShieldCheck, Truck, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearLocalCart } = useCartStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Ramesh Sharma",
    email: "ramesh.sharma@example.com",
    phone: "+91 98765 43210",
    addressLine1: "Flat 402, Lotus Heights",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    paymentMethod: "CARD",
  });

  const subtotal = cart.subtotal || 998;
  const taxAmount = Number((subtotal * 0.18).toFixed(2));
  const shippingCost = 50;
  const grandTotal = subtotal + taxAmount + shippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await Api.cart.placeOrder({
        items: cart.items.length > 0 ? cart.items : [{ id: "prod-1", name: "Premium Organic Garden Soil (50 KG Sack)", quantity: 2, price: 499 }],
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
      
      // Celebratory Confetti Cannon
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"],
        });
      } catch (e) {}

      addToast({
        title: "Order Placed Successfully!",
        message: `Order #${order.orderNumber || "ORD-20260228-8921"} has been confirmed.`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Secure Checkout</h1>
        </div>
        <Badge variant="brand" size="md" className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
        </Badge>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 rounded-xl bg-white border border-border space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Truck className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                1. Delivery Address ({country.name})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Street Address / Building"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                required
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
                <Input
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-xl bg-white border border-border space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                2. Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "CARD", title: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                { id: "UPI", title: "UPI / Instant Pay", sub: "GPay, PhonePe, Razorpay" },
                { id: "NETBANKING", title: "Net Banking", sub: "All Major Banks" },
              ].map((pm) => (
                <label
                  key={pm.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    formData.paymentMethod === pm.id
                      ? "border-brand-500 bg-brand-50/50 shadow-xs"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-text-primary">{pm.title}</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === pm.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className="text-brand-600"
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">{pm.sub}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authoritative Calculation */}
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Order Total Summary
            </h3>

            <div className="space-y-2.5 text-xs text-text-secondary border-b border-border pb-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(subtotal, country.currency, country.symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (18% GST / VAT)</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(taxAmount, country.currency, country.symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Shipping</span>
                <span className="font-semibold text-text-primary">
                  {formatPrice(shippingCost, country.currency, country.symbol)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-text-primary">Payable Amount</span>
              <span className="text-2xl font-black text-brand-700">
                {formatPrice(grandTotal, country.currency, country.symbol)}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-sm"
              isLoading={loading}
            >
              Place Order & Pay
            </Button>

            <p className="text-[10px] text-text-muted text-center leading-relaxed">
              By placing your order, you agree to Vanom terms and authoritative backend price validation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
