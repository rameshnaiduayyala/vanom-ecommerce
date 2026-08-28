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
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card.jsx";

export function B2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  const isApproved = activeCompany?.status === "APPROVED";

  return (
    <div className="space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Wholesale Portal Dashboard
            </h1>
            <Badge variant={isApproved ? "gold" : "yellow"} size="sm">
              {isApproved ? "Approved Commercial Tier" : "Pending Verification"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-white font-medium">{user?.firstName || "Wholesale Buyer"}</span> •{" "}
            <span className="text-gold-400 font-semibold">{activeCompany?.legalName || "AgroWholesale India Pvt Ltd"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="gold" size="sm" icon={Boxes} className="font-bold text-slate-900 shadow-sm">
              Bulk Order Sheet
            </Button>
          </Link>
          <Link to={ROUTES.B2B.QUOTES}>
            <Button variant="outline" size="sm" icon={Plus} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Request Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Alert Banner if Not Approved */}
      {!isApproved && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Company Verification Under Review
            </h4>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Our compliance team is verifying your business documentation (Tax ID & Registration). In the meantime, you can browse volume tiers and submit custom quotation requests.
            </p>
          </div>
          <Link to={ROUTES.B2B.COMPANY_DOCUMENTS}>
            <Button variant="secondary" size="sm" className="bg-amber-900/60 border-amber-700 text-amber-100 hover:bg-amber-800 text-xs">
              Check Documents
            </Button>
          </Link>
        </div>
      )}

      {/* Wholesale Commercial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Credit Limit (NET 30)</span>
            <CreditCard className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-black text-gold-400">
            {formatPrice(activeCompany?.availableCredit || 385000, country.currency, country.symbol)}
          </div>
          <p className="text-[11px] text-slate-400">
            Of {formatPrice(activeCompany?.creditLimit || 500000, country.currency, country.symbol)} total approved facility
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Quotes</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">2 Pending</div>
          <p className="text-[11px] text-slate-400">1 ready for order conversion</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Open Purchase Orders</span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">1 In Transit</div>
          <p className="text-[11px] text-slate-400">Pallet freight dispatch #TRK-PLT-892</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tax Exemption / GST</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate">
            {activeCompany?.taxId || "27AAACA1234A1Z1"}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">Verified for B2B Invoicing</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Reorder */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Reorder Favorites
            </h3>
            <Link to={ROUTES.B2B.CATALOG} className="text-xs text-gold-400 hover:underline">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-semibold text-white">Premium Organic Garden Soil (50 KG Sack)</h5>
                <p className="text-[11px] text-slate-400 font-mono">MOQ: 20 sacks • Tier 3: ₹350/sack</p>
              </div>
              <Link to={`/b2b/catalog/premium-garden-soil`}>
                <Button variant="gold" size="sm" className="font-bold text-slate-900 text-xs">
                  Reorder
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-semibold text-white">Architectural Ceramic Planter (Box of 12)</h5>
                <p className="text-[11px] text-slate-400 font-mono">MOQ: 10 boxes • Tier 3: ₹850/box</p>
              </div>
              <Link to={`/b2b/catalog/architectural-ceramic-planter`}>
                <Button variant="gold" size="sm" className="font-bold text-slate-900 text-xs">
                  Reorder
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Negotiation Quotes
            </h3>
            <Link to={ROUTES.B2B.QUOTES} className="text-xs text-gold-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">QTE-20260228-1094</span>
                  <Badge variant="green" size="sm">Quoted (v2)</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">400 Sacks Soil • Total: ₹1,62,940</p>
              </div>
              <Link to={`/b2b/quotes/qte-201`}>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 text-xs">
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
