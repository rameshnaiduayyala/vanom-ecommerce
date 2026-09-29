import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { ROUTES } from "../../../constants/routes.js";
import { Button } from "../../../components/ui/Button.jsx";
import {
  Clock,
  ShieldX,
  ShieldAlert,
  Building2,
  LogOut,
  Mail,
  Phone,
  Store,
  FileText,
  AlertCircle,
} from "lucide-react";
import vanomLogo from "../../../assets/logo.png";

export function B2BStatusGate({ status }) {
  const navigate = useNavigate();
  const { user, activeCompany, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const companyName =
    activeCompany?.businessName ||
    activeCompany?.legalName ||
    user?.bulkBusiness?.businessName ||
    "Your Wholesale Business";

  const companyEmail =
    activeCompany?.businessEmail ||
    user?.bulkBusiness?.businessEmail ||
    user?.email;

  const companyPhone =
    activeCompany?.businessPhone ||
    user?.bulkBusiness?.businessPhone;

  const taxId =
    activeCompany?.taxRegistrationNumber ||
    activeCompany?.taxId ||
    user?.bulkBusiness?.taxRegistrationNumber;

  const regNo =
    activeCompany?.registrationNumber ||
    user?.bulkBusiness?.registrationNumber;

  const rejectionReason =
    activeCompany?.rejectionReason ||
    user?.bulkBusiness?.rejectionReason ||
    "Documentation or eligibility criteria did not meet compliance guidelines. Please contact support or update your application details.";

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* ── Top Header Bar ── */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-slate-200/80 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={vanomLogo}
            alt="Vanom"
            className="h-7 w-auto object-contain"
          />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Wholesale B2B
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Retail Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/70 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Status Card ── */}
      <main className="w-full max-w-xl flex-1 flex items-center justify-center my-4">
        {/* ============================================================
            PENDING STATE
            ============================================================ */}
        {status === "PENDING" && (
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-8 ring-amber-50/60">
              <Clock className="w-10 h-10" />
            </div>

            {/* Heading */}
            <div className="mt-6 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Under Review
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Wholesale Application Pending
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your B2B account registration is currently being verified by our compliance and operations team. Wholesale catalog and volume tiers will unlock once approved.
              </p>
            </div>

            {/* Company Dossier */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Business Application Dossier
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                  Pending Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Business Name</span>
                  <span className="font-bold text-slate-900">{companyName}</span>
                </div>

                {companyEmail && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Business Email</span>
                    <span className="font-semibold text-slate-700">{companyEmail}</span>
                  </div>
                )}

                {taxId && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tax ID / GSTIN / EIN</span>
                    <span className="font-mono font-semibold text-slate-800">{taxId}</span>
                  </div>
                )}

                {regNo && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reg Number</span>
                    <span className="font-mono font-semibold text-slate-800">{regNo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                to={ROUTES.CONTACT}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact B2B Support
              </Link>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            REJECTED STATE
            ============================================================ */}
        {status === "REJECTED" && (
          <div className="w-full bg-white rounded-3xl border border-red-200 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center shadow-lg shadow-red-500/10 ring-8 ring-red-50/60">
              <ShieldX className="w-10 h-10" />
            </div>

            {/* Heading */}
            <div className="mt-6 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <ShieldX className="w-3.5 h-3.5" /> Application Rejected
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Wholesale Application Not Approved
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Unfortunately, your wholesale business application could not be verified by our compliance team at this time.
              </p>
            </div>

            {/* Rejection Reason Card */}
            <div className="mt-6 p-5 rounded-2xl bg-red-50/70 border border-red-200 text-left space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                  Compliance Rejection Reason
                </span>
              </div>
              <p className="text-xs text-red-950 font-medium leading-relaxed bg-white/60 p-3 rounded-xl border border-red-200/60">
                {rejectionReason}
              </p>
            </div>

            {/* Company Summary */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Registered Business</p>
              <p className="font-bold text-slate-900">{companyName}</p>
              {taxId && <p className="text-slate-600 font-mono text-[11px]">Tax ID: {taxId}</p>}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                to={ROUTES.CONTACT}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Submit Appeal / Contact Support
              </Link>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            SUSPENDED STATE
            ============================================================ */}
        {status === "SUSPENDED" && (
          <div className="w-full bg-white rounded-3xl border border-amber-300 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-8 ring-amber-50/60">
              <ShieldAlert className="w-10 h-10" />
            </div>

            {/* Heading */}
            <div className="mt-6 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Account Suspended
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Wholesale Account Suspended
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your wholesale purchasing and ordering privileges have been temporarily suspended. Please review your account or contact our compliance team.
              </p>
            </div>

            {/* Company Summary */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Business Profile</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Status: Suspended
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{companyName}</p>
                {companyEmail && <p className="text-slate-600">Email: {companyEmail}</p>}
                {taxId && <p className="text-slate-600 font-mono text-[11px]">Tax ID: {taxId}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                to={ROUTES.CONTACT}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Account Manager
              </Link>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            FALLBACK / UNKNOWN STATE
            ============================================================ */}
        {status !== "PENDING" && status !== "REJECTED" && status !== "SUSPENDED" && (
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Wholesale Verification Required</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Please complete company registration or contact support to activate wholesale access.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to={ROUTES.REGISTER_BUSINESS}>
                <Button variant="primary" size="sm" className="font-bold">
                  Register Business
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-4xl text-center text-xs text-slate-400 py-4 border-t border-slate-200/80">
        Vanom Wholesale Portal • Need immediate assistance? Call <span className="font-semibold text-slate-600">+1 (800) 555-0199</span> or email <span className="font-semibold text-slate-600">b2b-support@vanom.com</span>
      </footer>
    </div>
  );
}
