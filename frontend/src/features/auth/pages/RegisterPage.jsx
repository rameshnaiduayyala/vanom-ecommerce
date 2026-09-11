import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { SEO } from "../../../components/common/SEO.jsx";
import { SUPPORTED_COUNTRIES } from "../../../constants/countries.js";
import {
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  FileText,
  Phone,
  Briefcase,
  Sparkles,
  Globe2,
} from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [countriesList, setCountriesList] = useState(SUPPORTED_COUNTRIES);

  // Form State for Retail Account
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    countryCode: country?.code || "IN",
  });

  // Fetch countries dynamically from geography API
  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      try {
        const data = await Api.geography.getCountries();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCountriesList(data);
        }
      } catch {
        // Fallback list is already set
      }
    }
    loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        countryCode: formData.countryCode,
        customerType: "B2C",
      });

      const user = data?.user || data?.data?.user || data;
      const tokens = data?.tokens || data?.data?.tokens;

      if (user) {
        login(user, tokens);
      }

      addToast({
        title: "Account Created!",
        message: `Welcome to Vanom, ${formData.firstName || formData.email}!`,
        type: "success",
      });

      navigate(ROUTES.HOME);
    } catch (err) {
      addToast({
        title: "Registration Failed",
        message: err.message || "Failed to create account. Please check your credentials.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8FAF9] px-4 py-12">
      <SEO
        title="Create Retail Customer Account | Vanom"
        description="Create your Vanom customer account for fast checkout, order tracking, and exclusive discounts."
        noindex={true}
      />
      <div className="w-full max-w-md space-y-6">

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
            Sign up for personal shopping, express checkout, and order tracking.
          </p>
        </div>

        {/* Commercial B2B Banner Callout */}
        <Link
          to={ROUTES.REGISTER_BUSINESS}
          className="group block p-4 rounded-2xl bg-gradient-to-r from-[#E6F4EA] to-[#DCF0E2] border border-[#00875A]/20 hover:border-[#00875A]/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#00875A] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F2B1C] flex items-center gap-1.5">
                  Buying for a Business or Store?
                  <span className="text-[10px] bg-[#00875A] text-white px-2 py-0.5 rounded-full font-bold">Wholesale</span>
                </h3>
                <p className="text-[11px] text-[#5E7D67]">
                  Register company for bulk pricing
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#00875A] group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>

        {/* Retail Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F2B1C]">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Country / Region <span className="text-red-500">*</span></label>
            <div className="relative">
              <Globe2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <select
                required
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all cursor-pointer font-medium"
              >
                {countriesList.map((c) => (
                  <option key={c.code || c.id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Mobile Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F2B1C]">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
              <input
                type="password"
                required
                minLength={8}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/15 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Retail Account</span>
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
            <span>Buyer Protection</span>
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
