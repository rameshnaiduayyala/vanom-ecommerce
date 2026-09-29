import React from "react";
import { Clock, ShieldX, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button.jsx";
import { ROUTES } from "../../../constants/routes.js";

/**
 * Shared status card shown when a B2B business account is not yet APPROVED.
 * Handles: PENDING, REJECTED, SUSPENDED, and unknown/missing states.
 * Returns null for APPROVED so the caller renders the real dashboard.
 *
 * @param {{ status: string|undefined, activeCompany: object, user: object }} props
 */
export function B2BStatusCard({ status, activeCompany, user }) {
  // APPROVED — caller renders the dashboard
  if (status === "APPROVED") return null;

  const companyName = activeCompany?.legalName || activeCompany?.businessName || "Your Company";
  const taxId = activeCompany?.taxId || activeCompany?.taxRegistrationNumber;

  const CompanyBlock = () => (
    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
      <p className="text-xs text-slate-500">Company</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{companyName}</p>
      {taxId && (
        <p className="mt-1 text-xs font-mono text-slate-500">Tax ID: {taxId}</p>
      )}
    </div>
  );

  const Wrapper = ({ borderColor = "border-slate-200", children }) => (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm p-8 text-center`}>
          {children}
        </div>
      </div>
    </div>
  );

  if (status === "PENDING") {
    return (
      <Wrapper>
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="mt-5 text-xl font-black text-slate-900">Company Verification Pending</h1>
        <p className="mt-3 text-sm text-slate-500 leading-6">
          Your business account is currently under review. Our compliance team is
          verifying your company registration and tax information.
        </p>
        <CompanyBlock />
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
          <Clock className="w-4 h-4" />
          Pending Admin Approval
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Logged in as{" "}
          <span className="font-semibold text-slate-600">
            {user?.firstName || "Wholesale Buyer"}
          </span>
        </p>
      </Wrapper>
    );
  }

  if (status === "REJECTED") {
    return (
      <Wrapper borderColor="border-red-200">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="mt-5 text-xl font-black text-slate-900">Company Verification Rejected</h1>
        <p className="mt-3 text-sm text-slate-500 leading-6">
          Your business registration request could not be approved. Please review
          the rejection reason and update your company information.
        </p>
        <CompanyBlock />
        {activeCompany?.rejectionReason && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
            <div className="flex items-center gap-2">
              <ShieldX className="w-4 h-4 text-red-600" />
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                Rejection Reason
              </p>
            </div>
            <p className="mt-2 text-sm text-red-900 leading-6">
              {activeCompany.rejectionReason}
            </p>
          </div>
        )}
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold">
          <ShieldX className="w-4 h-4" />
          Verification Rejected
        </div>
        <div className="mt-6 flex justify-center">
          <Link to={ROUTES.B2B.COMPANY}>
            <Button variant="primary" size="sm" className="font-bold">
              Update Company Information
            </Button>
          </Link>
        </div>
      </Wrapper>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <Wrapper borderColor="border-yellow-200">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="mt-5 text-xl font-black text-slate-900">Your Account Has Been Suspended</h1>
        <p className="mt-3 text-sm text-slate-500 leading-6">
          Your business account has been suspended. Please review the suspension reason
          and contact support if you have any questions.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold">
          <ShieldX className="w-4 h-4" />
          Suspended
        </div>
      </Wrapper>
    );
  }

  // Unknown / missing status fallback
  return (
    <Wrapper>
      <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-slate-500" />
      </div>
      <h1 className="mt-5 text-xl font-black text-slate-900">Company Status Unavailable</h1>
      <p className="mt-3 text-sm text-slate-500 leading-6">
        We couldn't determine your company verification status. Please refresh the page
        or contact support.
      </p>
    </Wrapper>
  );
}
