import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { useCountryStore } from "../../stores/country.store.js";
import { formatPrice } from "../../utils/formatters.js";
import { ROUTES } from "../../constants/routes.js";
import {
  Building2,
  CreditCard,
  Globe,
  LogOut,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";

export function B2BHeader() {
  const navigate = useNavigate();
  const { user, activeCompany, logout } = useAuthStore();
  const { country, setCountry } = useCountryStore();

  const isApproved = activeCompany?.status === "APPROVED";

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* B2B Branding & Company Context */}
        <div className="flex items-center gap-4">
          <Link to={ROUTES.B2B.DASHBOARD} className="flex items-center gap-3">
            <img src="/logo.png" alt="Vanom" className="h-8 w-auto object-contain" />
            <div className="border-l border-slate-700 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider text-gold-400 uppercase">Wholesale</span>
                <Badge variant={isApproved ? "gold" : "yellow"} size="sm">
                  {isApproved ? "Approved Tier" : "Pending Verification"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                {activeCompany?.legalName || "AgroWholesale India Pvt Ltd"}
              </p>
            </div>
          </Link>
        </div>

        {/* B2B Top Metrics & Controls */}
        <div className="flex items-center gap-4">
          {/* Credit Account Display */}
          {isApproved && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <CreditCard className="w-4 h-4 text-gold-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Available Credit (NET 30)</span>
                <span className="font-bold text-gold-400">
                  {formatPrice(activeCompany?.availableCredit || 385000, country.currency, country.symbol)}
                </span>
              </div>
            </div>
          )}

          {/* Regional Market Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs border border-slate-700">
            <span>{country.flag}</span>
            <select
              value={country.code}
              onChange={(e) => {
                const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
                if (found) setCountry(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code} ({c.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Switch to Retail or Sign Out */}
          <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
            <Link
              to={ROUTES.HOME}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Return to Retail Storefront"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Retail</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
              }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
