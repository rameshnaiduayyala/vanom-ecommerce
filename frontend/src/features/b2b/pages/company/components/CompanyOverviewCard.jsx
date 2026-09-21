import React from "react";
import { Building2, CheckCircle2, Globe, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge.jsx";

export function CompanyOverviewCard({ company }) {
  const legalName = company?.legalName || company?.businessName || "Not specified";
  const tradingName = company?.tradingName || company?.businessName || "Not specified";
  const taxId = company?.taxRegistrationNumber || company?.taxId || null;
  const cin = company?.registrationNumber || null;
  const country = company?.countryCode || company?.country?.name || company?.country || "Not specified";
  const isVerified = company?.status === "APPROVED";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#358B5B]" />
          <span>Entity Registration & Compliance Identifiers</span>
        </h3>
        {isVerified ? (
          <Badge variant="green" size="sm" className="gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>KYC Verified</span>
          </Badge>
        ) : (
          <Badge variant="yellow" size="sm" className="gap-1 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{company?.status || "In Review"}</span>
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Legal Business Name
          </span>
          <p className="text-sm font-bold text-slate-900 leading-snug">{legalName}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Trading / Brand Name
          </span>
          <p className="text-sm font-bold text-slate-900 leading-snug">{tradingName}</p>
        </div>

        <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Tax Registration / GSTIN
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {taxId ? (
              <>
                <span className="font-mono font-bold text-emerald-800 text-sm">{taxId}</span>
                {isVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                    Verified
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-400 italic">Not provided</span>
            )}
          </div>
        </div>

        <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Registration Number (CIN / Business ID)
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {cin ? (
              <span className="font-mono font-bold text-slate-800 text-sm">{cin}</span>
            ) : (
              <span className="text-slate-400 italic">Not provided</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Country Jurisdiction
          </span>
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{country}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Account Registration Date
          </span>
          <p className="font-semibold text-slate-800">
            {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : "Active B2B Account"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompanyOverviewCard;
