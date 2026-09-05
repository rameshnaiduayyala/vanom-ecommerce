import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Building2,
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("CustomerPass123!");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("B2C");
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
        message: err.message || "Invalid credentials. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoType) => {
    setSelectedRole(demoType);
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
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* ─── Header Logo & Welcome ─── */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.HOME} className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-10 sm:h-12 w-auto object-contain mx-auto mb-1"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B1C] tracking-tight">
            Sign In to Vanom
          </h1>
          <p className="text-xs text-[#5E7D67]">
            Access your global retail orders, procurement quotes & enterprise account
          </p>
        </div>

        {/* ─── Quick Role Demo Switcher ─── */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#5E7D67] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00875A]" />
              <span>Quick Demo Role Select</span>
            </span>
            <span className="text-[10px] text-[#00875A] font-semibold">1-Click Auto-Fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("B2C")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedRole === "B2C"
                  ? "border-[#00875A] bg-[#E6F4EA] text-[#00875A] shadow-xs"
                  : "border-[#E8EDE9] bg-[#F8FAF9] text-[#3D5648] hover:bg-white hover:border-[#DCE8DF]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("B2B")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedRole === "B2B"
                  ? "border-[#00875A] bg-[#E6F4EA] text-[#00875A] shadow-xs"
                  : "border-[#E8EDE9] bg-[#F8FAF9] text-[#3D5648] hover:bg-white hover:border-[#DCE8DF]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>B2B Client</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("ADMIN")}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedRole === "ADMIN"
                  ? "border-[#00875A] bg-[#E6F4EA] text-[#00875A] shadow-xs"
                  : "border-[#E8EDE9] bg-[#F8FAF9] text-[#3D5648] hover:bg-white hover:border-[#DCE8DF]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Desk</span>
            </button>
          </div>
        </div>

        {/* ─── Main Login Form Card ─── */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] space-y-4"
        >
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
              defaultChecked
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

          {/* Create Account Link */}
          <div className="text-center pt-3 border-t border-[#E8EDE9]">
            <p className="text-xs text-[#5E7D67]">
              New to Vanom?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="text-[#00875A] font-bold hover:underline ml-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>

        {/* ─── Security & Compliance Badges ─── */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-[#5E7D67] pt-2">
          <div className="flex items-center gap-1.5">
            <LockKeyhole className="w-3.5 h-3.5 text-[#00875A]" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
            <span>ISO 9001 Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
