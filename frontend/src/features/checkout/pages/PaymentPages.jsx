import React from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { SEO } from "../../../components/common/SEO.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { paymentService } from "../../../services/api/payment.service.js";
import { getBackendProvider } from "../config/paymentProviders.config.js";

export function PaymentProcessingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useUIStore();
  const orderId = searchParams.get("orderId");
  const provider = searchParams.get("provider") || "CARD";
  const status = searchParams.get("status");

  const backendProvider = getBackendProvider(provider);

  React.useEffect(() => {
    if (status === "approved" || status === "captured") {
      addToast({ title: "Payment Successful", message: "Your payment has been processed.", type: "success" });
      navigate(`${ROUTES.ORDERS}/${orderId || ""}`, { replace: true });
    } else if (status === "failed") {
      addToast({ title: "Payment Failed", message: "Please try again or choose a different payment method.", type: "error" });
    }
  }, [status, addToast, navigate, orderId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Processing Payment | Vanom" noindex={true} />
      <div className="max-w-md mx-auto text-center space-y-6">
        <Loader2 className="w-16 h-16 mx-auto animate-spin text-[#185e3e]" />
        <h1 className="text-2xl font-bold text-gray-900">Processing Payment</h1>
        <p className="text-sm text-gray-500">
          Please wait while we process your payment via {backendProvider}...
        </p>
        <p className="text-[10px] text-gray-400">Order: {orderId || "—"}</p>
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  React.useEffect(() => {
    addToast({ title: "Payment Confirmed", message: "Your order is confirmed.", type: "success" });
  }, [addToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Payment Successful | Vanom" noindex={true} />
      <div className="max-w-md mx-auto text-center space-y-6">
        <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="text-sm text-gray-500">Your payment has been processed. You will be redirected to your orders.</p>
        <Button variant="primary" onClick={() => navigate(ROUTES.ORDERS)}>
          View Orders
        </Button>
      </div>
    </div>
  );
}

export function PaymentCancelledPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  React.useEffect(() => {
    addToast({ title: "Payment Cancelled", message: "You cancelled the payment. You can try again.", type: "error" });
  }, [addToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Payment Cancelled | Vanom" noindex={true} />
      <div className="max-w-md mx-auto text-center space-y-6">
        <AlertCircle className="w-16 h-16 mx-auto text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-sm text-gray-500">You cancelled the payment. You can try again.</p>
        <Button variant="primary" onClick={() => navigate(ROUTES.CHECKOUT)}>
          Return to Checkout
        </Button>
      </div>
    </div>
  );
}
