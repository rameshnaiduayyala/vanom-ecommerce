import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { getBackendProvider } from "../config/paymentProviders.config.js";
import { openRazorpayCheckout } from "../../../services/payment/razorpay.handler.js";
import { calculateCheckoutTax } from "../../../services/tax/taxEngine.js";

// Default address per country
const COUNTRY_DEFAULTS = {
  US: { city: "Los Angeles", state: "CA", postalCode: "90001", phone: "+1 213 000 0000" },
  CA: { city: "Toronto",     state: "ON", postalCode: "M5V 2T6", phone: "+1 416 000 0000" },
  IN: { city: "Mumbai",      state: "Maharashtra", postalCode: "400001", phone: "+91 98765 43210" },
};

function getDefaultForm(user, countryCode) {
  const geo = COUNTRY_DEFAULTS[countryCode] || COUNTRY_DEFAULTS.US;
  const paymentMethod = countryCode === "IN" ? "RAZORPAY" : "CARD";
  return {
    fullName:     user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email:        user?.email   || "",
    phone:        user?.phone   || geo.phone,
    addressLine1: "",
    city:         geo.city,
    state:        geo.state,
    postalCode:   geo.postalCode,
    paymentMethod,
  };
}

export function useCheckout() {
  const navigate = useNavigate();
  const { cart, clearLocalCart }   = useCartStore();
  const { country }                = useCountryStore();
  const { isAuthenticated, user }  = useAuthStore();
  const { addToast }               = useUIStore();

  const [loading, setLoading]             = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData]           = useState(() => getDefaultForm(user, country.code));
  const [taxData, setTaxData]             = useState(null);
  const [isCalculatingTax, setIsCalc]     = useState(false);

  // ── Derived totals (declared before the tax effect that depends on subtotal) ──
  const subtotal   = cart.subtotal || 0;
  const taxAmount  = taxData?.totalTax ? Number(taxData.totalTax) : Number((subtotal * 0.0882).toFixed(2));
  const shipping   = subtotal >= 500 ? 0 : country.code === "CA" ? 6.99 : 4.99;
  const grandTotal = subtotal + taxAmount + shipping;

  // Sync user fields when auth state changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || prev.fullName,
        email:    user.email || prev.email,
        phone:    user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Re-set geo defaults when country changes
  useEffect(() => {
    const geo = COUNTRY_DEFAULTS[country.code] || COUNTRY_DEFAULTS.US;
    setFormData((prev) => ({
      ...prev,
      city:       prev.city       || geo.city,
      state:      prev.state      || geo.state,
      postalCode: prev.postalCode || geo.postalCode,
    }));
  }, [country.code]);

  // Self-maintained local tax calculation using autonomous dataset
  useEffect(() => {
    setIsCalc(true);
    try {
      const calculated = calculateCheckoutTax({
        countryCode: country?.code || "US",
        stateCode: formData.state || "",
        postalCode: formData.postalCode || "",
        subtotal,
        items: cart.items || [],
      });
      setTaxData(calculated);
    } catch (err) {
      console.error("Tax calculation error:", err);
    } finally {
      setIsCalc(false);
    }
  }, [country?.code, formData.state, formData.postalCode, subtotal, cart.items]);

  // ── Handlers ─────────────────────────────────────────────────────
  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

    const executeOrder = async (fd = formData) => {
    setLoading(true);
    try {
      const order = await Api.cart.placeOrder({
        countryId: country.id || country.code,
        currencyCode: country.currency || "USD",
        items: (cart.items || []).map((item) => ({
          productId: item.productId || item.id,
          variantId: item.variantId || null,
          quantity: item.quantity || 1,
        })),
        shippingAddress: {
          fullName:     fd.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Valued Customer",
          phone:        fd.phone || "+10000000000",
          addressLine1: fd.addressLine1 || "Main Street",
          city:         fd.city || "City",
          state:        fd.state || "CA",
          postalCode:   fd.postalCode || "90001",
          countryCode:  country.code || "US",
        },
      });
      clearLocalCart();

      // Create payment intent
      try {
        const paymentRes = await Api.payments.createPaymentIntent(order.id, fd.paymentMethod);

        // Handle Razorpay checkout modal
        if (fd.paymentMethod === "RAZORPAY" || fd.paymentMethod === "AFTERPAY") {
          setLoading(false); // Unblock UI while modal is open
          
          return new Promise((resolve) => {
            openRazorpayCheckout(
              paymentRes,
              {
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerName: fd.fullName,
                customerEmail: fd.email,
                customerPhone: fd.phone,
              },
              (result) => {
                // Payment success
                try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] }); } catch {}
                addToast({ title: "Payment Successful!", message: `Order #${order?.orderNumber || "ORD-001"} confirmed.`, type: "success" });
                navigate(`${ROUTES.ORDERS}/${order?.id || "ord-101"}`);
                resolve();
              },
              (error) => {
                // Payment failed
                addToast({ 
                  title: "Payment Failed", 
                  description: error?.message || "Please try again or choose a different payment method.", 
                  type: "error" 
                });
                resolve();
              }
            );
          });
        }

        // Handle PayPal redirect
        if (paymentRes?.approvalUrl) {
          window.location.href = paymentRes.approvalUrl;
          return;
        }

        // Handle other providers (card, etc.)
        try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] }); } catch {}
        addToast({ title: "Order Placed!", message: `Order #${order?.orderNumber || "ORD-001"} confirmed.`, type: "success" });
        navigate(`${ROUTES.ORDERS}/${order?.id || "ord-101"}`);
      } catch (err) {
        // Non-fatal: payment intent creation failed, but order was placed
        console.error("Payment intent error:", err);
        addToast({ 
          title: "Order Placed (Payment Pending)", 
          description: "Your order has been created. You can complete payment later.", 
          type: "warning" 
        });
        navigate(`${ROUTES.ORDERS}/${order?.id || "ord-101"}`);
      }
    } catch (err) {
      addToast({ title: "Checkout Error", message: err.message || "Failed to place order.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    await executeOrder(formData);
  };

  const handleAuthSuccess = (loggedInUser) => {
    const fd = { ...formData, fullName: `${loggedInUser.firstName || ""} ${loggedInUser.lastName || ""}`.trim() || formData.fullName, email: loggedInUser.email || formData.email };
    setFormData(fd);
    executeOrder(fd);
  };

  return {
    // state
    formData, setField, loading, showAuthModal, setShowAuthModal,
    taxData, isCalculatingTax,
    // totals
    subtotal, taxAmount, shipping, grandTotal,
    // country
    country, isAuthenticated,
    // actions
    handleSubmit, handleAuthSuccess,
    // cart
    cart,
  };
}
