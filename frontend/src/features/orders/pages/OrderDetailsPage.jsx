import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { ArrowLeft, AlertCircle, FileText, Printer, Building2, PackageCheck } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Spinner } from "../../../components/ui/Alert.jsx";
import { EnterpriseInvoiceModal } from "../../../components/common/EnterpriseInvoiceModal.jsx";

import {
  OrderHeader,
  OrderTimeline,
  OrderItemsList,
  OrderMetaCards,
  OrderSummarySidebar,
} from "../components/index.js";

export function OrderDetailsPage() {
  const { id } = useParams();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      // 1. Try standard retail order lookup
      try {
        const res = await Api.orders.getById(id);
        if (res && (res.id || res.orderNumber)) return res;
      } catch (err) {
        // Fallthrough to bulk order lookup
      }

      // 2. Try B2B Wholesale Bulk Order lookup
      try {
        const bulkRes = await Api.b2b.getBulkOrderById(id);
        if (bulkRes && (bulkRes.id || bulkRes.orderNumber)) return bulkRes;
      } catch (err) {
        // Fallthrough to admin bulk order lookup
      }

      try {
        const adminBulkRes = await Api.b2b.getAdminBulkOrderById(id);
        if (adminBulkRes && (adminBulkRes.id || adminBulkRes.orderNumber)) return adminBulkRes;
      } catch (err) {
        // No match found
      }

      // Try searching via list queries
      try {
        const allRetail = await Api.orders.list({ limit: 100 });
        const found = allRetail?.items?.find((o) => o.id === id || o.orderNumber === id);
        if (found) return found;
      } catch (err) {}

      try {
        const allBulk = await Api.b2b.listBulkOrders();
        const foundBulk = (Array.isArray(allBulk) ? allBulk : allBulk?.items || []).find(
          (o) => o.id === id || o.orderNumber === id
        );
        if (foundBulk) return foundBulk;
      } catch (err) {}

      throw new Error("Order not found");
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted animate-pulse">Retrieving order details & invoice...</p>
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
          We could not locate reference <span className="font-mono font-bold text-slate-800">{id}</span>. Please verify the order number or log in to your account.
        </p>
        <Link to={ROUTES.ORDERS} className="mt-4 inline-block">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const isB2B = !!order.bulkProduct || !!order.business || !!order.company || order.type === "B2B";
  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status?.replace(/_/g, " ") || "Confirmed",
    color: "emerald",
  };

  const currencySymbol = order.symbol || order.currency?.symbol || (order.currency === "USD" || order.currencyCode === "USD" ? "$" : "₹");
  const currencyCode = order.currency?.code || order.currencyCode || order.currency || "USD";

  const handlePrint = () => {
    setShowInvoiceModal(true);
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
            items={order.items || []}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
          />
          <OrderMetaCards
            user={order.user || order.requestedBy}
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

      {/* Unified Wide & Smart Enterprise Commercial / Retail Invoice Modal */}
      <EnterpriseInvoiceModal
        order={order}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        type={isB2B ? "B2B" : "RETAIL"}
      />
    </div>
  );
}
export default OrderDetailsPage;
