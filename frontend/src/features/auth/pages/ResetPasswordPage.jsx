import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";
import { SEO } from "@/components/common/SEO.jsx";
import { useResetPasswordForm } from "../hooks/useResetPasswordForm.js";

export function ResetPasswordPage() {
  const {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    errorMessage,
    success,
    handleSubmit,
  } = useResetPasswordForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const hasValidTokenParam = Boolean(token && token.length >= 20);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <SEO
        title="Set New Password | Vanom"
        description="Choose a new password for your Vanom account."
        noindex={true}
      />
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] space-y-5 text-center shadow-xl shadow-emerald-950/[0.04]">
        <div className="w-14 h-14 rounded-full bg-[#E6F4EA] text-[#00875A] flex items-center justify-center mx-auto">
          {success ? <CheckCircle2 className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#0F2B1C]">
            {success ? "Password Reset Complete" : "Create New Password"}
          </h2>
          <p className="text-xs text-[#5E7D67]">
            {success
              ? "Your Vanom account password has been updated successfully."
              : "Enter a strong new password (at least 8 characters) for your account."}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-emerald-200 text-xs text-[#00875A] font-semibold">
              You can now sign in using your new password.
            </div>
            <Link
              to={ROUTES.LOGIN}
              className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm shadow-md shadow-[#00875A]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : !hasValidTokenParam ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
              This password reset link is missing a valid token or has expired.
            </div>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm shadow-md shadow-[#00875A]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Request a New Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E7D67] hover:text-[#0F2B1C]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E7D67] hover:text-[#0F2B1C]"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm shadow-md shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <span>Updating Password...</span> : <span>Reset Password</span>}
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

export default ResetPasswordPage;
