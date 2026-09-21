import React from "react";
import { UserCheck, Mail, Phone, Headset, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store.js";

export function CompanyContactCard({ company }) {
  const { user } = useAuthStore();
  const contactName =
    company?.contactPersonName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "Authorized Buyer";
  const email = company?.businessEmail || company?.email || user?.email || "Not specified";
  const phone = company?.businessPhone || company?.phone || user?.phone || "Not specified";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#358B5B]" />
          <span>Authorized Representatives & Contacts</span>
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">Procurement Officer</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Primary Buyer Contact */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Primary Contact Person
          </span>
          <p className="text-sm font-bold text-slate-900">{contactName}</p>

          <div className="space-y-1.5 pt-1 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{phone}</span>
            </div>
          </div>
        </div>

        {/* Dedicated Support */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/60 space-y-2.5">
          <span className="text-emerald-800 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <Headset className="w-3.5 h-3.5" />
            <span>Wholesale Support Desk</span>
          </span>
          <p className="text-sm font-bold text-emerald-950">Vanom B2B Operations</p>

          <div className="space-y-1.5 pt-1 text-emerald-900">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono">b2b-support@vanom.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono">+1 (800) 555-VANOM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyContactCard;
