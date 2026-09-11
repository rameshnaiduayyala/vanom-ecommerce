import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Printer } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { ROUTES } from "../../../constants/routes.js";
import { formatDate } from "../../../utils/formatters.js";

export function OrderHeader({ order, statusConfig, onOpenInvoice, onPrint }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
      <div className="space-y-1">
        <Link
          to={ROUTES.ORDERS}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono tracking-tight">
            {order.orderNumber}
          </h1>
          <Badge variant={statusConfig.color} size="md">
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
          <Calendar className="w-3.5 h-3.5" /> Placed on {formatDate(order.createdAt, true)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onOpenInvoice}
          className="flex items-center gap-2 border-brand-300 text-brand-700 hover:bg-brand-50"
        >
          <FileText className="w-4 h-4 text-brand-600" />
          View Tax Invoice
        </Button>
      </div>
    </div>
  );
}
