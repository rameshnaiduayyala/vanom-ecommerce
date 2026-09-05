import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import {
  Mail,
  Phone,
  Globe2,
  Building2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="mt-auto select-none border-t border-emerald-950/60">
      {/* ── Main Botanical Enterprise Footer ── */}
      <div className="bg-[#064027] text-slate-300 pt-16 pb-12">
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
                Global marketplace infrastructure powering direct retail delivery and commercial enterprise supply across the United States, United Kingdom, and international trade partners.
              </p>

              <div className="space-y-2 pt-1 text-xs text-emerald-100/70">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                  <span>+91 7989419864 (Mon-Sat 9AM-8PM IST)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                  <a href="mailto:ayyalarameshnaidu@gmail.com" className="hover:text-white transition-colors">
                    ayyalarameshnaidu@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                  <span>ISO 9001:2015 & PCI-DSS Level 1 Compliant</span>
                </div>
              </div>
            </div>

            {/* Column 2: Retail Departments */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Shop Departments
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-1`} className="hover:text-white transition-colors">Electronics & Tech</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-2`} className="hover:text-white transition-colors">Groceries & FMCG</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-3`} className="hover:text-white transition-colors">Industrial Packaging</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-4`} className="hover:text-white transition-colors">Commercial Kitchen</Link></li>
                <li><Link to={`${ROUTES.PRODUCTS}?category=cat-5`} className="hover:text-white transition-colors">Safety & Security</Link></li>
                <li><Link to={ROUTES.PRODUCTS} className="text-[#4ADE80] font-bold hover:underline flex items-center gap-1">All Products →</Link></li>
              </ul>
            </div>

            {/* Column 3: Commercial & Enterprise Supply */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Enterprise Commerce
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li><Link to={ROUTES.B2B.QUOTES} className="font-bold text-[#4ADE80] hover:underline flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Custom Quotations (RFQ)</Link></li>
                <li><Link to={ROUTES.B2B.BULK_ORDER} className="hover:text-white transition-colors">Bulk Volume Orders</Link></li>
                <li><Link to={ROUTES.ORDERS} className="hover:text-white transition-colors">Purchase Order Tracking</Link></li>
                <li><Link to={ROUTES.CONTACT} className="hover:text-white transition-colors">Regional Logistics SLA</Link></li>
                <li><Link to={ROUTES.B2B.COMPANY_PROFILE} className="hover:text-white transition-colors">Enterprise Account Setup</Link></li>
              </ul>
            </div>

            {/* Column 4: Compliance & Global Logistics */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Compliance & Security
              </h4>
              <ul className="space-y-2 text-xs text-emerald-100/70">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> US & UK Multi-Market Invoicing</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> Standard VAT / Tax Compliant</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> Stripe 256-Bit SSL Checkout</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> Inspected Quality Guarantee</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> Scheduled Express Logistics</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Legal & Standards Bar ── */}
      <div className="bg-[#0B3B24] border-t border-emerald-900/60 py-4 text-xs text-emerald-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Vanom Ecommerce Platforms Ltd. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-[11px]">
            <Link to={ROUTES.CONTACT} className="text-[#4ADE80] font-bold hover:underline">Contact Support</Link>
            <a href="#privacy" className="hover:text-[#4ADE80] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#4ADE80] transition-colors">Terms of Sale</a>
            <a href="#supply-chain" className="hover:text-[#4ADE80] transition-colors">Supply Chain</a>
            <Link to={ROUTES.B2B.QUOTES} className="hover:text-[#4ADE80] transition-colors">Inquire</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
