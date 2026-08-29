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
  Lock,
  ArrowRight,
  Globe2,
} from "lucide-react";

export function PublicFooter() {
  const { country, setCountry } = useCountryStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success("Subscribed!", `You will receive commercial updates at ${newsletterEmail}`);
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-[#001730] text-slate-300 border-t border-[#00244c] mt-auto select-none">


      {/* ── 2. Main 5-Column Navigation Grid ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Column 1: Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.png" alt="Vanom" className="h-9 w-auto object-contain rounded-md" />
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-wider font-mono uppercase leading-tight">
                  VANOM
                </span>
                <span className="text-[9px] font-bold text-[#FFE000] tracking-widest uppercase">
                  Global Commerce
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Global marketplace powering direct B2C retail delivery and wholesale B2B pallet supply across the United States & United Kingdom.
            </p>

            <div className="space-y-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#FFE000] shrink-0" />
                <span>+91 79894 19864</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FFE000] shrink-0" />
                <span>procurement@vanomecommerce.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ISO 9001:2015 Enterprise Certified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Retail Catalog */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#003876] pb-2">
              Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-1`} className="text-slate-300 hover:text-white transition-colors">
                  TV & Electronics
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-4`} className="text-slate-300 hover:text-white transition-colors">
                  Commercial Appliances
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-3`} className="text-slate-300 hover:text-white transition-colors">
                  Industrial Packaging
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-2`} className="text-slate-300 hover:text-white transition-colors">
                  Groceries & FMCG Sacks
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.PRODUCTS}?category=cat-5`} className="text-slate-300 hover:text-white transition-colors">
                  Security & PoE CCTV
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: B2B Wholesale */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#003876] pb-2">
              B2B Wholesale
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={ROUTES.B2B.ROOT} className="font-bold text-[#FFE000] hover:underline flex items-center gap-1.5">
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
                  Request a Quote (RFQ)
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.ORDERS} className="text-slate-300 hover:text-white transition-colors">
                  Purchase Order Status
                </Link>
              </li>
              <li>
                <Link to={ROUTES.B2B.COMPANY_PROFILE} className="text-slate-300 hover:text-white transition-colors">
                  NET 30 Corporate Credit
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Service & Orders */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#003876] pb-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/orders/track" className="hover:text-white transition-colors">
                  Track Your Package
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Shipping Rates & Logistics
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Tax Invoices (GST / VAT)
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Active Jurisdiction */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-[#003876] pb-2">
              Market & Currency
            </h4>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                Active Market: <strong className="text-white">{country.name} ({country.currency})</strong>
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c);
                      toast.info("Market Jurisdiction Changed", `Active marketplace set to ${c.name} (${c.currency})`);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${country.code === c.code
                        ? "bg-[#003876] border-[#FFE000] text-white shadow-xs"
                        : "bg-[#001730] border-[#002e5c] text-slate-300 hover:text-white hover:border-slate-500"
                      }`}
                  >
                    <span>{c.flag} {c.name}</span>
                    <span className="font-mono text-[11px] font-bold text-[#FFE000]">{c.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. Security & Payment Badges Bar ── */}
      <div className="border-t border-[#00244c] bg-[#001124] py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-[#FFE000]" />
              <span>Live Pallet Tracking</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="px-2.5 py-1 rounded bg-[#001c38] border border-[#003876] text-white">Stripe</span>
            <span className="px-2.5 py-1 rounded bg-[#001c38] border border-[#003876] text-white">Visa / Mastercard</span>
            <span className="px-2.5 py-1 rounded bg-[#001c38] border border-[#003876] text-[#FFE000] font-bold">NET 30</span>
          </div>
        </div>
      </div>

      {/* ── 4. Copyright & Legal ── */}
      <div className="border-t border-[#000d1c] bg-[#000b17] py-3.5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Vanom Ecommerce Platforms Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-[#FFE000] transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-[#FFE000] transition-colors">Terms of Sale</a>
            <span>•</span>
            <a href="#supply-chain" className="hover:text-[#FFE000] transition-colors">Supply Chain</a>
            <span>•</span>
            <a href="#tax-disclosures" className="hover:text-[#FFE000] transition-colors">Tax Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
