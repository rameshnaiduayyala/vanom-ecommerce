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

  const companies = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">B2B Business Applications</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Country</th>
              <th className="p-4">Tax ID / GST</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {companies.map((comp) => (
              <tr key={comp.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-bold text-text-primary">{comp.legalName}</td>
                <td className="p-4">{comp.country} ({comp.countryCode})</td>
                <td className="p-4 font-mono text-text-secondary">{comp.taxId}</td>
                <td className="p-4">
                  <Badge variant={comp.status === "APPROVED" ? "green" : "yellow"} size="sm">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusinessApplications;
