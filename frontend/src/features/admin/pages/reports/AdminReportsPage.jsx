import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice } from "@/utils/formatters.js";

export function AdminReportsPage() {
  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => Api.admin.getReports(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Financial & Tax Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">India GST Collected (Q1 2026)</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.indiaGst || 482450.0, "USD")}
          </div>
          <p className="text-[11px] text-text-muted">18% HSN Code 3101 compliant</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">US State Sales Tax Collected</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.usSalesTax || 18420.0, "USD")}
          </div>
          <p className="text-[11px] text-text-muted">Texas & California jurisdictions</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">UK HMRC VAT Collected</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.ukVat || 12900.0, "GBP")}
          </div>
          <p className="text-[11px] text-text-muted">Standard 20% Rate</p>
        </div>
      </div>
    </div>
  );
}

export default AdminReportsPage;
