import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { SEO } from "../../../components/common/SEO.jsx";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  MailCheck,
  ShieldAlert,
  Building2,
  Sparkles,
} from "lucide-react";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided in the link.");
      return;
    }

    if (requestedRef.current) return;
    requestedRef.current = true;

    async function verify() {
      try {
        await Api.auth.verifyEmail(token);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err?.message ||
            err?.response?.data?.message ||
            "The verification token is invalid, expired, or has already been used."
        );
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SEO
        title="Verify Email | Vanom"
        description="Verify your email address to activate your Vanom account."
      />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Top Decorative Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="py-8 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Verifying Your Email</h1>
              <p className="text-sm text-slate-500">
                Please wait while we validate your activation token with our security servers...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5" /> Email Verified
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Account Activated!</h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your email address has been verified successfully. Your account is now active and ready to use.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to={ROUTES.LOGIN}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition duration-200"
              >
                Continue to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={ROUTES.HOME}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/10 ring-8 ring-red-50">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
                Verification Failed
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Unable to Verify Email</h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to={ROUTES.LOGIN}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition duration-200"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={ROUTES.CONTACT}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                Contact Customer Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
