import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../../constants/routes.js";
import { SEO } from "../../../components/common/SEO.jsx";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Mail,
  Home,
  FileText,
} from "lucide-react";
import PublicFooter from "../../../layouts/public/PublicFooter.jsx";

export function BusinessPendingApprovalPage() {
  const location = useLocation();
  const companyInfo = location.state || {};
  const businessName = companyInfo.businessName || companyInfo.legalName || "Your Company";
  const adminEmail = companyInfo.adminEmail || companyInfo.email || "your registered email";

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#1E2922] flex flex-col justify-between font-sans">
      <SEO
        title="Application Submitted | Vanom Wholesale"
        description="Your B2B business application has been submitted and is currently under review by our compliance team."
        noindex={true}
      />

      {/* Top minimal header */}
      <header className="px-6 py-5 border-b border-[#E3EBE6] bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <img src="/logo.png" alt="Vanom" className="h-9 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#5E7D67]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Application Status: Under Verification
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl space-y-8">

          {/* Hero Success Card */}
          <div className="bg-white rounded-3xl border border-[#E3EBE6] p-8 sm:p-12 shadow-sm relative overflow-hidden text-center">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#00875A] shadow-inner mb-6 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F4EA] border border-[#00875A]/20 text-[#00875A] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Registration Received
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2B1C] tracking-tight">
              Thank You for Applying!
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#3E5C49] max-w-2xl mx-auto leading-relaxed">
              We have received the wholesale business onboarding application for{" "}
              <span className="font-bold text-[#0F2B1C] underline decoration-[#00875A]/40 decoration-2">
                {businessName}
              </span>.
            </p>

            {/* Professional Status Notice Banner */}
            <div className="mt-8 text-left bg-gradient-to-br from-[#FAFDFC] to-[#F2F7F4] border border-[#D5E5DC] rounded-2xl p-6 relative">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-sm">
                  <h3 className="font-bold text-[#0F2B1C]">
                    Pending Verification & Administrator Approval
                  </h3>
                  <p className="text-[#4A6755] leading-relaxed text-xs sm:text-sm">
                    To maintain trusted wholesale pricing and credit terms, our B2B compliance team is validating your registered entity details, tax identification, and administrator account (<strong>{adminEmail}</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps Timeline Grid */}
            <div className="mt-8 text-left border-t border-[#EEF3F0] pt-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E7D67] mb-5">
                What happens next?
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3EBE6]">
                  <div className="w-7 h-7 rounded-lg bg-[#00875A] text-white flex items-center justify-center text-xs font-bold mb-3">
                    1
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0F2B1C] mb-1">Compliance Review</h5>
                  <p className="text-xs text-[#5E7D67] leading-relaxed">
                    Our admin team verifies your business credentials within <strong>24 business hours</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3EBE6]">
                  <div className="w-7 h-7 rounded-lg bg-[#00875A] text-white flex items-center justify-center text-xs font-bold mb-3">
                    2
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0F2B1C] mb-1">Approval Notification</h5>
                  <p className="text-xs text-[#5E7D67] leading-relaxed">
                    You will receive an official approval confirmation email once your account is active.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E3EBE6]">
                  <div className="w-7 h-7 rounded-lg bg-[#00875A] text-white flex items-center justify-center text-xs font-bold mb-3">
                    3
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0F2B1C] mb-1">Full Wholesale Access</h5>
                  <p className="text-xs text-[#5E7D67] leading-relaxed">
                    Access tiered wholesale catalogs, credit terms, and custom quotation requests immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Support footer note */}
            <div className="mt-8 pt-6 border-t border-[#EEF3F0] flex flex-wrap items-center justify-center gap-6 text-xs text-[#5E7D67]">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#00875A]" /> Need expedited review?
              </span>
              <a href="mailto:support@vanom.com" className="flex items-center gap-1 hover:text-[#00875A] underline">
                <Mail className="w-3.5 h-3.5" /> wholesale@vanom.com
              </a>
              <span className="flex items-center gap-1 text-[#5E7D67]">
                <PhoneCall className="w-3.5 h-3.5" /> +91 (800) 555-VANOM
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

export default BusinessPendingApprovalPage;
