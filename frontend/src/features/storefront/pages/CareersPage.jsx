import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../../components/common/SEO.jsx";
import { toast } from "../../../components/ui/Toast.jsx";
import { ROUTES } from "../../../constants/routes.js";
import {
  Briefcase,
  Sparkles,
  Heart,
  Globe,
  Leaf,
  Users,
  CheckCircle2,
  Send,
  Coffee,
  ShieldCheck,
  TrendingUp,
  Mail,
  ArrowRight,
} from "lucide-react";

export function CareersPage() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    linkedIn: "",
    department: "Engineering",
    note: "",
  });

  const departments = [
    { id: "all", label: "All Departments" },
    { id: "engineering", label: "Engineering & Tech" },
    { id: "operations", label: "Supply Chain & Ops" },
    { id: "marketing", label: "Growth & Marketing" },
    { id: "product", label: "Product & Design" },
    { id: "support", label: "Customer Experience" },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Comprehensive Wellness",
      desc: "Top-tier health, dental, and vision coverage, plus mental health resources and wellness stipends.",
    },
    {
      icon: Globe,
      title: "Remote-First Flexibility",
      desc: "Work from wherever you thrive across North America (USA & Canada) with flexible working hours.",
    },
    {
      icon: Leaf,
      title: "Vanom Product Allowance",
      desc: "Monthly generous credit to experience and enjoy our entire certified organic wellness catalog.",
    },
    {
      icon: TrendingUp,
      title: "Growth & Learning Budget",
      desc: "Annual personal development stipends for conferences, courses, books, and skill growth.",
    },
  ];

  const values = [
    {
      title: "Radical Quality & Sourcing",
      desc: "We never compromise on purity or ethics. Every item we source has a verified story of sustainable stewardship.",
    },
    {
      title: "High Agency & Autonomy",
      desc: "We trust our people. You will own your work, experiment fearlessly, and make a direct impact on day one.",
    },
    {
      title: "Customer & Planet Centric",
      desc: "Our north star is genuine care for the customer's well-being and responsible environmental footprint.",
    },
    {
      title: "Inclusive & Empathetic",
      desc: "Diverse backgrounds, creative viewpoints, and kind collaboration are at the heart of how we build.",
    },
  ];

  const handleTalentSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setSubmitted(true);
    toast.success(
      "Profile Received!",
      "Thank you for your interest in Vanom. We have added your profile to our talent pool and will reach out when a relevant position opens."
    );
    setFormData({
      fullName: "",
      email: "",
      linkedIn: "",
      department: "Engineering",
      note: "",
    });
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <>
      <SEO
        title="Careers at Vanom | Join Our Team"
        description="Explore career opportunities at Vanom. Join our remote-first team building the future of certified organic lifestyle, ethical commerce, and clean living across North America."
        canonicalUrl="/careers"
      />

      <div className="bg-[#FAFDFB] min-h-screen">
        {/* ── Breadcrumb ── */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
            <Link to={ROUTES.HOME} className="hover:text-[#006B3C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Careers</span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-[#003D2B] text-white py-16 sm:py-24">
          {/* Subtle Background Glow & Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A3E635_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006B3C]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#F9BC15]" />
              Careers at Vanom
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Build the Future of{" "}
              <span className="text-[#F9BC15]">Conscious Living</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              We are on a mission to make certified organic, ethically sourced foods and clean
              lifestyle essentials effortless and accessible across the US & Canada.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                🌱 100% Organic & Ethical Mission
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                🇺🇸 🇨🇦 US & Canada Operations
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                💻 Remote-Friendly Culture
              </span>
            </div>
          </div>
        </section>

        {/* ── Open Positions Section (Present: No Openings) ── */}
        <section className="py-14 sm:py-20 max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Current Openings
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Explore opportunities to grow with our fast-moving commerce and sustainability team.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept.id
                    ? "bg-[#003D2B] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Empty State: No Openings Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EAF7F0] border border-[#006B3C]/20 text-[#006B3C] flex items-center justify-center mx-auto mb-6 shadow-xs">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <span>●</span> No Openings at Present
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              We Don&apos;t Have Active Openings Right Now
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 mt-2.5 max-w-md mx-auto leading-relaxed">
              Our core team is currently fully staffed, but we are expanding rapidly! We constantly
              look through talent community submissions when new positions open.
            </p>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#006B3C]" /> Equal Opportunity Employer
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#006B3C]" /> North America Talent Welcome
              </span>
            </div>
          </div>
        </section>

        {/* ── General Talent Application Form ── */}
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Context */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-xs font-bold border border-emerald-100">
                  <Users className="w-3.5 h-3.5" />
                  Talent Community
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                  Want to be considered for future roles?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Leave your details and area of expertise. When we open new positions in engineering,
                  growth, design, or supply chain, you will be the first candidate our team reviews.
                </p>

                <div className="pt-2 space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    Direct review by hiring managers
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    Early notification before public listings
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAF7F0] text-[#006B3C] flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    Fast-track interview process
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-7 bg-[#FAFDFB] p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
                {submitted ? (
                  <div className="p-6 bg-[#EAF7F0] border border-[#006B3C]/20 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#006B3C] text-white flex items-center justify-center mx-auto text-xl font-bold">
                      ✓
                    </div>
                    <h4 className="text-base font-bold text-[#003D2B]">
                      Profile Received Successfully!
                    </h4>
                    <p className="text-xs text-[#006B3C] max-w-sm mx-auto">
                      Thank you for sharing your interest. We will keep your resume on file and
                      contact you as soon as an opening matches your skill set.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTalentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="alex@example.com"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Department of Interest
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, department: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                        >
                          <option value="Engineering">Engineering & Technology</option>
                          <option value="Supply Chain">Supply Chain & Operations</option>
                          <option value="Marketing">Growth & Digital Marketing</option>
                          <option value="Product">Product Management & UI/UX</option>
                          <option value="Customer Support">Customer Care & Support</option>
                          <option value="Other">Other / General Expression</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          LinkedIn or Portfolio URL
                        </label>
                        <input
                          type="url"
                          value={formData.linkedIn}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, linkedIn: e.target.value }))
                          }
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Tell us briefly about yourself & what you do
                      </label>
                      <textarea
                        rows={3}
                        value={formData.note}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, note: e.target.value }))
                        }
                        placeholder="Brief summary of your skills, accomplishments, and what kind of impact you'd like to create at Vanom..."
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#003D2B] hover:bg-[#00281b] text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      Submit Profile for Future Openings
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── Culture & Values ── */}
        <section className="py-14 sm:py-20 max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              How We Work at Vanom
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Our shared values guide how we build products, treat teammates, and care for our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <div
                key={val.title}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 hover:border-[#006B3C]/30 hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] text-[#006B3C] font-black text-sm flex items-center justify-center">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{val.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits & Perks ── */}
        <section className="py-14 bg-[#f0f7f3] border-t border-[#e2ece5]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Benefits Designed for Well-Being
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                We believe when teammates are happy, healthy, and supported, extraordinary work follows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="p-5 rounded-2xl bg-white border border-[#d6e5dc] shadow-xs space-y-2.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#003D2B] text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{b.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Have Questions Banner ── */}
        <section className="py-12 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#003D2B] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Have questions about working at Vanom?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80">
                  Feel free to get in touch with our people & talent team directly.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <a
                  href="mailto:careers@vanom-commerce.com"
                  className="px-5 py-2.5 rounded-xl bg-white text-[#003D2B] hover:bg-gray-100 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  careers@vanom-commerce.com
                </a>
                <Link
                  to={ROUTES.CONTACT}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  Contact Us <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default CareersPage;
