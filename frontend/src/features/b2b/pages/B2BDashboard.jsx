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
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { B2BStatusCard } from "./B2BStatusCard.jsx";

export function B2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();
  const status = activeCompany?.status;

  // Show status gate for any non-APPROVED state (handles PENDING, REJECTED, SUSPENDED, unknown)
  if (status !== "APPROVED") {
    return <B2BStatusCard status={status} activeCompany={activeCompany} user={user} />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale Portal Dashboard
            </h1>
            <Badge variant="green" size="sm">Approved Commercial Tier</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as{" "}
            <span className="text-slate-800 font-semibold">
              {user?.firstName || "Wholesale Buyer"}
            </span>
            {" "}•{" "}
            <span className="text-emerald-700 font-bold">
              {activeCompany?.legalName || activeCompany?.businessName || "Your Company"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button variant="primary" size="sm" icon={Boxes} className="font-bold shadow-xs">
              Bulk Order Sheet
            </Button>
          </Link>
          <Link to={ROUTES.B2B.QUOTES}>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Request Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Credit Limit (NET 30)"
          icon={<CreditCard className="w-4 h-4" />}
          iconBg="bg-amber-50 text-amber-600"
          value={formatPrice(activeCompany?.availableCredit || 385000, country.currency, country.symbol)}
          sub={`Of ${formatPrice(activeCompany?.creditLimit || 500000, country.currency, country.symbol)} total facility`}
        />
        <SummaryCard
          label="Active Quotes"
          icon={<FileSpreadsheet className="w-4 h-4" />}
          iconBg="bg-blue-50 text-blue-600"
          value="2 Pending"
          sub="1 ready for order conversion"
        />
        <SummaryCard
          label="Open Purchase Orders"
          icon={<PackageCheck className="w-4 h-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
          value="1 In Transit"
          sub="Pallet dispatch #TRK-PLT-892"
        />
        <SummaryCard
          label="Tax Exemption / GST"
          icon={<ShieldCheck className="w-4 h-4" />}
          iconBg="bg-purple-50 text-purple-600"
          value={
            <span className="text-sm font-bold font-mono truncate block">
              {activeCompany?.taxId || activeCompany?.taxRegistrationNumber || "27AAACA1234A1Z1"}
            </span>
          }
          sub={<span className="text-emerald-600 font-semibold">Verified for B2B Invoicing</span>}
        />
      </div>

      {/* ── Quick Access Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Reorder */}
        <QuickPanel title="Quick Reorder Favorites" linkTo={ROUTES.B2B.CATALOG} linkLabel="Browse All">
          <ReorderRow
            name="Royal Heritage Aged Basmati Rice (25 KG Sack)"
            meta="MOQ: 20 sacks • Tier 3: $1,750/sack"
            to="/b2b/catalog/royal-basmati-rice-25kg"
          />
          <ReorderRow
            name="Heavy-Duty Corrugated Shipping Boxes (Bundle of 50)"
            meta="MOQ: 10 bundles • Tier 3: $950/bundle"
            to="/b2b/catalog/corrugated-shipping-boxes-50"
          />
        </QuickPanel>

        {/* Recent Quotes */}
        <QuickPanel title="Recent Negotiation Quotes" linkTo={ROUTES.B2B.QUOTES} linkLabel="View All">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono">QTE-20260228-1094</span>
                <Badge variant="green" size="sm">Quoted (v2)</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                200 Bundles Boxes • Total: $2,18,490
              </p>
            </div>
            <Link to="/b2b/quotes/qte-201">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 text-xs">
                Review & Accept
              </Button>
            </Link>
          </div>
        </QuickPanel>
      </div>
    </div>
  );
}

// ── Private sub-components ────────────────────────────────────────────────────

function SummaryCard({ label, icon, iconBg, value, sub }) {
  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

function QuickPanel({ title, linkTo, linkLabel, children }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        <Link to={linkTo} className="text-xs text-emerald-700 font-semibold hover:underline">
          {linkLabel}
        </Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ReorderRow({ name, meta, to }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
      <div>
        <h5 className="text-xs font-bold text-slate-800">{name}</h5>
        <p className="text-[11px] text-slate-500 font-mono">{meta}</p>
      </div>
      <Link to={to}>
        <Button variant="primary" size="sm" className="font-bold text-xs">Reorder</Button>
      </Link>
    </div>
  );
}