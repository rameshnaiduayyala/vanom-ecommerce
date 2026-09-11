import React from "react";
import { User, CreditCard, ShieldCheck } from "lucide-react";

export function OrderMetaCards({ user, payments, status }) {
  const payment = payments?.[0];
  const isPaid = payment?.status === "PAID" || status === "PAID" || status === "CONFIRMED";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Customer Info */}
      <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <User className="w-4 h-4 text-brand-600" />
          Customer Details
        </h4>
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary text-sm">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-text-muted">{user?.email || "Account Customer"}</p>
          {user?.phone && <p className="text-text-muted">{user.phone}</p>}
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-brand-600" />
          Payment Method
        </h4>
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary text-sm">
            {payment?.provider || "Standard Payment Gateway"}
          </p>
          <p className="text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Status: {payment?.status || (isPaid ? "PAID / VERIFIED" : "PENDING")}
          </p>
        </div>
      </div>
    </div>
  );
}
