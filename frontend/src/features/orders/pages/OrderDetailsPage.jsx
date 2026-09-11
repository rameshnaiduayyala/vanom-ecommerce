import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";

import {
  OrderHeader,
  OrderTimeline,
  OrderItemsList,
  OrderMetaCards,
  OrderSummarySidebar,
  TaxInvoiceModal,
} from "../components/index.js";

export function OrderDetailsPage() {
  const { id } = useParams();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => Api.orders.getById(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Order Not Found</h2>
        <p className="text-sm text-text-muted">
          We could not locate this order. Please verify the order reference or log in with the correct account.
        </p>
        <Link to={ROUTES.ORDERS} className="mt-4 inline-block">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status?.replace(/_/g, " ") || "Confirmed",
    color: "emerald",
  };

  const currencySymbol = order.symbol || (order.currency === "USD" ? "$" : "₹");
  const currencyCode = order.currency || "INR";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Quick Actions */}
      <OrderHeader
        order={order}
        statusConfig={statusConfig}
        onOpenInvoice={() => setShowInvoiceModal(true)}
        onPrint={handlePrint}
      />

      {/* Fulfillment Status Timeline */}
      <OrderTimeline order={order} statusConfig={statusConfig} />

      {/* Main Grid: Items + Customer & Financials Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsList
            items={order.items}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
          <OrderMetaCards
            user={order.user}
            payments={order.payments}
            status={order.status}
          />
        </div>

        <div className="space-y-6">
          <OrderSummarySidebar
            order={order}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            onOpenInvoice={() => setShowInvoiceModal(true)}
          />
        </div>
      </div>

      {/* Printable Tax / Commercial Invoice Modal */}
      <TaxInvoiceModal
        order={order}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onPrint={handlePrint}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        statusConfig={statusConfig}
      />
    </div>
  );
}
export default OrderDetailsPage;
