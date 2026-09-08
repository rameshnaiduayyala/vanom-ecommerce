import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Leaf,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2d6852] text-white border-t border-[#3b8569] mt-auto select-none overflow-hidden">
      {/* ── 1. Top Section: Dedicated "About Vanom" Brand Feature ── */}
      <div className="border-b border-[#3b8569]/80 py-10 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Headline */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-5 text-center sm:text-left">

            <div className="max-w-xl">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F9BC15] bg-[#F9BC15]/20 px-2.5 py-0.5 rounded-full border border-[#F9BC15]/30">
                  About Vanom
                </span>
                <span className="text-xs text-white/70">•</span>
                <span className="text-xs font-semibold text-white/90">Pure • Sustainable • Global</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                Empowering mindful living through authentic organic essentials.
              </h3>
              <p className="text-xs text-white/85 leading-relaxed">
                Founded with a mission to bring conscious wellness and natural living directly to your doorstep. We partner exclusively with certified ethical makers and artisanal cultivators across India to deliver non-toxic, eco-friendly lifestyle products worldwide.
              </p>
            </div>
          </div>

          {/* Quick Metrics / Badges */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
              <div className="text-lg font-black text-[#F9BC15]">100%</div>
              <div className="text-[10px] font-semibold text-white/80">Ethically Sourced</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
              <div className="text-lg font-black text-[#F9BC15]">30+</div>
              <div className="text-[10px] font-semibold text-white/80">Countries Served</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
              <div className="text-lg font-black text-[#F9BC15]">50k+</div>
              <div className="text-[10px] font-semibold text-white/80">Happy Families</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
              <div className="text-lg font-black text-[#F9BC15]">0%</div>
              <div className="text-[10px] font-semibold text-white/80">Harmful Toxins</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Links & Branding ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Column 1: Brand & Socials (4.5 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to={ROUTES.HOME} className="inline-flex items-center p-2.5 px-3.5 bg-[#FFF7DD] rounded-xl border border-[#ebdcb0] shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-xl font-black text-[#003D2B] tracking-tight font-serif">
                Vanom<span className="text-[#D9A514]">™</span>
              </span>
            </Link>



            {/* Circular Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200 text-xs font-bold font-serif"
              >
                P
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link to={ROUTES.PRODUCTS} className="hover:text-[#F9BC15] transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=deals`} className="hover:text-[#F9BC15] transition-colors">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=new`} className="hover:text-[#F9BC15] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=bestseller`} className="hover:text-[#F9BC15] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/gift-cards" className="hover:text-[#F9BC15] transition-colors">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Customer Service</h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link to={ROUTES.ORDERS} className="hover:text-[#F9BC15] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-[#F9BC15] transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-[#F9BC15] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-[#F9BC15] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-[#F9BC15] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About Vanom (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">About Vanom</h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link to="/about" className="hover:text-[#F9BC15] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-[#F9BC15] transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-[#F9BC15] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#F9BC15] transition-colors">
                  Blog &amp; Articles
                </Link>
              </li>
              <li>
                <Link to="/bulk-buyers" className="hover:text-[#F9BC15] transition-colors">
                  Partner With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Payment Methods (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">We Accept</h4>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[11px] font-black text-[#1A1F71] tracking-tight italic font-serif">
                  VISA
                </span>
              </div>
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
                </div>
              </div>
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-[#097939] tracking-tighter">
                  Ru<span className="text-[#092B60]">Pay</span>
                  <span className="text-[#F37021] text-[8px]">▶</span>
                </span>
              </div>
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-[#1E3A8A] tracking-wider">
                  UPI<span className="text-[#059669]">▶</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* ── 4. Bottom Sub-Bar: Copyright, Legal Links & Made in India ── */}
      <div className="border-t border-[#3b8569] bg-[#2d6852] py-4 px-4 sm:px-8 lg:px-12 text-[11px] text-white/80">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <div>
            © {currentYear} Vanom Ecommerce Inc. All rights reserved.
          </div>

          {/* Legal Links & Country Badge */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <span className="text-white/20">|</span>
            <div className="inline-flex items-center gap-1.5 text-white/90">
              <span className="text-sm leading-none">🇮🇳</span>
              <span className="text-[10px] font-medium text-white/80">Made with care in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;

