import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "../../../components/ui/Toast.jsx";
import { ROUTES } from "../../../constants/routes.js";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Package,
  Headphones,
  ArrowRight,
} from "lucide-react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success(
      "Message Sent Successfully!",
      "Thank you for reaching out. Our support team will review your inquiry and respond within 24 hours."
    );
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "Order Inquiry",
      message: "",
    });
    setTimeout(() => setSubmitted(false), 6000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#F6FAF7] min-h-screen pb-24">
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden bg-[#074428] text-white py-16 sm:py-20 border-b border-emerald-900/60">
        <div className="absolute inset-0 bg-radial-at-t from-[#0d5936] via-[#074428] to-[#042a19] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c5936] text-[#a7f3d0] border border-[#10b981]/30 text-xs font-bold tracking-wider uppercase">
            <Headphones className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>24/7 Customer Care & Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            We're Here to Help You
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Have questions about an existing order, shipping tracking, product specifications, or return policy? Our dedicated support team is available around the clock.
          </p>
        </div>
      </section>

      {/* ─── Main Content Container ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {/* 3 Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* Card 1: Direct Email */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE8DF] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#074428] flex items-center justify-center shrink-0 border border-emerald-100">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Support</span>
                <h3 className="text-base font-bold text-[#072115]">Direct Inquiries</h3>
              </div>
            </div>
            <p className="text-xs text-[#4B6357] leading-relaxed">
              Drop us an email anytime. We typically respond to customer service requests within 2 business hours.
            </p>
            <a
              href="mailto:ayyalarameshnaidu@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#074428] hover:text-[#059669] transition-colors"
            >
              <span>ayyalarameshnaidu@gmail.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Phone Hotline */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE8DF] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-lime-50 text-[#65A30D] flex items-center justify-center shrink-0 border border-lime-200">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Hotline</span>
                <h3 className="text-base font-bold text-[#072115]">Phone Assistance</h3>
              </div>
            </div>
            <p className="text-xs text-[#4B6357] leading-relaxed">
              Speak directly with our support desk representatives for urgent order changes or dispatch questions.
            </p>
            <a
              href="tel:+917989419864"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#074428] hover:text-[#059669] transition-colors"
            >
              <span>+91 7989419864 (Mon - Sat)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Track Existing Order */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE8DF] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Self-Service</span>
                <h3 className="text-base font-bold text-[#072115]">Order Tracking</h3>
              </div>
            </div>
            <p className="text-xs text-[#4B6357] leading-relaxed">
              Track your package live with your Order ID and delivery tracking number for instant real-time status.
            </p>
            <Link
              to={ROUTES.ORDERS}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#074428] hover:text-[#059669] transition-colors"
            >
              <span>Go to Order Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ─── Contact Form & Office Info Grid ─── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left: Contact Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DCE8DF] p-7 sm:p-10 shadow-lg">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#059669] uppercase tracking-wider block mb-1">
                Direct Message
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#072115] tracking-tight">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-[#4B6357] mt-1">
                Fill out the form below and our customer experience team will get back to you promptly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Naidu"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] text-xs sm:text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] bg-[#F9FBF9]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] text-xs sm:text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] bg-[#F9FBF9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 / +1 / +44 ..."
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] text-xs sm:text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] bg-[#F9FBF9]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inquiry Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] text-xs sm:text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] bg-[#F9FBF9] cursor-pointer"
                  >
                    <option value="Order Inquiry">Order Inquiry / Delivery Status</option>
                    <option value="Product Specifications">Product Specifications</option>
                    <option value="Returns & Refunds">Returns & Refund Request</option>
                    <option value="Payment & Invoicing">Payment & Tax Invoicing</option>
                    <option value="General Question">General Feedback</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Provide any details, order numbers, or questions you have..."
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DF] text-xs sm:text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/10 text-[#072115] bg-[#F9FBF9] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] text-white font-extrabold text-xs sm:text-sm transition-all hover:scale-[1.01] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
                    <span>Message Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Office Logistics Hubs & Assurances */}
          <div className="lg:col-span-5 space-y-6">

            {/* Global Hubs Card */}
            <div className="bg-white rounded-3xl border border-[#DCE8DF] p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-[#072115]">
                Corporate & Fulfillment Centers
              </h3>

              <div className="space-y-4 text-xs text-[#4B6357]">
                <div className="flex items-start gap-3 pb-3 border-b border-[#E3ECE6]">
                  <MapPin className="w-4 h-4 text-[#074428] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#072115] font-bold text-sm">United Kingdom Operations</strong>
                    <span>Vanom Global Ltd, 25 Cabot Square, Canary Wharf, London E14 4QA</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-[#E3ECE6]">
                  <MapPin className="w-4 h-4 text-[#074428] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#072115] font-bold text-sm">United States Fulfillment</strong>
                    <span>Vanom Logistics Inc, 450 Lexington Ave, New York, NY 10017</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-[#074428] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-[#84CC16]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold text-[#84CC16]">
                <Clock className="w-4 h-4" />
                <span>Operating Hours</span>
              </div>

              <h4 className="text-lg font-black text-white">
                Online Orders Dispatched 24/7
              </h4>

              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Our fulfillment depots operate round the clock. Phone & live support is active Monday to Saturday, 8:00 AM – 8:00 PM local time.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactPage;
