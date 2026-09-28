import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from "lucide-react";
import { VANOM_COMPANY_DETAILS } from "../../constants/company.js";
import { useStoreSettingsStore } from "../../stores/store.store.js";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const { store, fetchPublicStore } = useStoreSettingsStore();

  useEffect(() => {
    fetchPublicStore();
  }, [fetchPublicStore]);

  const storeName = store?.storeName || "Vanom";
  const storeTagline = store?.storeTagline || "Pure • Sustainable • Global";
  const storeDescription =
    store?.description ||
    "Founded with a mission to bring conscious wellness and natural living directly to your doorstep. We partner exclusively with certified ethical makers and artisanal cultivators across India to deliver non-toxic, eco-friendly lifestyle products worldwide.";
  const logoUrl = store?.logoUrl || "/logo.png";
  const legalName = store?.legalName || storeName || VANOM_COMPANY_DETAILS.legalName;

  const socialLinks = [
    { href: store?.facebookUrl, icon: Facebook, label: "Facebook" },
    { href: store?.instagramUrl, icon: Instagram, label: "Instagram" },
    { href: store?.twitterUrl, icon: Twitter, label: "Twitter" },
    { href: store?.youtubeUrl, icon: Youtube, label: "Youtube" },
    { href: store?.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-[#246B52] text-white border-t border-[rgb(60,170,130)] mt-auto select-none overflow-hidden">

      {/* ── 1. Brand Strip ── */}
      <div className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            {/* Left: tagline + description */}
            <div className="max-w-xl space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F9BC15] bg-[#F9BC15]/20 px-2.5 py-0.5 rounded-full border border-[#F9BC15]/30">
                  About {storeName}
                </span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs font-semibold text-white/80">{storeTagline}</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{storeDescription}</p>
            </div>

            {/* Right: metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0 w-full lg:w-auto">
              {[
                { value: "100%", label: "Ethically Sourced" },
                { value: "30+", label: "Countries Served" },
                { value: "50k+", label: "Happy Families" },
                { value: "0%", label: "Harmful Toxins" },
              ].map((m) => (
                <div key={m.label} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[110px]">
                  <div className="text-xl font-black text-[#F9BC15] leading-none">{m.value}</div>
                  <div className="text-[10px] font-semibold text-white/70 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Link Grid ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand + Social — 4 cols */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4 space-y-5">
            <Link to={ROUTES.HOME} className="inline-flex items-center">
              <img
                src={logoUrl}
                alt={storeName}
                className="h-14 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="hidden text-2xl font-black text-white tracking-tight font-serif">
                {storeName}<span className="text-[#F9BC15]">™</span>
              </span>
            </Link>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-full border border-white/25 bg-white/10 hover:bg-[#F9BC15] hover:border-[#F9BC15] hover:text-[#002418] text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop — 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase">Shop</h4>
            <ul className="space-y-2 text-xs text-white/70">
              {[
                { label: "All Categories", to: ROUTES.PRODUCTS },
                { label: "Today's Deals", to: `${ROUTES.PRODUCTS}?filter=deals` },
                { label: "New Arrivals", to: `${ROUTES.PRODUCTS}?filter=new` },
                { label: "Best Sellers", to: `${ROUTES.PRODUCTS}?filter=bestseller` },
                { label: "Gift Cards", to: "/gift-cards" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-[#F9BC15] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service — 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase">Customer Service</h4>
            <ul className="space-y-2 text-xs text-white/70">
              {[
                { label: "Track Order", to: ROUTES.ORDERS },
                { label: "Shipping & Delivery", to: "/shipping" },
                { label: "Returns & Refunds", to: "/returns" },
                { label: "Help Center", to: ROUTES.CONTACT },
                { label: "Contact Us", to: ROUTES.CONTACT },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-[#F9BC15] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About — 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase">About {storeName}</h4>
            <ul className="space-y-2 text-xs text-white/70">
              {[
                { label: "Our Story", to: "/about" },
                { label: "Sustainability", to: "/sustainability" },
                { label: "Careers", to: "/careers" },
                { label: "Blog & Articles", to: "/blog" },
                { label: "Business / Wholesale", to: ROUTES.REGISTER_BUSINESS },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-[#F9BC15] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* We Accept — 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase">We Accept</h4>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Visa", slug: "visa", color: "1A1F71", bg: "bg-white" },
                { label: "Mastercard", slug: "mastercard", color: "EB001B", bg: "bg-white" },
                { label: "American Express", slug: "americanexpress", color: "2E77BC", bg: "bg-white" },
                { label: "Apple Pay", slug: "applepay", color: "000000", bg: "bg-white" },
                { label: "Google Pay", slug: "googlepay", color: "4285F4", bg: "bg-white" },
                { label: "Stripe", slug: "stripe", color: "635BFF", bg: "bg-white" },
              ].map(({ label, slug, color, bg }) => (
                <div
                  key={label}
                  className={`h-9 w-14 rounded-lg ${bg} flex items-center justify-center shadow-xs border border-gray-100`}
                  title={label}
                >
                  <img
                    src={`https://cdn.simpleicons.org/${slug}/${color}`}
                    alt={label}
                    className="h-5 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              ))}


            </div>
          </div>


        </div>
      </div>

      {/* ── 3. Bottom Bar ── */}
      <div className="border-t border-white/10 bg-[#1B5641]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60">
          <span>© {currentYear} {legalName}. All rights reserved.</span>

          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center sm:justify-end">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-white/20">|</span>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <span className="text-white/20">|</span>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
            <span className="text-white/20">|</span>
            <span>
              designed & developed by{" "}
              <a
                href="https://raphaedgeai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-[#F9BC15] transition-colors"
              >
                RaphaEdge AI
              </a>
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default PublicFooter;
