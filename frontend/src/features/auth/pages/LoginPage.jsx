import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { Building2, ShieldCheck, User, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.login({ email, password });
      login(data.user, data.tokens);
      addToast({
        title: "Welcome Back",
        message: `Logged in as ${data.user.firstName || data.user.email}`,
        type: "success",
      });

      if (data.user.roles?.includes("ADMIN") || data.user.roles?.includes("SUPER_ADMIN")) {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else if (data.user.customerType === "B2B") {
        navigate(ROUTES.B2B.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      addToast({
        title: "Authentication Failed",
        message: err.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoType) => {
    if (demoType === "ADMIN") {
      setEmail("admin@vanom.com");
      setPassword("AdminPassword123!");
    } else if (demoType === "B2B") {
      setEmail("buyer@agrowholesale.in");
      setPassword("WholesalePass123!");
    } else {
      setEmail("customer@example.com");
      setPassword("CustomerPass123!");
    }
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

          <p className="text-xs sm:text-sm text-slate-600">
            Sign In to Vanom
          </p>
        </div>

        {/* Quick Demo Accounts Switcher */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#003876] uppercase tracking-widest">
              ⚡ Quick Demo Switcher
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Click to auto-fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("B2C")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-[#003876]/40 text-xs font-bold text-slate-800 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <User className="w-4 h-4 text-[#003876]" />
              <span>B2C Retail</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("B2B")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-800 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>B2B Trade</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("ADMIN")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-400 text-xs font-bold text-slate-800 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Admin Desk</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">Password</label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-semibold text-[#003876] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#003876] focus:ring-2 focus:ring-[#003876]/10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">New to Vanom?</span>
            </div>
          </div>

          {/* Register CTA */}
          <Link to={ROUTES.REGISTER}>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl border-2 border-[#003876] text-[#003876] hover:bg-[#003876] hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Create New Account
            </button>
          </Link>
        </form>

        {/* Security Assurances */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> ISO 9001:2015 Verified
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
