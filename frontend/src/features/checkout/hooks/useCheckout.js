import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";

// Default address per country
const COUNTRY_DEFAULTS = {
  US: { city: "Los Angeles", state: "CA", postalCode: "90001", phone: "+1 213 000 0000" },
  CA: { city: "Toronto",     state: "ON", postalCode: "M5V 2T6", phone: "+1 416 000 0000" },
};

function getDefaultForm(user, countryCode) {
  const geo = COUNTRY_DEFAULTS[countryCode] || COUNTRY_DEFAULTS.US;
  return {
    fullName:     user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email:        user?.email   || "",
    phone:        user?.phone   || geo.phone,
    addressLine1: "",
    city:         geo.city,
    state:        geo.state,
    postalCode:   geo.postalCode,
    paymentMethod: "CARD",
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

  // Live tax calculation (debounced 300 ms)
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsCalc(true);
      try {
        const items = cart.items.length > 0
          ? cart.items
          : [{ id: "p1", unitPrice: 499, quantity: 1 }];

        const res = await Api.tax.calculateTax({
          countryCode: country?.code || "US",
          regionCode:  formData.state    || undefined,
          postalCode:  formData.postalCode || undefined,
          items: items.map((item) => {
            const unitPrice = Number(item.price || item.unitPrice || 499);
            return { productId: item.productId || item.id, variantId: item.variantId || null, unitPrice, quantity: item.quantity, subtotal: unitPrice * item.quantity };
          }),
        });
        if (isMounted) setTaxData(res?.data || res);
      } catch {
        if (isMounted) {
          const rate = country.code === "CA" ? 0.13 : 0.0882;
          setTaxData({ totalTax: Number((subtotal * rate).toFixed(2)), effectiveRate: rate, jurisdiction: formData.state || country.code, provider: "FALLBACK" });
        }
      } finally {
        if (isMounted) setIsCalc(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { isMounted = false; clearTimeout(t); };
  }, [country?.code, formData.state, formData.postalCode, subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────
  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const executeOrder = async (fd = formData) => {
    setLoading(true);
    try {
      const order = await Api.cart.placeOrder({
        items: cart.items,
        shippingAddress: {
          name:       fd.fullName,
          line1:      fd.addressLine1,
          city:       fd.city,
          state:      fd.state,
          postalCode: fd.postalCode,
          country:    country.name,
        },
        paymentMethod: fd.paymentMethod,
        currency:      country.currency,
      });
      clearLocalCart();
      try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] }); } catch {}
      addToast({ title: "Order Placed!", message: `Order #${order?.orderNumber || "ORD-001"} confirmed.`, type: "success" });
      navigate(`${ROUTES.ORDERS}/${order?.id || "ord-101"}`);
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
