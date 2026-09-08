import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function BusinessApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => Api.admin.getBusinessApplications(),
  });

  const companies = Array.isArray(data) ? data : data?.items || [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">B2B Business Applications</h1>
        <p className="text-xs text-slate-500 mt-0.5">Verification requests from enterprise wholesale buyers.</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden text-xs shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Country</th>
              <th className="p-4">Tax ID / GST</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.length > 0 ? (
              companies.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{comp.legalName || comp.tradeName}</td>
                  <td className="p-4 text-slate-600">{comp.country?.name || comp.country || "Global"} ({comp.country?.code || comp.countryCode || "INT"})</td>
                  <td className="p-4 font-mono text-slate-500">{comp.taxId || comp.gstin || "Pending"}</td>
                  <td className="p-4">
                    <Badge variant={comp.status === "APPROVED" ? "green" : comp.status === "REJECTED" ? "red" : "yellow"} size="sm">
                      {comp.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/companies/${comp.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Review Dossier
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                  No business applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusinessApplications;
