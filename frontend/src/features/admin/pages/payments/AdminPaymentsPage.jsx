import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";

export function AdminPaymentsPage() {
  const { data: payments = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => Api.admin.getPayments(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Payment Gateways & Webhooks</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Idempotency Key</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-mono font-bold">{p.transactionId || p.id}</td>
                <td className="p-4 font-semibold text-brand-700">{p.provider || "Direct / Gateway"}</td>
                <td className="p-4 font-bold">{formatPrice(p.amount || 120, "USD")}</td>
                <td className="p-4 font-mono text-text-muted">{p.idempotencyKey || `idem_${idx}`}</td>
                <td className="p-4 text-right">
                  <Badge variant="green" size="sm">{p.status || "CAPTURED"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPaymentsPage;
