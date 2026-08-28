import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";
import { useCountryStore } from "../../stores/country.store.js";
import { toast } from "../../components/ui/Toast.jsx";
import {
  Building2,
  Mail,
  PhoneCall,
  ShieldCheck,
  Truck,
  Globe2,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export function PublicFooter() {
  const { country, setCountry } = useCountryStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    toast.success("Subscribed to Trade Dispatch!", `Welcome ${newsletterEmail}. Check your inbox for exclusive trade offers.`);
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-[#020e06] text-slate-300 border-t border-brand-900/60 mt-auto select-none">

      {/* 2. Main 5-Column Enterprise Link Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Company Profile & Global Footprint */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.png" alt="Vanom" className="h-9 w-auto object-contain rounded" />
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-wider font-mono uppercase leading-tight">
                  VANOM
                </span>
                <span className="text-[9px] font-bold text-gold-400 tracking-widest uppercase">
                  Enterprise Commerce
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed">
              Global marketplace infrastructure powering direct B2C retail delivery and B2B wholesale pallet trade across the United States, United Kingdom, and global partners.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <PhoneCall className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>+1 (800) VANOM-HQ (Mon-Sat 9AM-8PM)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>procurement@vanomecommerce.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ISO 9001:2015 Enterprise Certified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Retail Marketplaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-brand-900/80 pb-2">
              Retail Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-2`} className="text-slate-300 hover:text-white transition-colors">
                  Groceries & FMCG Bulk
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-1`} className="text-slate-300 hover:text-white transition-colors">
                  Electronics & POS Hardware
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-3`} className="text-slate-300 hover:text-white transition-colors">
                  Industrial Packaging
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-4`} className="text-slate-300 hover:text-white transition-colors">
                  Commercial Kitchen
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-5`} className="text-slate-300 hover:text-white transition-colors">
                  Safety & Security Systems
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-6`} className="text-slate-300 hover:text-white transition-colors">
                  Building & Hardware
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: B2B Wholesale & Freight Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-brand-900/80 pb-2">
              B2B Wholesale
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={ROUTES.B2B.ROOT} className="font-bold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Wholesale Portal</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.BULK_ORDER} className="text-slate-300 hover:text-white transition-colors">
                  Bulk Spreadsheet Order
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.QUOTES} className="text-slate-300 hover:text-white transition-colors">
                  Custom Quotations (RFQ)
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.CATALOG} className="text-slate-300 hover:text-white transition-colors">
                  Pallet Tier Matrix
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.ORDERS} className="text-slate-300 hover:text-white transition-colors">
                  Purchase Order Tracking
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.COMPANY_PROFILE} className="text-slate-300 hover:text-white transition-colors">
                  NET 30 Credit Lines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Global Logistics */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-brand-900/80 pb-2">
              Compliance & Tax
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>US State Nexus Sales Tax</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>HMRC 20% Standard VAT (UK)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Stripe Idempotent Checkout</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Multi-Warehouse Logistics SLA</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant Commercial Tax Invoice</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Market Switcher & Account Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-brand-900/80 pb-2">
              Active Currency & Market
            </h4>
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-300 leading-tight">
                Current Market: <strong className="text-white">{country.name} ({country.currency} • {country.symbol})</strong>
              </p>

              <div className="grid grid-cols-1 gap-1.5">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c);
                      toast.info("Market Jurisdiction Changed", `Active marketplace set to ${c.name} (${c.currency})`);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${country.code === c.code
                      ? "bg-brand-900/80 border-brand-500 text-brand-300 shadow-xs"
                      : "bg-[#03140a] border-brand-900/70 text-slate-300 hover:text-white hover:border-brand-600"
                      }`}
                  >
                    <span>{c.flag} {c.name}</span>
                    <span className="font-mono text-[11px] font-bold text-gold-400">{c.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Security, Payment Standards & Compliance Badges */}
      <div className="border-t border-brand-900/60 bg-[#010904] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Enterprise Standards:
              </span>
              <div className="flex items-center gap-1.5 bg-[#03160a] border border-brand-900/80 px-2.5 py-1 rounded-md text-[11px]">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#03160a] border border-brand-900/80 px-2.5 py-1 rounded-md text-[11px]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>PCI-DSS Level 1 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#03160a] border border-brand-900/80 px-2.5 py-1 rounded-md text-[11px]">
                <Truck className="w-3 h-3 text-gold-400" />
                <span>Pallet Freight Tracked</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
              <span className="px-2 py-0.5 rounded bg-[#03160a] border border-brand-900/80 text-emerald-300">Stripe</span>
              <span className="px-2 py-0.5 rounded bg-[#03160a] border border-brand-900/80">Visa / Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-[#03160a] border border-brand-900/80 text-gold-400">NET 30 Invoicing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright & Legal Links */}
      <div className="border-t border-brand-950 bg-black py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <p>© {new Date().getFullYear()} Vanom Ecommerce Platforms Ltd. All rights reserved. Registered Enterprise Multi-Jurisdiction Portal.</p>
            <div className="flex items-center gap-4">
              <a href="#privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:text-gold-400 transition-colors">Terms of Commercial Sale</a>
              <span>•</span>
              <a href="#supply-chain" className="hover:text-gold-400 transition-colors">Supply Chain Transparency</a>
              <span>•</span>
              <a href="#tax-disclosures" className="hover:text-gold-400 transition-colors">Tax Disclosures</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
