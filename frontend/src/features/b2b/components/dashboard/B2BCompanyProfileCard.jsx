import React from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/Alert.jsx";
import { ROUTES } from "@/constants/routes.js";

/**
 * Reusable company profile & compliance summary card for the B2B dashboard.
 */
export function B2BCompanyProfileCard({ business, user, isLoading = false }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Company Profile & Compliance
          </h3>
        </div>
        <Link
          to={ROUTES.B2B.COMPANY_PROFILE}
          className="text-xs text-emerald-700 font-semibold hover:underline"
        >
          Manage
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Legal Business Name
            </span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {business?.businessName || business?.legalName || "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Tax / GST / VAT ID
              </span>
              <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                {business?.taxRegistrationNumber || "Not provided"}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Reg. Number
              </span>
              <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                {business?.registrationNumber || "Not provided"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Procurement Email & Phone
            </span>
            <p className="text-slate-700 mt-0.5 font-mono text-[11px] truncate">
              {business?.businessEmail || user?.email || "—"}
            </p>
            {business?.businessPhone && (
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                {business.businessPhone}
              </p>
            )}
          </div>

          {business?.address && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Registered Headquarters
              </span>
              <p className="text-slate-700 text-xs mt-0.5 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{business.address}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
