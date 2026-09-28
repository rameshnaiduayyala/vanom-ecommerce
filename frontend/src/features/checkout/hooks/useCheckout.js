import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useCartStore } from "../../../stores/cart.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { openRazorpayCheckout } from "../../../services/payment/razorpay.handler.js";

// Default phone per country (city/state/postal left blank so user fills them correctly)
const COUNTRY_DEFAULTS = {
  US: { phone: "+1 213 000 0000" },
  CA: { phone: "+1 416 000 0000" },
  IN: { phone: "+91 98765 43210" },
};

function getDefaultForm(user, countryCode) {
  const geo = COUNTRY_DEFAULTS[countryCode] || COUNTRY_DEFAULTS.US;
  const paymentMethod = countryCode === "IN" ? "RAZORPAY" : "CARD";
  return {
    fullName:     user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email:        user?.email   || "",
    phone:        user?.phone   || geo.phone,
    addressLine1: "",
    city:         "",
    state:        "",
    postalCode:   "",
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

  // Shippo Live Carrier Rates & Address Verification State
  const [shippingRates, setShippingRates]         = useState([]);
  const [selectedRate, setSelectedRate]           = useState(null);
  const [isLoadingRates, setIsLoadingRates]       = useState(false);
  const [addressValidation, setAddressValidation] = useState(null);
  const [originWarehouse, setOriginWarehouse]     = useState(null);
  const [freeShippingEligible, setFreeEligible]   = useState(false);

  // Stripe Payment Element Modal state
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeSession, setStripeSession]         = useState(null);

  // ── Derived totals ──
  const subtotal   = cart.subtotal || 0;
  // Shipping strictly comes from selected Shippo carrier rate; NO default $4.99!
  const shipping   = (selectedRate !== null && selectedRate?.amount !== undefined)
    ? parseFloat(selectedRate.amount || 0)
    : null;
  const taxAmount  = taxData?.totalTax !== undefined ? Number(taxData.totalTax) : 0;
  const grandTotal = subtotal + (taxAmount || 0) + (shipping !== null ? shipping : 0);

  // ── Validation Readiness for Place Order ──
  const isShippingReady = selectedRate !== null && shipping !== null && !isLoadingRates;
  const isTaxReady      = taxData !== null && !isCalculatingTax;
  const isAddressComplete = !!(
    formData.addressLine1?.trim() &&
    formData.city?.trim() &&
    formData.postalCode?.trim()
  );

  let disabledReason = null;
  if (!cart?.items || cart.items.length === 0) {
    disabledReason = "Your shopping cart is empty.";
  } else if (!formData.addressLine1?.trim()) {
    disabledReason = "Please enter your delivery street address.";
  } else if (!formData.city?.trim() || !formData.postalCode?.trim()) {
    disabledReason = "Please complete your city and postal code to calculate shipping.";
  } else if (isLoadingRates) {
    disabledReason = "Calculating live carrier shipping rates via Shippo...";
  } else if (!isShippingReady) {
    disabledReason = "Please select a shipping carrier & method.";
  } else if (isCalculatingTax) {
    disabledReason = "Calculating sales tax with Stripe...";
  } else if (!isTaxReady) {
    disabledReason = "Tax calculation is pending.";
  }

  const canPlaceOrder = !disabledReason && !loading;

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

  // When country changes reset address fields so old city/postal don't persist with new country
  useEffect(() => {
    const geo = COUNTRY_DEFAULTS[country.code] || COUNTRY_DEFAULTS.US;
    setFormData((prev) => ({
      ...prev,
      phone:        prev.phone || geo.phone,
      // Clear address fields so user fills them correctly for the new country
      addressLine1: "",
      city:         "",
      state:        "",
      postalCode:   "",
    }));
    // Also clear shipping rates on country change
    setShippingRates([]);
    setSelectedRate(null);
    setAddressValidation(null);
  }, [country.code]);

  // ── Stripe Tax Calculation via Backend API ──
  useEffect(() => {
    let isCancelled = false;

    async function fetchStripeTax() {
      if (!cart.items || cart.items.length === 0) {
        setTaxData(null);
        return;
      }

      setIsCalc(true);
      try {
        const response = await Api.checkout.calculateStripeTax({
          currencyCode: country.currency || "USD",
          shippingCost: shipping,
          shippingAddress: {
            countryCode: country.code || "US",
            state: formData.state || "",
            postalCode: formData.postalCode || "",
            city: formData.city || "",
            addressLine1: formData.addressLine1 || "",
          },
          items: cart.items.map((item) => ({
            productId: item.productId || item.id,
            variantId: item.variantId && item.variantId !== (item.productId || item.id) ? item.variantId : null,
            quantity: item.quantity || 1,
            unitPrice: item.price || item.unitPrice || 0,
            name: item.name || "Product",
          })),
        });

        if (!isCancelled && response) {
          const rawRate = parseFloat(response.rate || 0);
          const normalizedRate = rawRate > 1 ? rawRate / 100 : rawRate;
          setTaxData({
            totalTax: response.taxAmount ?? 0,
            effectiveRate: normalizedRate,
            calculationId: response.calculationId || response.taxCalculationId || null,
            breakdown: response.breakdown || response.taxBreakdown || [],
            isStripeTax: response.isCalculatedViaStripe !== false,
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Stripe Tax calculation warning:", err?.message || err);
          setTaxData({
            totalTax: 0,
            effectiveRate: 0,
            calculationId: null,
            breakdown: [],
            isStripeTax: false,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsCalc(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchStripeTax();
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [country?.code, country?.currency, formData.state, formData.postalCode, subtotal, shipping, cart.items]);

  // ── Shippo Address Validation & Real-Time Carrier Rates ───────────────
  const fetchShippoRates = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoadingRates(true);

    try {
      // 1. If street address is filled, validate address with Shippo
      if (formData.addressLine1 && formData.addressLine1.trim().length >= 4) {
        try {
          const valRes = await Api.shipping.validateAddress({
            fullName: formData.fullName,
            addressLine1: formData.addressLine1,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            countryCode: country.code || "US",
            phone: formData.phone
          });
          const valData = valRes?.isValid !== undefined 
            ? valRes 
            : (valRes?.data?.isValid !== undefined ? valRes.data : null);
          if (valData) {
            setAddressValidation(valData);
          }
        } catch (valErr) {
          console.warn("[Shippo] Address check notice:", valErr?.message || valErr);
        }
      } else {
        setAddressValidation(null);
      }

      // 2. Fetch Live Carrier Rates (works with city/state/postalCode or street address)
      const ratesRes = await Api.shipping.getShippingRates({
        shippingAddress: {
          fullName: formData.fullName || "Customer",
          addressLine1: formData.addressLine1 || "",
          city: formData.city || "",
          state: formData.state || "",
          postalCode: formData.postalCode || "",
          countryCode: country.code || "US",
          phone: formData.phone || ""
        },
        items: (cart.items || []).map(i => ({
          productId: i.productId || i.id,
          variantId: i.variantId && i.variantId !== (i.productId || i.id) ? i.variantId : null,
          quantity: i.quantity || 1
        })),
        subtotal
      });

      // Support axios unwrapped response: ratesRes can be { rates: [...], originWarehouse: {...} },
      // raw array [...], or wrapped { success: true, data: { rates: [...] } }
      let rates = [];
      let origin = null;
      let freeEligible = false;

      if (Array.isArray(ratesRes)) {
        rates = ratesRes;
      } else if (Array.isArray(ratesRes?.rates)) {
        rates = ratesRes.rates;
        origin = ratesRes.originWarehouse || null;
        freeEligible = !!ratesRes.freeShippingEligible;
      } else if (Array.isArray(ratesRes?.data?.rates)) {
        rates = ratesRes.data.rates;
        origin = ratesRes.data.originWarehouse || null;
        freeEligible = !!ratesRes.data.freeShippingEligible;
      } else if (Array.isArray(ratesRes?.data)) {
        rates = ratesRes.data;
        origin = ratesRes.originWarehouse || null;
        freeEligible = !!ratesRes.freeShippingEligible;
      }

      if (rates.length > 0) {
        setShippingRates(rates);
        if (origin) setOriginWarehouse(origin);
        setFreeEligible(freeEligible);

        // Auto-select lowest/first rate if not yet chosen or rate is no longer valid
        setSelectedRate(prev => {
          if (prev && rates.some(r => r.id === prev.id)) return prev;
          return rates[0] || null;
        });
      }
    } catch (err) {
      console.warn("[Shippo] Rate query notice:", err?.message || err);
    } finally {
      if (showLoadingState) {
        setIsLoadingRates(false);
      }
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchShippoRates(true);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    formData.addressLine1,
    formData.city,
    formData.state,
    formData.postalCode,
    country.code,
    subtotal,
    cart.items?.length
  ]);

  const recalculateRates = () => fetchShippoRates(true);

  // ── Handlers ─────────────────────────────────────────────────────
  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const executeOrder = async (fd = formData) => {
    setLoading(true);
    try {
      const checkoutPayload = {
        countryId: country.id || country.code,
        currencyCode: country.currency || "USD",
        shippingCharges: shipping,
        shippingRateId: selectedRate?.id || null,
        shippingCarrier: selectedRate?.carrier || null,
        shippingMethod: selectedRate?.service || null,
        tax: taxAmount,
        discount: 0,
        paymentMethod: fd.paymentMethod,
        items: (cart.items || []).map((item) => ({
          productId: item.productId || item.id,
          variantId: item.variantId && item.variantId !== (item.productId || item.id) ? item.variantId : null,
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
      };

      const checkoutRes = await Api.checkout.processCheckout(checkoutPayload);
      const order = checkoutRes?.order || {
        id: checkoutRes?.orderId || checkoutRes?.id,
        orderNumber: checkoutRes?.orderNumber || (checkoutRes?.orderId ? `ORD-${checkoutRes.orderId.slice(0, 8).toUpperCase()}` : null),
        total: Number(checkoutRes?.total || checkoutRes?.totalAmount || checkoutRes?.amount || grandTotal),
        totalAmount: Number(checkoutRes?.total || checkoutRes?.totalAmount || checkoutRes?.amount || grandTotal),
        currencyCode: checkoutRes?.currency || country.currency || "USD",
        status: checkoutRes?.status || "PENDING_PAYMENT",
      };

      if (!order?.id) {
        throw new Error("Unable to create checkout order session.");
      }

      const displayOrderNumber = order?.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
      const clientSecret = checkoutRes?.clientSecret || order?.clientSecret;
      const publishableKey = checkoutRes?.publishableKey || order?.publishableKey;

      // 1. Stripe Payment Element (Cards, Apple Pay, Google Pay, Wallets, BNPL)
      if (clientSecret) {
        setStripeSession({
          clientSecret,
          publishableKey,
          order,
          amount: Number(order.total || order.totalAmount || checkoutRes?.amount || grandTotal),
          currency: order.currencyCode || country.currency || "USD",
          symbol: country.symbol || "$",
        });
        setIsStripeModalOpen(true);
        setLoading(false);
        return;
      }

      // 2. Razorpay external gateway
      if (fd.paymentMethod === "RAZORPAY" || fd.paymentMethod === "AFTERPAY") {
        try {
          const paymentRes = await Api.payments.createPaymentIntent(order.id, fd.paymentMethod);
          if (paymentRes?.keyId) {
            setLoading(false);
            return new Promise((resolve) => {
              openRazorpayCheckout(
                paymentRes,
                {
                  orderId: order.id,
                  orderNumber: displayOrderNumber,
                  customerName: fd.fullName,
                  customerEmail: fd.email,
                  customerPhone: fd.phone,
                },
                async () => {
                  try {
                    await Api.payments.capturePayment(paymentRes.id, { orderId: order.id });
                  } catch (e) {
                    console.warn("Capture callback:", e);
                  }
                  clearLocalCart();
                  try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] }); } catch {}
                  addToast({ title: "Payment Successful!", message: `Order #${displayOrderNumber} confirmed.`, type: "success" });
                  navigate(`${ROUTES.ORDERS}/${order.id}`);
                  resolve();
                },
                (error) => {
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
        } catch (err) {
          console.warn("Payment intent gateway response:", err?.message || err);
        }
      }

      // 3. PayPal redirect
      if (fd.paymentMethod === "PAYPAL") {
        try {
          const paymentRes = await Api.payments.createPaymentIntent(order.id, "PAYPAL");
          if (paymentRes?.approvalUrl) {
            window.location.href = paymentRes.approvalUrl;
            return;
          }
        } catch (err) {
          console.warn("Payment intent gateway response:", err?.message || err);
        }
      }

      // 4. Default order completion
      clearLocalCart();
      try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] }); } catch {}
      addToast({ title: "Order Placed Successfully!", message: `Order #${displayOrderNumber} confirmed.`, type: "success" });
      navigate(`${ROUTES.ORDERS}/${order.id}`);
    } catch (err) {
      console.error("Checkout execution error:", err);
      addToast({ title: "Checkout Error", message: err.message || "Failed to place order.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent) => {
    const order = stripeSession?.order;
    const displayOrderNumber = order?.orderNumber || (order?.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : "—");

    try {
      // Capture payment, convert stock reservation to SALE, commit tax, generate invoice
      await Api.payments.capturePayment(paymentIntent.id, {
        orderId: order?.id,
        amount: stripeSession?.amount
      });
    } catch (err) {
      console.warn("Capture confirmation notice:", err?.message || err);
    }

    clearLocalCart();
    setIsStripeModalOpen(false);
    setStripeSession(null);

    try {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#008522", "#D9A000", "#5DBB68", "#FFD34D"] });
    } catch {}

    addToast({
      title: "Payment Successful!",
      message: `Order #${displayOrderNumber} confirmed. Your invoice has been generated.`,
      type: "success"
    });

    if (order?.id) {
      navigate(`${ROUTES.ORDERS}/${order.id}`);
    } else {
      navigate(ROUTES.ORDERS);
    }
  };

  const closeStripeModal = () => {
    setIsStripeModalOpen(false);
    addToast({
      title: "Payment Pending",
      message: "Your order is pending payment. You can complete payment at any time from your orders page.",
      type: "info"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canPlaceOrder) {
      addToast({
        title: "Order Incomplete",
        message: disabledReason || "Please verify your shipping method and tax before placing order.",
        type: "warning"
      });
      return;
    }
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
    taxData, isCalculatingTax, isTaxReady,
    // Shippo Shipping
    shippingRates, selectedRate, setSelectedRate, isLoadingRates, recalculateRates,
    isShippingReady, addressValidation, originWarehouse, freeShippingEligible,
    // Order Validation
    canPlaceOrder, disabledReason,
    // Stripe Modal
    isStripeModalOpen, stripeSession, handleStripeSuccess, closeStripeModal,
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
