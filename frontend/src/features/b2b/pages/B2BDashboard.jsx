import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useCountryStore } from "../../../stores/country.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  CreditCard,
  FileSpreadsheet,
  PackageCheck,
  Boxes,
  Building2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function B2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  const isApproved = activeCompany?.status === "APPROVED";

  return (
    <div className="space-y-6">
      {/* Header Profile Greeting */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale Portal Dashboard
            </h1>
            <Badge variant={isApproved ? "green" : "yellow"} size="sm">
              {isApproved ? "Approved Commercial Tier" : "Pending Verification"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="text-slate-800 font-semibold">{user?.firstName || "Wholesale Buyer"}</span> •{" "}
            <span className="text-emerald-700 font-bold">{activeCompany?.legalName || "AgroWholesale India Pvt Ltd"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="primary" size="sm" icon={Boxes} className="font-bold shadow-xs">
              Bulk Order Sheet
            </Button>
          </Link>
          <Link to={ROUTES.B2B.QUOTES}>
            <Button variant="outline" size="sm" icon={Plus} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Request Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Alert Banner if Not Approved */}
      {!isApproved && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-2 text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" /> Company Verification Under Review
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Our compliance team is verifying your business documentation (Tax ID & Registration). In the meantime, you can browse volume tiers and submit custom quotation requests.
            </p>
          </div>
          <Link to={ROUTES.B2B.COMPANY_DOCUMENTS}>
            <Button variant="secondary" size="sm" className="bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 text-xs">
              Check Documents
            </Button>
          </Link>
        </div>
      )}

      {/* Wholesale Commercial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Credit Limit (NET 30)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPrice(activeCompany?.availableCredit || 385000, country.currency, country.symbol)}
          </div>
          <p className="text-[11px] text-slate-400">
            Of {formatPrice(activeCompany?.creditLimit || 500000, country.currency, country.symbol)} total facility
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">2 Pending</div>
          <p className="text-[11px] text-slate-400">1 ready for order conversion</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Open Purchase Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1 In Transit</div>
          <p className="text-[11px] text-slate-400">Pallet dispatch #TRK-PLT-892</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tax Exemption / GST</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono truncate">
            {activeCompany?.taxId || "27AAACA1234A1Z1"}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Verified for B2B Invoicing</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Reorder */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Quick Reorder Favorites
            </h3>
            <Link to={ROUTES.B2B.CATALOG} className="text-xs text-emerald-700 font-semibold hover:underline">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">Royal Heritage Aged Basmati Rice (25 KG Sack)</h5>
                <p className="text-[11px] text-slate-500 font-mono">MOQ: 20 sacks • Tier 3: $1,750/sack</p>
              </div>
              <Link to={`/b2b/catalog/royal-basmati-rice-25kg`}>
                <Button variant="primary" size="sm" className="font-bold text-xs">
                  Reorder
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">Heavy-Duty Corrugated Shipping Boxes (Bundle of 50)</h5>
                <p className="text-[11px] text-slate-500 font-mono">MOQ: 10 bundles • Tier 3: $950/bundle</p>
              </div>
              <Link to={`/b2b/catalog/corrugated-shipping-boxes-50`}>
                <Button variant="primary" size="sm" className="font-bold text-xs">
                  Reorder
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Negotiation Quotes
            </h3>
            <Link to={ROUTES.B2B.QUOTES} className="text-xs text-emerald-700 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">QTE-20260228-1094</span>
                  <Badge variant="green" size="sm">Quoted (v2)</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">200 Bundles Boxes • Total: $2,18,490</p>
              </div>
              <Link to={`/b2b/quotes/qte-201`}>
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 text-xs">
                  Review & Accept
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
