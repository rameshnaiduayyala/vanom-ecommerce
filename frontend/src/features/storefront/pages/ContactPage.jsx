import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "../../../components/ui/Toast.jsx";
import { ROUTES } from "../../../constants/routes.js";
import { SEO } from "../../../components/common/SEO.jsx";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Package,
  Headphones,
  ArrowRight,
  Globe,
  Shield,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Truck,
  Building,
} from "lucide-react";
import { VANOM_COMPANY_DETAILS } from "../../../constants/company.js";
import { useStoreSettingsStore } from "../../../stores/store.store.js";
import { contactService } from "../../../services/api/contact.service.js";

export function ContactPage() {
  const { store, fetchPublicStore } = useStoreSettingsStore();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: "",
  });

  useEffect(() => {
    fetchPublicStore();
  }, [fetchPublicStore]);

  const storeName = store?.storeName || "Vanom";
  const contactEmail = store?.supportEmail || store?.email || VANOM_COMPANY_DETAILS.contact.email;
  const contactPhone = store?.phone || store?.whatsapp || VANOM_COMPANY_DETAILS.contact.phone;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await contactService.submitContactForm(formData);
      setSubmitted(true);
      toast.success(
        "Message Sent Successfully!",
        "Our support team has received your message and will respond within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Order Inquiry",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      toast.error(
        "Submission Failed",
        err?.message || "Could not send message. Please try again or reach us directly by email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const faqs = [
    {
      q: "Where do you ship orders from?",
      a: "All North American orders are shipped directly from our primary fulfillment centers in Dallas, TX, New York, and Toronto, ON with standard 2-4 business day tracked delivery.",
    },
    {
      q: "Are all Vanom products certified organic?",
      a: "Yes. Every single item in our catalog carries verified USDA Organic and Canada Organic certifications, Non-GMO verification, and undergoes independent laboratory batch purity testing.",
    },
    {
      q: "How can I track my existing order?",
      a: "You can track your parcel live anytime by visiting your Orders dashboard or using the instant tracking tool with your tracking code sent via email.",
    },
    {
      q: "Do you offer wholesale and bulk discounts?",
      a: "Yes! We support retail grocery chains, pharmacies, and commercial partners through our dedicated B2B Wholesale Portal with volume tiered pricing and net terms.",
    },
  ];

  return (
    <>
      <SEO
        title={`Contact Us | 24/7 Customer Care & Support | ${storeName}`}
        description={`Get in touch with the ${storeName} team for certified organic order inquiries, shipping assistance, and wholesale B2B partnerships across the US and Canada.`}
        canonicalUrl="/contact"
      />

      <div className="bg-[#FAFDFB] min-h-screen">
        {/* ── Breadcrumb ── */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
            <Link to={ROUTES.HOME} className="hover:text-[#006B3C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Contact Us</span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-[#003D2B] text-white py-16 sm:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A3E635_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006B3C]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200">
              <Headphones className="w-3.5 h-3.5 text-[#F9BC15]" />
              Dedicated Customer Care
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              We&apos;re Here to Help You{" "}
              <span className="text-[#F9BC15]">Every Step of the Way</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              Have questions about your order, organic certifications, or bulk wholesale pricing?
              Our friendly team is always ready to assist.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                ⚡ 24-Hour Response Guarantee
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                🇺🇸 🇨🇦 US & Canada Support
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-200">
                📦 Fast Order Tracking
              </span>
            </div>
          </div>
        </section>

        {/* ── 3 Quick Action Cards ── */}
        <section className="relative -mt-8 sm:-mt-12 max-w-[1240px] mx-auto px-4 sm:px-8 z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Email Card */}
            <a
              href={`mailto:${contactEmail}`}
              className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#006B3C]/30 transition-all duration-200 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] text-[#006B3C] group-hover:bg-[#003D2B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Email Support
                </span>
                <span className="text-sm font-bold text-gray-900 group-hover:text-[#006B3C] transition-colors truncate block">
                  {contactEmail}
                </span>
                <span className="text-[11px] text-gray-500">Replies within 1 business day</span>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href={`tel:${contactPhone}`}
              className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#006B3C]/30 transition-all duration-200 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] text-[#006B3C] group-hover:bg-[#003D2B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Phone / WhatsApp
                </span>
                <span className="text-sm font-bold text-gray-900 group-hover:text-[#006B3C] transition-colors block">
                  {contactPhone}
                </span>
                <span className="text-[11px] text-gray-500">
                  {VANOM_COMPANY_DETAILS.contact.operatingHours}
                </span>
              </div>
            </a>

            {/* Self-Service Order Tracking */}
            <Link
              to={ROUTES.ORDERS}
              className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#006B3C]/30 transition-all duration-200 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#EAF7F0] text-[#006B3C] group-hover:bg-[#003D2B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Self-Service
                  </span>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-[#006B3C] transition-colors block">
                    Track Your Order
                  </span>
                  <span className="text-[11px] text-gray-500">Real-time carrier updates</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#006B3C] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>
        </section>

        {/* ── Main Section: Form + Office Hubs ── */}
        <section className="py-16 sm:py-24 max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left 7 Cols: Contact Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-xs font-bold border border-emerald-100 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Inquiry
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Send Us a Message
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Fill out the form below and an assigned specialist will review your request.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 bg-[#EAF7F0] border border-[#006B3C]/20 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#006B3C] text-white flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-base font-bold text-[#003D2B]">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-[#006B3C] max-w-sm mx-auto">
                    Thank you for reaching out. We have logged your inquiry and will follow up with you
                    promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
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
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number <span className="font-normal text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Inquiry Topic *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                      >
                        <option value="Order Inquiry">Order Status & Delivery</option>
                        <option value="Product Specifications">Organic Certifications & Purity</option>
                        <option value="Returns & Refunds">Returns, Replacements & Refunds</option>
                        <option value="Payment & Invoicing">Payment & Tax Invoicing</option>
                        <option value="B2B Wholesale">B2B Wholesale / Bulk Orders</option>
                        <option value="General Question">General Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide order number or details so we can assist you quickly..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#003D2B] focus:ring-1 focus:ring-[#003D2B]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={submitting || submitted}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#003D2B] hover:bg-[#00281b] disabled:bg-gray-400 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-gray-500">
                      🔒 Your details are kept strictly confidential.
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* Right 5 Cols: Headquarters & Regional Hubs */}
            <div className="lg:col-span-5 space-y-6">
              {/* Offices Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Building className="w-4 h-4 text-[#006B3C]" />
                  Corporate Headquarters & Logistics
                </div>

                <div className="space-y-4">
                  {/* USA Hub */}
                  <div className="p-4 rounded-2xl bg-[#FAFDFB] border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇺🇸</span>
                        <h3 className="text-sm font-bold text-gray-900">United States HQ</h3>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        New York & Dallas
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      450 Lexington Avenue, New York, NY 10017<br />
                      Dallas Logistics Depot: Automated Container Terminal
                    </p>
                  </div>

                  {/* Canada Hub */}
                  <div className="p-4 rounded-2xl bg-[#FAFDFB] border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇨🇦</span>
                        <h3 className="text-sm font-bold text-gray-900">Canada Hub</h3>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Toronto
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      300 Yonge Street, Suite 1500, Toronto, Ontario M5B 2L7
                    </p>
                  </div>
                </div>

                {/* Operating Hours Box */}
                <div className="p-4 rounded-2xl bg-[#003D2B] text-white space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-[#F9BC15] text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    Support Operating Hours
                  </div>
                  <p className="text-xs text-emerald-100/80">
                    Monday through Saturday, 9:00 AM – 8:00 PM EST.
                  </p>
                  <p className="text-[10px] text-emerald-200/60">
                    Online store order processing runs 24/7/365.
                  </p>
                </div>
              </div>

              {/* Trust & Guarantees Card */}
              <div className="p-6 rounded-3xl bg-[#f0f7f3] border border-[#d6e5dc] space-y-3">
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Our Service Guarantees
                </div>
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#006B3C] shrink-0" />
                    <span>256-bit encrypted data security</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#006B3C] shrink-0" />
                    <span>Temperature-controlled organic handling</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006B3C] shrink-0" />
                    <span>100% money-back satisfaction promise</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ Quick Answers ── */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-[900px] mx-auto px-4 sm:px-8">
            <div className="text-center space-y-2 mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-xs font-bold border border-emerald-100">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Quick Answers to Common Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-gray-200/80 bg-[#FAFDFB] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-[#006B3C] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-base text-gray-400 font-normal shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Bottom Wholesale / B2B Banner ── */}
        <section className="py-12 bg-[#FAFDFB]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#003D2B] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Interested in B2B Wholesale Partnerships?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80">
                  Access commercial container rates, pallet shipping, and dedicated account management.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link
                  to={ROUTES.REGISTER_BUSINESS}
                  className="px-6 py-3 rounded-xl bg-[#F9BC15] hover:bg-[#e0a810] text-[#003D2B] font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95"
                >
                  Register Business Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={ROUTES.OUR_STORY}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all shadow-xs"
                >
                  About Vanom
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ContactPage;
