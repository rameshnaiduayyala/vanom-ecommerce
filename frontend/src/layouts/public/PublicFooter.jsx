import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Leaf,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="mt-auto select-none overflow-hidden relative text-slate-100">
      {/* ── TOP HILLS & BOTANICAL WAVE GRAPHIC ── */}
      <div className="relative w-full bg-[#18533C] pt-14 sm:pt-20 pb-10 sm:pb-16 overflow-hidden">
        {/* Layered Vector Landscape / Hill Wave Overlay */}
        <svg
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40 z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96 C280,180 560,40 840,120 C1120,200 1320,80 1440,110 L1440,0 L0,0 Z"
            fill="#0F3B2A"
          />
          <path
            d="M0,192 C320,120 640,260 960,180 C1200,120 1380,220 1440,190 L1440,0 L0,0 Z"
            fill="#1E6B4E"
            opacity="0.3"
          />
        </svg>

        {/* Floating subtle leaves */}
        <div className="absolute top-6 left-[18%] text-[#6EE7B7]/40 pointer-events-none z-10 transform rotate-[-20deg] animate-pulse">
          <Leaf className="w-8 h-8 fill-current" />
        </div>
        <div className="absolute top-12 right-[24%] text-[#34D399]/30 pointer-events-none z-10 transform rotate-[40deg]">
          <Leaf className="w-10 h-10 fill-current" />
        </div>
        <div className="absolute bottom-8 right-[48%] text-[#10B981]/30 pointer-events-none z-10 transform rotate-[15deg]">
          <Leaf className="w-7 h-7 fill-current" />
        </div>

        {/* Big Bold Headline Statement matching Treecard reference */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2
            className="font-black text-white tracking-tight leading-[1.08] max-w-3xl drop-shadow-sm"
            style={{ fontSize: "clamp(2.1rem, 5.2vw, 4.2rem)" }}
          >
            Commerce doesn&apos;t stop at borders,{" "}
            <span className="text-[#6EE7B7]">it connects them.</span>
          </h2>
        </div>
      </div>

      {/* ── MAIN STYLIZED FOOTER CONTENT ── */}
      <div className="bg-[#0D442F] border-t border-[#1D6347]/60 pt-12 sm:pt-16 pb-12 sm:pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Column 1: Brand Logo, Socials, CTA Button (3.5 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 group">
                <div className="bg-white rounded-xl p-2 shadow-md flex items-center justify-center">
                  <img src="/logo.png" alt="Vanom Logo" className="h-8 w-auto object-contain" />
                </div>
              </Link>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 text-[#34D399]">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#12553B] hover:bg-[#22C55E] hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#12553B] hover:bg-[#22C55E] hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#12553B] hover:bg-[#22C55E] hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#12553B] hover:bg-[#22C55E] hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Treecard-style CTA Button */}
              <div>
                <Link
                  to={ROUTES.PRODUCTS}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#34D399] hover:bg-[#2cd092] active:scale-[0.98] text-[#06331E] shadow-lg shadow-[#34D399]/20 transition-all duration-200 cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 text-[#06331E]" />
                </Link>
              </div>

              {/* Direct Quick Contact */}
              <div className="space-y-1.5 pt-2 text-xs text-emerald-100/70">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                  <span>+91 7989419864</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                  <a href="mailto:ayyalarameshnaidu@gmail.com" className="hover:text-white transition-colors truncate">
                    ayyalarameshnaidu@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Navigation Links (2.5 cols) */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-2 text-xs font-medium text-emerald-100/80">
                  <li><Link to={ROUTES.HOME} className="hover:text-[#6EE7B7] transition-colors">Home</Link></li>
                  <li><Link to={ROUTES.PRODUCTS} className="hover:text-[#6EE7B7] transition-colors">Catalog</Link></li>
                  <li><Link to={ROUTES.B2B.CATALOG} className="hover:text-[#6EE7B7] transition-colors">B2B Portal</Link></li>
                  <li><Link to={ROUTES.B2B.QUOTES} className="hover:text-[#6EE7B7] transition-colors">Request RFQ</Link></li>
                  <li><Link to={ROUTES.B2B.BULK_ORDER} className="hover:text-[#6EE7B7] transition-colors">Bulk Order</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Support
                </h4>
                <ul className="space-y-2 text-xs font-medium text-emerald-100/80">
                  <li><Link to={ROUTES.CONTACT} className="hover:text-[#6EE7B7] transition-colors">Contact Us</Link></li>
                  <li><Link to={ROUTES.ORDERS} className="hover:text-[#6EE7B7] transition-colors">Track Orders</Link></li>
                  <li><Link to={ROUTES.ACCOUNT} className="hover:text-[#6EE7B7] transition-colors">My Account</Link></li>
                  <li><a href="#faqs" className="hover:text-[#6EE7B7] transition-colors">FAQs</a></li>
                  <li><a href="#privacy" className="hover:text-[#6EE7B7] transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>

            {/* Column 3: Global Office Addresses (3.5 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                Global Offices & Hubs
              </h4>

              <div className="space-y-3 text-xs text-emerald-100/80">
                {/* UK Office */}
                <div className="p-3 rounded-xl bg-[#12553B]/50 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#6EE7B7]">
                    <MapPin className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span>United Kingdom</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-100/70 pl-5">
                    Vanom Global Ltd<br />
                    25 Cabot Square, Canary Wharf<br />
                    London E14 4QA
                  </p>
                </div>

                {/* US Office */}
                <div className="p-3 rounded-xl bg-[#12553B]/50 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#6EE7B7]">
                    <MapPin className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span>United States</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-100/70 pl-5">
                    Vanom Logistics Inc<br />
                    450 Lexington Avenue<br />
                    New York, NY 10017
                  </p>
                </div>
              </div>
            </div>

            {/* Column 4: Tagline & Legal Disclaimer (3 cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  Global supply. Seamless delivery.
                </h3>
                <p className="text-xs text-emerald-200/60 mt-0.5">
                  Copyright © {new Date().getFullYear()} Vanom Platforms Ltd.
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-emerald-200/50">
                THIS PLATFORM IS OPERATED BY VANOM ECOMMERCE PLATFORMS LTD. DIRECT RETAIL AND B2B OPERATIONS ARE BACKED BY ISO-9001 QUALITY STANDARDS.
              </p>

              <div className="pt-1 flex items-center gap-2 text-[11px] text-[#6EE7B7]/80">
                <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>PCI-DSS Level 1 & SSL Encrypted</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
