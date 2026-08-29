import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "../../../components/ui/Toast.jsx";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Reset Link Sent", `Password reset instructions sent to ${email}`);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] bg-[#ededed] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.HOME} className="inline-block">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-12 w-auto object-contain mx-auto mb-1 hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We've sent a recovery link to <strong className="text-slate-800">{email}</strong>. Follow the instructions to reset your account password.
              </p>
              <Link to={ROUTES.LOGIN} className="block pt-2">
                <button className="w-full py-2.5 rounded-xl bg-[#003876] text-white text-xs font-bold hover:bg-[#00285a] transition-colors cursor-pointer">
                  Back to Sign In
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="pt-2 text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#003876] hover:underline"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Assurances */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Protection
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
