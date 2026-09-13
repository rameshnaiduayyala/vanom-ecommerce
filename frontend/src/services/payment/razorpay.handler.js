/**
 * Razorpay Payment Handler
 * Handles Razorpay checkout modal and payment flow
 */

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder_replace_with_real_id";

/**
 * Load Razorpay SDK from CDN
 */
export function loadRazorpaySDK() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay SDK failed to initialize"));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Razorpay SDK"));
    };

    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout modal
 * @param {Object} paymentIntent - Payment intent from backend
 * @param {Object} orderData - Order information
 * @param {Function} onSuccess - Callback on successful payment
 * @param {Function} onError - Callback on payment error
 */
export async function openRazorpayCheckout(paymentIntent, orderData, onSuccess, onError) {
  try {
    // Load Razorpay SDK
    await loadRazorpaySDK();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const options = {
      key: RAZORPAY_KEY,
      order_id: paymentIntent.providerPaymentId, // Razorpay order ID
      amount: Math.round(paymentIntent.amount * 100), // Amount in paise
      currency: paymentIntent.currency || "INR",
      name: "Vanom",
      description: `Order ${orderData.orderNumber || ""}`,
      image: "/vanom-logo.png",
      handler: async (response) => {
        try {
          // Verify payment on backend
          const verifyRes = await verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            paymentIntent.paymentId
          );

          if (verifyRes?.success) {
            onSuccess({ status: "CAPTURED", paymentId: paymentIntent.paymentId });
          } else {
            onError(new Error("Payment verification failed"));
          }
        } catch (err) {
          onError(err);
        }
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone?.replace(/\D/g, "") || "", // Only digits for Razorpay
      },
      notes: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
      },
      theme: {
        color: "#185e3e", // Vanom brand color
      },
      modal: {
        ondismiss: () => {
          onError(new Error("Payment cancelled by user"));
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment error
    rzp.on("payment.failed", (response) => {
      onError(new Error(`Payment failed: ${response.error.description}`));
    });

    // Open checkout
    rzp.open();
  } catch (err) {
    console.error("Razorpay checkout error:", err);
    onError(err);
  }
}

/**
 * Verify Razorpay payment signature on backend
 */
async function verifyRazorpayPayment(orderId, paymentId, signature, dbPaymentId) {
  try {
    const response = await fetch("/api/v1/payments/verify-razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
        dbPaymentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Razorpay verification error:", err);
    throw err;
  }
}
