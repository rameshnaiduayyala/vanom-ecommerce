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
  ArrowRight,
  Clock,
  ShieldCheck,
  ShieldX,
  Plus,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function B2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  const status = activeCompany?.status;

  /*
   * ============================================================
   * PENDING
   * ============================================================
   */
  if (status === "PENDING") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-xl font-black text-slate-900">
              Company Verification Pending
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-500 leading-6">
              Your business account is currently under review. Our compliance
              team is verifying your company registration and tax information.
            </p>

            {/* Company */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs text-slate-500">Company</p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {activeCompany?.legalName || "Your Company"}
              </p>

              {activeCompany?.taxId && (
                <p className="mt-1 text-xs font-mono text-slate-500">
                  Tax ID: {activeCompany.taxId}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              <Clock className="w-4 h-4" />
              Pending Admin Approval
            </div>

            {/* Logged user */}
            <p className="mt-6 text-xs text-slate-400">
              Logged in as{" "}
              <span className="font-semibold text-slate-600">
                {user?.firstName || "Wholesale Buyer"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * REJECTED
   * ============================================================
   */
  if (status === "REJECTED") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-xl font-black text-slate-900">
              Company Verification Rejected
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-500 leading-6">
              Your business registration request could not be approved.
              Please review the rejection reason and update your company
              information.
            </p>

            {/* Company */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs text-slate-500">Company</p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {activeCompany?.legalName || "Your Company"}
              </p>

              {activeCompany?.taxId && (
                <p className="mt-1 text-xs font-mono text-slate-500">
                  Tax ID: {activeCompany.taxId}
                </p>
              )}
            </div>

            {/* Rejection Reason */}
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
              <div className="flex items-center gap-2">
                <ShieldX className="w-4 h-4 text-red-600" />

                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                  Rejection Reason
                </p>
              </div>

              <p className="mt-2 text-sm text-red-900 leading-6">
                {activeCompany?.rejectionReason ||
                  "No rejection reason was provided."}
              </p>
            </div>

            {/* Status */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold">
              <ShieldX className="w-4 h-4" />
              Verification Rejected
            </div>

            {/* Update Company */}
            <div className="mt-6 flex justify-center">
              <Link to={ROUTES.B2B.COMPANY}>
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Update Company Information
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
 * ============================================================
 * PENDING
 * ============================================================
 */
  if (status === "PENDING") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-xl font-black text-slate-900">
              Company Verification Pending
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-500 leading-6">
              Your business account is currently under review. Our compliance
              team is verifying your company registration and tax information.
            </p>

            {/* Company */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs text-slate-500">Company</p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {activeCompany?.legalName || "Your Company"}
              </p>

              {activeCompany?.taxId && (
                <p className="mt-1 text-xs font-mono text-slate-500">
                  Tax ID: {activeCompany.taxId}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              <Clock className="w-4 h-4" />
              Pending Admin Approval
            </div>

            {/* Logged user */}
            <p className="mt-6 text-xs text-slate-400">
              Logged in as{" "}
              <span className="font-semibold text-slate-600">
                {user?.firstName || "Wholesale Buyer"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * SUSPENDED
   * ============================================================
   */
  if (status === "SUSPENDED") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-yellow-600" />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-xl font-black text-slate-900">
              Your Account Has Been Suspended
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-500 leading-6">
              Your business account has been suspended.
              Please review the suspension reason and contact support if you have any questions.
            </p>
            {/* Status */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold">
              <ShieldX className="w-4 h-4" />
              Suspended
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * UNKNOWN / MISSING STATUS
   * ============================================================
   */
  if (!status) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-slate-500" />
            </div>

            <h1 className="mt-5 text-xl font-black text-slate-900">
              Company Status Unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-500 leading-6">
              We couldn't determine your company verification status.
              Please refresh the page or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ONLY APPROVED COMPANIES CAN SEE THE DASHBOARD
   * ============================================================
   */

  if (status !== "APPROVED") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER PROFILE GREETING
          ====================================================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Wholesale Portal Dashboard
            </h1>

            <Badge variant="green" size="sm">
              Approved Commercial Tier
            </Badge>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Logged in as{" "}
            <span className="text-slate-800 font-semibold">
              {user?.firstName || "Wholesale Buyer"}
            </span>{" "}
            •{" "}
            <span className="text-emerald-700 font-bold">
              {activeCompany?.legalName || "AgroWholesale India Pvt Ltd"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.B2B.BULK_ORDER}>
            <Button
              variant="primary"
              size="sm"
              icon={Boxes}
              className="font-bold shadow-xs"
            >
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

      {/* ======================================================
          WHOLESALE COMMERCIAL SUMMARY CARDS
          ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Credit Limit (NET 30)
            </span>

            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {formatPrice(
              activeCompany?.availableCredit || 385000,
              country.currency,
              country.symbol
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Of{" "}
            {formatPrice(
              activeCompany?.creditLimit || 500000,
              country.currency,
              country.symbol
            )}{" "}
            total facility
          </p>
        </div>

        {/* Quotes */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Quotes
            </span>

            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-black text-slate-900">
            2 Pending
          </div>

          <p className="text-[11px] text-slate-400">
            1 ready for order conversion
          </p>
        </div>

        {/* Purchase Orders */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Open Purchase Orders
            </span>

            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-black text-slate-900">
            1 In Transit
          </div>

          <p className="text-[11px] text-slate-400">
            Pallet dispatch #TRK-PLT-892
          </p>
        </div>

        {/* Tax */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tax Exemption / GST
            </span>

            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="text-sm font-bold text-slate-900 font-mono truncate">
            {activeCompany?.taxId || "27AAACA1234A1Z1"}
          </div>

          <p className="text-[11px] text-emerald-600 font-semibold">
            Verified for B2B Invoicing
          </p>
        </div>
      </div>

      {/* ======================================================
          QUICK ACCESS GRID
          ====================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ====================================================
            QUICK REORDER
            ==================================================== */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Quick Reorder Favorites
            </h3>

            <Link
              to={ROUTES.B2B.CATALOG}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {/* Product 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Royal Heritage Aged Basmati Rice (25 KG Sack)
                </h5>

                <p className="text-[11px] text-slate-500 font-mono">
                  MOQ: 20 sacks • Tier 3: $1,750/sack
                </p>
              </div>

              <Link to="/b2b/catalog/royal-basmati-rice-25kg">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Reorder
                </Button>
              </Link>
            </div>

            {/* Product 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Heavy-Duty Corrugated Shipping Boxes (Bundle of 50)
                </h5>

                <p className="text-[11px] text-slate-500 font-mono">
                  MOQ: 10 bundles • Tier 3: $950/bundle
                </p>
              </div>

              <Link to="/b2b/catalog/corrugated-shipping-boxes-50">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Reorder
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================
            RECENT QUOTES
            ==================================================== */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Negotiation Quotes
            </h3>

            <Link
              to={ROUTES.B2B.QUOTES}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    QTE-20260228-1094
                  </span>

                  <Badge variant="green" size="sm">
                    Quoted (v2)
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  200 Bundles Boxes • Total: $2,18,490
                </p>
              </div>

              <Link to="/b2b/quotes/qte-201">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 text-xs"
                >
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