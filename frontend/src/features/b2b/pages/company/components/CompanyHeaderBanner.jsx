import React from "react";
import { ShieldCheck, Edit3, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function CompanyHeaderBanner({ company, onEditClick }) {
  const isApproved = company?.status === "APPROVED";
  const isLocked = Boolean(company?.isLocked);
  const businessName =
    company?.businessName ||
    company?.legalName ||
    "Wholesale Business Account";

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#003D2B] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
          {isApproved ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Corporate Entity</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{company?.status || "Pending Verification"}</span>
            </>
          )}
          {isLocked && (
            <>
              <span className="text-emerald-400/50">•</span>
              <span className="text-emerald-200">Profile Locked</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <span>{businessName}</span>
          {isLocked && <Lock className="w-5 h-5 text-emerald-400/80" title="Profile verified & locked" />}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {isLocked
            ? "Your commercial entity credentials, GSTIN/tax identification, and credit facilities have been officially verified and locked for audit compliance."
            : "Manage your commercial entity credentials, credit terms, logistics addresses, and authorized procurement contacts."}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isLocked ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 font-bold text-xs shadow-inner select-none cursor-not-allowed">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Profile Verified & Locked</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            icon={Edit3}
            onClick={onEditClick}
            className="font-bold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-2.5 px-5 cursor-pointer"
          >
            Edit Business Info
          </Button>
        )}
      </div>
    </div>
  );
}

export default CompanyHeaderBanner;
