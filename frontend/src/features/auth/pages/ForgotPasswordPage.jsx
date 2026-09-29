import React from "react";
import { Link } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { SEO } from "@/components/common/SEO.jsx";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm.js";

export function ForgotPasswordPage() {
  const { email, setEmail, submitted, loading, errorMessage, handleSubmit } =
    useForgotPasswordForm();

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <SEO
        title="Reset Password | Vanom"
        description="Reset your Vanom account password securely."
        noindex={true}
      />
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] space-y-5 text-center shadow-xl shadow-emerald-950/[0.04]">
        <div className="w-14 h-14 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#0F2B1C]">Reset Password</h2>
          <p className="text-xs text-[#5E7D67]">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-emerald-200 text-xs text-[#00875A] font-semibold space-y-1">
            <p>Password recovery instructions dispatched to:</p>
            <strong className="text-[#0F2B1C] block font-mono text-sm">{email}</strong>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm shadow-md shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Instructions</span>}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <Link
          to={ROUTES.LOGIN}
          className="inline-block text-xs font-bold text-[#00875A] hover:underline pt-2"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
