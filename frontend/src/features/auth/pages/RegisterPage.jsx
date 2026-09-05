import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [customerType, setCustomerType] = useState("B2C");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.register({
        ...formData,
        customerType,
      });

      login(data.user, data.tokens);
      addToast({
        title: "Account Created!",
        message: `Welcome to Vanom, ${data.user.firstName}!`,
        type: "success",
      });

      if (customerType === "B2B") {
        navigate(ROUTES.B2B.COMPANY_PROFILE);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      addToast({
        title: "Registration Failed",
        message: err.message || "Failed to create account",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.HOME} className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/logo.png"
              alt="Vanom"
              className="h-10 sm:h-12 w-auto object-contain mx-auto mb-1"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B1C] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-[#5E7D67]">
            Select your account profile to get started with global ordering
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCustomerType("B2C")}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
              customerType === "B2C"
                ? "border-[#00875A] bg-[#E6F4EA] shadow-xs"
                : "border-[#DCE8DF] bg-white hover:bg-[#F8FAF9]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2B1C]">
              <User className="w-4 h-4 text-[#00875A]" />
              <span>Retail Buyer</span>
            </div>
            <span className="text-[10px] text-[#5E7D67]">Individual checkout & tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomerType("B2B")}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
              customerType === "B2B"
                ? "border-[#00875A] bg-[#E6F4EA] shadow-xs"
                : "border-[#DCE8DF] bg-white hover:bg-[#F8FAF9]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2B1C]">
              <Building2 className="w-4 h-4 text-[#00875A]" />
              <span>Commercial Client</span>
            </div>
            <span className="text-[10px] text-[#5E7D67]">Pallets, credit terms & quotes</span>
          </button>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 mt-3"
          >
            {loading ? (
              <span>Registering...</span>
            ) : (
              <>
                <span>Create {customerType === "B2B" ? "Commercial" : "Retail"} Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-3 border-t border-[#E8EDE9]">
            <p className="text-xs text-[#5E7D67]">
              Already have an account?{" "}
              <Link to={ROUTES.LOGIN} className="text-[#00875A] font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </form>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-[#5E7D67]">
          <div className="flex items-center gap-1.5">
            <LockKeyhole className="w-3.5 h-3.5 text-[#00875A]" />
            <span>256-Bit SSL Encryption</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
            <span>Data Privacy Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
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

        {submitted ? (
          <div className="p-4 rounded-2xl bg-[#E6F4EA] border border-emerald-200 text-xs text-[#00875A] font-semibold space-y-1">
            <p>Password recovery instructions dispatched to:</p>
            <strong className="text-[#0F2B1C] block font-mono text-sm">{email}</strong>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4 text-left"
          >
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
              className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm shadow-md shadow-[#00875A]/20 transition-all cursor-pointer"
            >
              Send Reset Instructions
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

export default RegisterPage;
