import React from "react";
import { User, Building2, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export function QuickLoginSwitcher({
  onQuickLogin,
  onFillCredentials,
  loading = false,
}) {
  const accounts = [
    {
      role: "CUSTOMER",
      name: "Customer",
      email: "customer@vanom.com",
      password: "Password@123",
      icon: User,
      badge: "B2C Retail",
      colorClass: "hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      role: "B2B",
      name: "B2B Buyer",
      email: "b2b@acmecorp.com",
      password: "Password@123",
      icon: Building2,
      badge: "Commercial",
      colorClass: "hover:border-[#00875A] hover:bg-[#E6F4EA]/60 text-[#00875A]",
      iconBg: "bg-[#E6F4EA] text-[#00875A]",
    },
    {
      role: "ADMIN",
      name: "Superadmin",
      email: "admin@vanom.com",
      password: "Password@123",
      icon: ShieldCheck,
      badge: "Portal Admin",
      colorClass: "hover:border-slate-800 hover:bg-slate-50 text-slate-800",
      iconBg: "bg-slate-100 text-slate-800",
    },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#DCE8DF] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2B1C]">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Quick 1-Click Login</span>
        </div>
        <span className="text-[10px] font-semibold text-[#5E7D67] bg-[#F0F5F2] px-2 py-0.5 rounded-md">
          Dev / Demo Access
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.role}
              type="button"
              disabled={loading}
              onClick={() => onQuickLogin(acc.email, acc.password)}
              className={`p-2.5 rounded-xl border border-[#E4ECE7] bg-[#FAFDFC] transition-all cursor-pointer text-left flex flex-col justify-between group disabled:opacity-50 ${acc.colorClass}`}
              title={`Click to immediately sign in as ${acc.name}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${acc.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/80 border border-black/5">
                  {acc.badge}
                </span>
              </div>

              <div>
                <p className="font-bold text-xs text-slate-900 leading-tight">
                  {acc.name}
                </p>
                <p className="font-mono text-[10px] text-slate-500 truncate mt-0.5">
                  {acc.email}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#00875A] opacity-90 group-hover:opacity-100">
                <span>Instant Sign In</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickLoginSwitcher;
