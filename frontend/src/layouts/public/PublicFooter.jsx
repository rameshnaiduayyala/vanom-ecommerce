import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#002418] text-white border-t border-[#003826] mt-auto select-none">
      {/* Main Footer Links & Branding */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Socials (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to={ROUTES.HOME} className="inline-block">
              <img
                src="/logo.png"
                alt="Vanom"
                className="h-10 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-2xl font-black text-[#A3E635] tracking-tight font-serif">
                Vanom<span className="text-[#FBBF24]">™</span>
              </span>
            </Link>

            <p className="text-xs text-white/70 font-medium">
              Everything for a brighter tomorrow.
            </p>

            {/* Circular Social Icons matching reference */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white/80 flex items-center justify-center transition-all duration-200"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white/80 flex items-center justify-center transition-all duration-200"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white/80 flex items-center justify-center transition-all duration-200"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white/80 flex items-center justify-center transition-all duration-200"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white/80 flex items-center justify-center transition-all duration-200 text-xs font-bold font-serif"
              >
                P
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link to={ROUTES.PRODUCTS} className="hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=deals`} className="hover:text-white transition-colors">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=new`} className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?filter=bestseller`} className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/gift-cards" className="hover:text-white transition-colors">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">Customer Service</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link to={ROUTES.ORDERS} className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About Vanom (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">About Vanom</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/bulk-buyers" className="hover:text-white transition-colors">
                  Partner With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Payment Methods (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">We Accept</h4>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Visa Badge */}
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[11px] font-black text-[#1A1F71] tracking-tight italic font-serif">
                  VISA
                </span>
              </div>

              {/* Mastercard Badge */}
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
                </div>
              </div>

              {/* RuPay Badge */}
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-[#097939] tracking-tighter">
                  Ru<span className="text-[#092B60]">Pay</span>
                  <span className="text-[#F37021] text-[8px]">▶</span>
                </span>
              </div>

              {/* UPI Badge */}
              <div className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-[#1E3A8A] tracking-wider">
                  UPI<span className="text-[#059669]">▶</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Bar: Copyright, Legal Links & Made in India */}
      <div className="border-t border-[#003826] bg-[#001D13] py-4 px-4 sm:px-8 lg:px-12 text-[11px] text-white/60">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <div>
            © {currentYear} Vanom. All rights reserved.
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
            <div className="inline-flex items-center gap-1.5 text-white/80">
              <span className="text-sm leading-none">🇮🇳</span>
              <span className="text-[10px] font-medium text-white/70">Made with care in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;

