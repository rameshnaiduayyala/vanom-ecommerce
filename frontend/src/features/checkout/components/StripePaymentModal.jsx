import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, ShieldCheck, AlertCircle, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { formatPrice } from "../../../utils/formatters.js";

// Memoize stripePromise to avoid recreating it on every render
let cachedStripeKey = null;
let stripePromiseInstance = null;
function getStripePromise(publishableKey) {
  const key = publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.includes("placeholder")) {
    return null;
  }
  if (stripePromiseInstance && cachedStripeKey === key) {
    return stripePromiseInstance;
  }
  cachedStripeKey = key;
  stripePromiseInstance = loadStripe(key);
  return stripePromiseInstance;
}

function StripeCheckoutForm({
  order,
  amount,
  currency,
  symbol,
  onSuccess,
  onCancel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const scrollContainerRef = React.useRef(null);

  // Keep scroll container pinned to the top on ready
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/payment/processing?orderId=${order?.id || ""}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment authorization failed. Please check your payment details.");
        setIsProcessing(false);
      } else if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")
      ) {
        onSuccess(paymentIntent);
      } else {
        // Fallback for custom redirect states
        onSuccess({ id: paymentIntent?.id || order?.id, status: "succeeded" });
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected network error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      {/* Scrollable form body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4 max-h-[58vh]"
      >
        {/* Order summary banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                Order Reference
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {order?.orderNumber || (order?.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : "—")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Amount Due
            </span>
            <span className="text-base font-black text-[#185e3e] font-mono">
              {formatPrice(amount, currency, symbol)}
            </span>
          </div>
        </div>

        {/* Loading placeholder while Stripe Elements initializes */}
        {!isReady && (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#185e3e]" />
            <p className="text-xs">Loading secure payment options...</p>
          </div>
        )}

        {/* Stripe Payment Element */}
        <div className={isReady ? "block" : "hidden"}>
          <PaymentElement
            onReady={() => {
              setIsReady(true);
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
              }
            }}
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: order?.customerName || order?.shippingAddress?.name || "",
                  phone: order?.shippingAddress?.phone || "",
                },
              },
            }}
          />
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Sticky action footer */}
      <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!stripe || !elements || isProcessing || !isReady}
            className="bg-[#185e3e] hover:bg-[#124930] text-white font-bold px-6 shadow-md transition-all flex items-center justify-center min-w-[180px]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 mr-0.5" />
                Pay {formatPrice(amount, currency, symbol)}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            Powered by <strong className="text-slate-700 font-bold">stripe</strong>
          </span>
        </div>
      </div>
    </form>
  );
}

export function StripePaymentModal({
  isOpen,
  onClose,
  clientSecret,
  publishableKey,
  order,
  amount,
  currency = "USD",
  symbol = "$",
  onSuccess,
}) {
  if (!isOpen || !clientSecret) return null;

  const stripePromise = getStripePromise(publishableKey);
  const isMockSecret = clientSecret.includes("mock") || !stripePromise;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Brand Header */}
        <div className="bg-[#0e3a24] text-white px-6 py-4.5 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Complete Payment
                <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded-full border border-emerald-400/20">
                  Stripe
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/70">
                Safe & encrypted payment checkout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {isMockSecret ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <strong className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Developer Test Mode:
              </strong>
              <p className="text-[11px] leading-relaxed">
                Stripe test clientSecret received: <code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">{clientSecret}</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Due:</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {formatPrice(amount, currency, symbol)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Order Ref:</span>
                <span className="font-mono font-bold text-slate-700">
                  {order?.orderNumber || (order?.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : "—")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => onSuccess({ id: `pi_sim_${Date.now()}`, status: "succeeded" })}
                className="bg-[#185e3e] hover:bg-[#124930] text-white font-bold"
              >
                Simulate Successful Payment
              </Button>
            </div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#185e3e",
                  colorBackground: "#ffffff",
                  colorText: "#0f172a",
                  colorDanger: "#e11d48",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                  borderRadius: "10px",
                  fontSizeSm: "12px",
                  fontSizeBase: "14px",
                  spacingUnit: "4px",
                },
                rules: {
                  ".Tab": {
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    padding: "10px 12px",
                    borderRadius: "10px",
                  },
                  ".Tab:hover": {
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                  },
                  ".Tab--selected": {
                    border: "1.5px solid #185e3e !important",
                    backgroundColor: "#f0fdf4 !important",
                    boxShadow: "0 0 0 1px #185e3e",
                  },
                  ".Input": {
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  },
                  ".Input:focus": {
                    border: "1.5px solid #185e3e",
                    boxShadow: "0 0 0 3px rgba(24, 94, 62, 0.12)",
                  },
                },
              },
            }}
          >
            <StripeCheckoutForm
              order={order}
              amount={amount}
              currency={currency}
              symbol={symbol}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default StripePaymentModal;
