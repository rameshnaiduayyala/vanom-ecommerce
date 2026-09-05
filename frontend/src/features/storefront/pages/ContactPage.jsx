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
  CheckCircle2,
  Package,
  Headphones,
  ArrowRight,
  Globe,
  Shield,
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
      "Our support team will respond within 24 hours."
    );
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "Order Inquiry",
      message: "",
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ─── Minimal Hero ─── */}
      <section className="relative bg-[#042A19] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0a5634]/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#84CC16]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#84CC16] text-[11px] font-semibold tracking-[0.15em] uppercase mb-8 backdrop-blur-sm">
            <Headphones className="w-3.5 h-3.5" />
            <span>Customer Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-5">
            Get in Touch
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/60 max-w-lg mx-auto leading-relaxed font-light">
            Questions about orders, products, or shipping? We're here to help.
          </p>
        </div>
      </section>

      {/* ─── Contact Info Strip ─── */}
      <section className="border-b border-[#E8EDE9]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E8EDE9]">

            {/* Email */}
            <a
              href="mailto:ayyalarameshnaidu@gmail.com"
              className="group flex items-center gap-4 py-7 md:py-9 md:pr-8 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0F7F1] flex items-center justify-center shrink-0 group-hover:bg-[#074428] transition-colors duration-300">
                <Mail className="w-5 h-5 text-[#074428] group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8B9E91] uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-sm font-bold text-[#0F2B1C] truncate group-hover:text-[#074428] transition-colors">
                  ayyalarameshnaidu@gmail.com
                </p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+917989419864"
              className="group flex items-center gap-4 py-7 md:py-9 md:px-8 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0F7F1] flex items-center justify-center shrink-0 group-hover:bg-[#074428] transition-colors duration-300">
                <Phone className="w-5 h-5 text-[#074428] group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#8B9E91] uppercase tracking-wider mb-0.5">Phone</p>
                <p className="text-sm font-bold text-[#0F2B1C] group-hover:text-[#074428] transition-colors">
                  +91 7989419864
                </p>
                <p className="text-[11px] text-[#8B9E91]">Mon – Sat, 9 AM – 8 PM IST</p>
              </div>
            </a>

            {/* Track Orders */}
            <Link
              to={ROUTES.ORDERS}
              className="group flex items-center gap-4 py-7 md:py-9 md:pl-8 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0F7F1] flex items-center justify-center shrink-0 group-hover:bg-[#074428] transition-colors duration-300">
                <Package className="w-5 h-5 text-[#074428] group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#8B9E91] uppercase tracking-wider mb-0.5">Self-Service</p>
                <p className="text-sm font-bold text-[#0F2B1C] group-hover:text-[#074428] transition-colors">
                  Track Your Order
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C4D1C7] group-hover:text-[#074428] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Main Content: Form + Sidebar ─── */}
      <section className="py-16 sm:py-24 bg-[#FAFCFA]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Left: Contact Form (3/5) ── */}
            <div className="lg:col-span-3">
              <div className="mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2B1C] tracking-tight mb-3">
                  Send Us a Message
                </h2>
                <p className="text-sm text-[#5E7D67] leading-relaxed max-w-md">
                  Fill out the form and our team will respond within one business day.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2D4A35] mb-2">
                      Full Name <span className="text-[#84CC16]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D4DED6] text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] bg-white placeholder:text-[#A3B5A8] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#2D4A35] mb-2">
                      Email Address <span className="text-[#84CC16]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D4DED6] text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] bg-white placeholder:text-[#A3B5A8] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#2D4A35] mb-2">
                      Phone <span className="text-[#A3B5A8] font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 / +1 / +44"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D4DED6] text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] bg-white placeholder:text-[#A3B5A8] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-[#2D4A35] mb-2">
                      Subject <span className="text-[#84CC16]">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D4DED6] text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] bg-white cursor-pointer transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B9E91' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 16px center",
                      }}
                    >
                      <option value="Order Inquiry">Order & Delivery</option>
                      <option value="Product Specifications">Product Info</option>
                      <option value="Returns & Refunds">Returns & Refunds</option>
                      <option value="Payment & Invoicing">Payment & Invoicing</option>
                      <option value="General Question">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#2D4A35] mb-2">
                    Message <span className="text-[#84CC16]">*</span>
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D4DED6] text-sm focus:outline-none focus:border-[#074428] focus:ring-2 focus:ring-[#074428]/8 text-[#0F2B1C] bg-white placeholder:text-[#A3B5A8] resize-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitted}
                    className="px-8 py-3.5 rounded-xl bg-[#074428] hover:bg-[#0a5634] disabled:bg-[#074428]/70 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#074428]/20 flex items-center gap-2.5 cursor-pointer"
                  >
                    {submitted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
                        <span>Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-[#8B9E91]">
                    We typically respond within 24 hours.
                  </p>
                </div>
              </form>
            </div>

            {/* ── Right Sidebar (2/5) ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Office Locations */}
              <div>
                <h3 className="text-xs font-bold text-[#8B9E91] uppercase tracking-[0.15em] mb-5">
                  Our Offices
                </h3>

                <div className="space-y-6">
                  <div className="group">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F0F7F1] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#074428]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F2B1C] mb-1">United Kingdom</h4>
                        <p className="text-[13px] text-[#5E7D67] leading-relaxed">
                          Vanom Global Ltd<br />
                          25 Cabot Square, Canary Wharf<br />
                          London E14 4QA
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#E8EDE9]" />

                  <div className="group">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F0F7F1] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#074428]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F2B1C] mb-1">United States</h4>
                        <p className="text-[13px] text-[#5E7D67] leading-relaxed">
                          Vanom Logistics Inc<br />
                          450 Lexington Avenue<br />
                          New York, NY 10017
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-[#074428] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#84CC16]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-[#84CC16]" />
                    <span className="text-[11px] font-bold text-[#84CC16] uppercase tracking-wider">Hours</span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">
                    24/7 Order Processing
                  </h4>

                  <p className="text-[13px] text-emerald-100/60 leading-relaxed">
                    Fulfillment runs around the clock. Phone support is available Mon–Sat, 9 AM – 8 PM.
                  </p>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span className="text-[13px] text-[#5E7D67]">256-bit SSL encrypted communication</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span className="text-[13px] text-[#5E7D67]">Multi-market delivery across US & UK</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span className="text-[13px] text-[#5E7D67]">Dedicated account support available</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
