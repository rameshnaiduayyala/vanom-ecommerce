import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

export function LoginFormCard({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  loading,
  errorMessage,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] space-y-4"
    >
      {/* Error Message Text Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#0F2B1C] block">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F2B1C]">
            Password
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-semibold text-[#00875A] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E7D67] hover:text-[#0F2B1C] cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Session */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded text-[#00875A] focus:ring-[#00875A] cursor-pointer border-[#DCE8DF]"
        />
        <label htmlFor="remember" className="text-xs text-[#5E7D67] font-medium cursor-pointer">
          Remember this device for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 mt-2"
      >
        {loading ? (
          <span>Authenticating...</span>
        ) : (
          <>
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Create Account Links */}
      <div className="pt-3 border-t border-[#E8EDE9] space-y-1.5 text-center">
        <p className="text-xs text-[#5E7D67]">
          New customer?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="text-[#00875A] font-bold hover:underline ml-1"
          >
            Create an account
          </Link>
        </p>
        <p className="text-xs text-[#5E7D67]">
          Buying for your business?{" "}
          <Link
            to={ROUTES.REGISTER_BUSINESS}
            className="text-[#00875A] font-bold hover:underline ml-1"
          >
            Register Business Entity
          </Link>
        </p>
      </div>
    </form>
  );
}

export default LoginFormCard;
