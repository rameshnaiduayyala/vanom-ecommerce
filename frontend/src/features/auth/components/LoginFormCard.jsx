import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Zap,
  User,
  Building2,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/constants/routes.js";

const QUICK_ACCOUNTS = [
  {
    role: "CUSTOMER",
    name: "Customer",
    email: "customer@vanom.com",
    password: "Customer@123456",
    icon: User,
    badge: "B2C Retail",
    color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200",
  },
  {
    role: "B2B",
    name: "Wholesale Company",
    email: "wholesale@demousawholesale.com",
    password: "Wholesale@123456",
    icon: Building2,
    badge: "B2B Commercial",
    color: "text-purple-700 bg-purple-50 hover:bg-purple-100/70 border-purple-200",
  },
  {
    role: "ADMIN",
    name: "Superadmin Portal",
    email: "admin@vanom.com",
    password: "Admin@123456",
    icon: ShieldCheck,
    badge: "Operations",
    color: "text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200",
  },
];

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
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleSelectAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setShowQuickMenu(false);
  };

  return (
    <div className="relative">
      {/* Outer Glow / Ambient Lighting */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent blur-xl pointer-events-none" />

      <form
        onSubmit={onSubmit}
        className="relative p-6 sm:p-9 rounded-[28px] bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-emerald-950/20 space-y-5"
      >
        {/* Error Message Text Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed font-semibold">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
              Email Address
            </label>

            {/* Quick Demo Selector Button right next to the label */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickMenu((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs transition-all cursor-pointer group"
                title="Fill demo credentials (Customer, Wholesale, Admin)"
              >
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Demo Accounts</span>
              </button>

              {/* Backdrop to close on outside click */}
              {showQuickMenu && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
              )}

              {/* Popover Menu above/below with high z-index */}
              {showQuickMenu && (
                <div className="absolute right-0 top-8 w-68 p-2.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-150 space-y-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1 text-slate-600 font-extrabold">
                      <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Demo Fill
                    </span>
                    <span className="text-[9px] text-slate-400">Select Role</span>
                  </div>

                  {QUICK_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isCurrent = email === acc.email;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all border cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-50/90 border-emerald-300 shadow-2xs"
                            : "border-transparent hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${acc.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-none truncate">
                              {acc.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-1">
                              {acc.email}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#00875A] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {acc.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-tight">
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-bold text-[#00875A] hover:text-emerald-800 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Session */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-[#00875A] focus:ring-[#00875A] cursor-pointer border-slate-300 transition-colors"
          />
          <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
            Remember this device for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/25 hover:shadow-xl hover:shadow-[#00875A]/35 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:pointer-events-none mt-3"
        >
          {loading ? (
            <span className="font-bold">Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Create Account Links */}
        <div className="pt-4 border-t border-slate-100 space-y-1.5 text-center">
          <p className="text-xs text-slate-500 font-medium">
            New customer?{" "}
            <Link
              to={ROUTES.REGISTER}
              className="text-[#00875A] font-bold hover:underline ml-1"
            >
              Create an account
            </Link>
          </p>
          <p className="text-xs text-slate-500 font-medium">
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
    </div>
  );
}

export default LoginFormCard;
