import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import { toast } from "../../components/ui/Toast.jsx";
import {
  Mail,
  Phone,
  MapPin,
  Globe2,
  Building2,
  ShieldCheck,
  Truck,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success(
      "Subscribed to Trade Dispatch!",
      `Thank you. Monthly trade updates and bulk catalog specials will be sent to ${email}.`
    );
    setEmail("");
  };

  return (
    <footer className="mt-auto select-none">
      {/* ── 1. Newsletter Banner with Botanical Theme ── */}
      <div className="bg-[#F6FAF7] border-t border-[#DCE8DF] py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#074428] tracking-tight">
            Subscribe to Global Trade Dispatches & Market Insights
          </h2>

          <p className="text-xs sm:text-sm text-[#4B6357] max-w-2xl mx-auto leading-relaxed">
            Receive monthly commodity reports, wholesale price index releases, international trade regulations, and seasonal bulk availability directly to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="pt-3 max-w-xl mx-auto">
            <div className="relative flex items-center rounded-full bg-white border border-[#DCE8DF] p-1.5 shadow-sm hover:border-emerald-400 focus-within:border-[#074428] focus-within:ring-2 focus-within:ring-[#074428]/10 transition-all">
              <Mail className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your corporate or personal email..."
                className="w-full pl-3 pr-4 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-[#072115] placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 rounded-full bg-[#84CC16] hover:bg-[#74B626] text-slate-950 font-extrabold text-xs sm:text-sm transition-all hover:scale-[1.02] shadow-xs shrink-0 cursor-pointer"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 2. Main Botanical Footer ── */}
      <div className="bg-[#062E1F] text-slate-300 border-t border-emerald-950/60 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Column 1: Vanom Brand & Company Bio */}
            <div className="space-y-4 lg:col-span-2">
              <div className="inline-block bg-white rounded-xl p-3 shadow-md">
                <Link to={ROUTES.HOME} className="flex items-center gap-2">
                  <img src="/logo.png" alt="Vanom" className="h-9 w-auto object-contain" />

                </Link>
              </div>

              <p className="text-xs text-emerald-100/70 leading-relaxed max-w-sm">
                Global marketplace infrastructure powering direct B2C retail delivery and B2B wholesale pallet trade across the United States, United Kingdom, and global enterprise partners.
              </p>

              <div className="space-y-2 pt-1 text-xs text-emerald-100/70">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                  <span>+1 (800) VANOM-HQ (Mon-Sat 9AM-8PM EST)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                  <a href="mailto:procurement@vanomecommerce.com" className="hover:text-white transition-colors">
                    procurement@vanomecommerce.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span>ISO 9001:2015 & PCI-DSS Level 1 Certified</span>
                </div>
              </div>
            </div>

            {/* Column 2: Retail Departments */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Retail Departments
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-2`} className="hover:text-white transition-colors">Groceries & FMCG Bulk</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-1`} className="hover:text-white transition-colors">Electronics & POS Systems</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-3`} className="hover:text-white transition-colors">Industrial Packaging</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-4`} className="hover:text-white transition-colors">Commercial Kitchen Units</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-5`} className="hover:text-white transition-colors">Safety & Security Systems</Link></li>
                <li><Link to={ROUTES.PRODUCTS} className="text-[#84CC16] font-bold hover:underline flex items-center gap-1">All Products →</Link></li>
              </ul>
            </div>

            {/* Column 3: B2B Wholesale */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                B2B Wholesale
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li><Link to={ROUTES.B2B.ROOT} className="font-bold text-[#84CC16] hover:underline flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Wholesale Portal</Link></li>
                <li><Link to={ROUTES.B2B.BULK_ORDER} className="hover:text-white transition-colors">Bulk Order Spreadsheet</Link></li>
                <li><Link to={ROUTES.B2B.QUOTES} className="hover:text-white transition-colors">Custom Quotations (RFQ)</Link></li>
                <li><Link to={ROUTES.B2B.CATALOG} className="hover:text-white transition-colors">Pallet Tier Matrix</Link></li>
                <li><Link to={ROUTES.ORDERS} className="hover:text-white transition-colors">Purchase Order Tracking</Link></li>
                <li><Link to={ROUTES.B2B.COMPANY_PROFILE} className="hover:text-white transition-colors">NET 30 Credit Invoicing</Link></li>
              </ul>
            </div>

            {/* Column 4: Compliance & Global Logistics */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Compliance & Security
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> US State Nexus Sales Tax</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> HMRC 20% Standard VAT (UK)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> Stripe 256-Bit SSL Checkout</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> Multi-Warehouse Logistics SLA</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> Commercial Proforma Invoicing</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. Bottom Legal & Standards Bar ── */}
      <div className="bg-[#042217] border-t border-emerald-950 py-4 text-xs text-emerald-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Vanom Ecommerce Platforms Ltd. All rights reserved. Registered Enterprise Multi-Jurisdiction Portal.
          </p>

          <div className="flex items-center gap-5 text-[11px]">
            <Link to={ROUTES.CONTACT} className="text-[#84CC16] font-bold hover:underline">Contact Support</Link>
            <a href="#privacy" className="hover:text-[#84CC16] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#84CC16] transition-colors">Terms of Sale</a>
            <a href="#supply-chain" className="hover:text-[#84CC16] transition-colors">Supply Chain</a>
            <Link to={ROUTES.B2B.QUOTES} className="hover:text-[#84CC16] transition-colors">Inquire</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
