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
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  Phone,
  Briefcase,
  Sparkles,
  User,
  Truck,
  Percent,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ArrowLeft,
  Coins,
  Globe2,
} from "lucide-react";
import PublicFooter from "../../../layouts/public/PublicFooter.jsx";

export function RegisterBusinessPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [step, setStep] = useState(1); // Step 1: Company Details & Address, Step 2: Admin User Credentials
  const [loading, setLoading] = useState(false);
  const [countriesList, setCountriesList] = useState(SUPPORTED_COUNTRIES);

  // Form State for Commercial B2B Registration
  const [formData, setFormData] = useState({
    // Step 1: Company & Address Details
    businessName: "",
    legalName: "",
    registrationNumber: "",
    taxId: "",
    countryCode: country?.code || "IN",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",

    // Step 2: Admin User Credentials
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
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
        // Keep default fallback list
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

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.legalName || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      addToast({
        title: "Required Fields Missing",
        message: "Please fill in all required company and address details before proceeding.",
        type: "error",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyPayload = {
        businessName: formData.businessName || formData.legalName,
        legalName: formData.legalName || formData.businessName,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        countryCode: formData.countryCode || country.code || "IN",
        address: {
          line1: formData.addressLine1 || "Business Address",
          line2: formData.addressLine2 || "",
          city: formData.city || "City",
          state: formData.state || "State",
          postalCode: formData.postalCode || "000000",
          phone: formData.phone || "",
        },
        adminUser: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
      };

      await Api.b2b.registerCompany(companyPayload);

      addToast({
        title: "Application Submitted Successfully!",
        message: `${formData.businessName || formData.legalName} has been submitted for B2B validation.`,
        type: "success",
      });

      navigate(ROUTES.REGISTER_BUSINESS_SUCCESS, {
        state: {
          businessName: formData.businessName || formData.legalName,
          legalName: formData.legalName || formData.businessName,
          adminEmail: formData.email,
        },
      });
    } catch (err) {
      addToast({
        title: "Business Registration Failed",
        message: err.message || "Failed to register company. Please check your credentials.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen bg-[#F8FAF9] text-[#1E2922] flex flex-col justify-between overflow-x-hidden lg:overflow-hidden font-sans">
      <SEO
        title="Vanom Wholesale & Commercial Registration | Enterprise Portal"
        description="Register your business entity on Vanom. Unlock pallet wholesale pricing, Net-30 credit lines, and container logistics."
      />

      {/* ─── Compact Top Header ─── */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 border-b border-[#E2EAE5] bg-[#F7F2DF] backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Vanom"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="text-[7px] font-black tracking-wider uppercase bg-[#E6F4EA] text-[#00875A] px-2.5 py-0.5 rounded-full border border-[#00875A]/20">
            Wholesale
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-1 text-[#5E7D67] hover:text-[#0F2B1C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
          <span className="text-[#DCE8DF]">|</span>
          <Link
            to={ROUTES.LOGIN}
            className="px-3 py-1.5 rounded-lg border border-[#DCE8DF] hover:border-[#00875A] text-[#0F2B1C] hover:text-[#00875A] bg-white transition-all text-xs font-bold"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ─── Fixed-Height Split View Main Body ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center overflow-hidden">

        {/* Left Col: Vanom Brand, Key Value Props & Guarantees (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 lg:pr-4">

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2B1C] tracking-tight leading-tight">
              Register Your Business on <span className="text-[#00875A]">Vanom</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5E7D67] leading-relaxed">
              Get direct distributor access to certified organic foods, essential commodities, pallet shipping, and commercial GST invoices.
            </p>
          </div>

          {/* 3 Core Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#00875A] flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F2B1C]">Pallet & Tier Discounts</h4>
                <p className="text-[11px] text-[#5E7D67]">Locked wholesale pricing with bulk MOQs</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7DD] text-[#B87A00] flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F2B1C]">Net-30 / 60 Credit Terms</h4>
                <p className="text-[11px] text-[#5E7D67]">Working capital lines after GST check</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#00875A] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F2B1C]">Bulk Container Freight</h4>
                <p className="text-[11px] text-[#5E7D67]">Door-to-door logistics & dispatch</p>
              </div>
            </div>
          </div>

          {/* Compliance strip */}
          <div className="flex items-center justify-between text-[11px] text-[#5E7D67] pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#00875A]" />
              <span>ISO 9001 Verified Quality</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <LockKeyhole className="w-4 h-4 text-[#00875A]" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Right Col: 2-Step Registration Form Card (7 Cols) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center">
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#DCE8DF] shadow-xl shadow-emerald-950/[0.04] relative">

            {/* 2-Step Stepper Header */}
            <div className="flex items-center justify-between border-b border-[#E8EDE9] pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00875A]">
                  Step {step} of 2
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#0F2B1C]">
                  {step === 1 ? "Company & Address Details" : "Company Administrator Login"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${step === 1
                    ? "bg-[#00875A] text-white shadow-xs"
                    : "bg-[#E6F4EA] text-[#00875A] hover:bg-[#D5EFE0]"
                    }`}
                >
                  1
                </button>
                <div className="w-4 h-0.5 bg-[#DCE8DF]" />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.businessName && formData.legalName && formData.addressLine1 && formData.city) {
                      setStep(2);
                    }
                  }}
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${step === 2
                    ? "bg-[#00875A] text-white shadow-xs"
                    : "bg-[#F0F4F2] text-[#8B9E91]"
                    }`}
                >
                  2
                </button>
              </div>
            </div>

            {/* FORM BODY */}
            <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-3.5">

              {/* STEP 1: Company Entity & Address */}
              {step === 1 && (
                <div className="space-y-3 animate-in fade-in-50 duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        Business / Brand Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Pure Organics"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        Registered Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleChange}
                        placeholder="e.g. Pure Organics Foods Pvt Ltd"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        Country of Operation / Registry <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Globe2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                        <select
                          required
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all cursor-pointer font-medium"
                        >
                          {countriesList.map((c) => (
                            <option key={c.code || c.id} value={c.code}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">GSTIN / VAT / Tax ID</label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        placeholder="e.g. 27AAACA1234A1Z1"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#0F2B1C]">CIN / Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. U01100DL2024PTC123456"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all uppercase"
                    />
                  </div>

                  {/* Address Section */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#0F2B1C]">
                      Principal Business Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="Plot, Street, Building, Industrial Estate"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">City <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">State <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">Postal Code <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="400001"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#00875A]/20 transition-all cursor-pointer mt-2"
                  >
                    <span>Proceed to Admin Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Company Admin User Credentials */}
              {step === 2 && (
                <div className="space-y-3 animate-in fade-in-50 duration-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Vikram"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Mehta"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#0F2B1C]">
                      Work / Corporate Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                      <input
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="procurement@pureorganics.com"
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">Work Phone / Mobile</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F2B1C]">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E7D67]" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min 8 chars"
                          className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAF9] border border-[#DCE8DF] rounded-xl text-[#0F2B1C] placeholder:text-[#8B9E91] focus:bg-white focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3 px-4 rounded-xl border border-[#DCE8DF] hover:bg-[#F8FAF9] text-[#0F2B1C] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-5 rounded-xl bg-[#00875A] hover:bg-[#00744D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#00875A]/20 transition-all cursor-pointer disabled:opacity-70"
                    >
                      {loading ? (
                        <span>Creating Business Account...</span>
                      ) : (
                        <>
                          <span>Complete Business Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Switch Links */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8EDE9] text-xs text-[#5E7D67]">
                <p>
                  Need personal shopping?{" "}
                  <Link to={ROUTES.REGISTER} className="text-[#00875A] font-bold hover:underline">
                    Retail Account
                  </Link>
                </p>
                <p>
                  Existing user?{" "}
                  <Link to={ROUTES.LOGIN} className="text-[#00875A] font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>

            </form>

          </div>
        </div>

      </main>

      {/* ─── Compact Minimal Footer Bar ─── */}
      <PublicFooter />
    </div>
  );
}

export default RegisterBusinessPage;

