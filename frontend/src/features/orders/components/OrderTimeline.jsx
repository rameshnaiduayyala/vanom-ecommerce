import React from "react";
import { Truck, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../../utils/formatters.js";

export function OrderTimeline({ order, statusConfig }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-50/70 via-white to-surface border border-brand-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-600" />
          Fulfillment & Delivery Status
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-brand-200 text-brand-800">
          Status: {statusConfig.label}
        </span>
      </div>

      <div className="relative border-l-2 border-brand-300 ml-4 space-y-6 py-2">
        {order.timeline && order.timeline.length > 0 ? (
          order.timeline.map((step, index) => (
            <div key={index} className="relative pl-6">
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white ring-2 ring-brand-100 flex items-center justify-center text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <h5 className="text-xs font-bold text-text-primary">{step.label}</h5>
              <p className="text-[11px] text-text-muted">{step.date}</p>
              {step.reason && (
                <p className="text-[11px] text-text-secondary mt-0.5 italic">{step.reason}</p>
              )}
            </div>
          ))
        ) : (
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-white">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <h5 className="text-xs font-bold text-text-primary">Order Confirmed</h5>
            <p className="text-[11px] text-text-muted">{formatDate(order.createdAt, true)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
