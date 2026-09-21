import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

export function AdminQuotesPage() {
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: () => Api.admin.getAdminQuotes(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">B2B Quote Negotiation Desk</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Quote #</th>
              <th className="p-4">Company</th>
              <th className="p-4">Version</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q, idx) => (
              <tr key={q.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-mono font-bold">{q.quoteNumber || `QTE-${q.id}`}</td>
                <td className="p-4 font-semibold">{q.company?.legalName || q.companyName || "AgroWholesale India"}</td>
                <td className="p-4 font-mono">v{q.version || 1}</td>
                <td className="p-4 font-bold text-emerald-800">
                  {formatPrice(q.totalAmount || 218490, q.currency?.code || "USD")}
                </td>
                <td className="p-4">
                  <Badge variant={q.status === "APPROVED" ? "green" : "yellow"} size="sm">
                    {q.status || "Quoted"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="secondary" size="sm">Review Terms</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminQuotesPage;
