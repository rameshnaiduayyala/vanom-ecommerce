import React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, ShoppingBag, Building2, Package, ShieldCheck, ArrowUpRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Alert.jsx";
import { ROUTES } from "@/constants/routes.js";

function KpiCard({ label, icon, iconClass, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
      </div>
      {children}
    </div>
  );
}

export function DashboardKpiCards({ metrics, productsCount, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <KpiCard label="Total Revenue" icon={<DollarSign className="w-4 h-4" />} iconClass="bg-emerald-50 text-[#358B5B]">
        <div>
          <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">
            ${metrics?.totalRevenue != null
              ? Number(metrics.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : "0.00"}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              <ArrowUpRight className="w-3 h-3" />+14.8%
            </span>
            <span className="text-slate-400 text-[11px]">gross sales</span>
          </div>
        </div>
      </KpiCard>

      <KpiCard label="Total Orders" icon={<ShoppingBag className="w-4 h-4" />} iconClass="bg-blue-50 text-blue-600">
        <div>
          <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">{metrics?.totalOrders ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="inline-flex items-center font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">B2C & B2B</span>
            <span className="text-slate-400 text-[11px]">completed & live</span>
          </div>
        </div>
      </KpiCard>

      <KpiCard label="Active Buyers" icon={<ShieldCheck className="w-4 h-4" />} iconClass="bg-teal-50 text-teal-600">
        <div>
          <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">{metrics?.activeCustomers ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="inline-flex items-center font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-[11px]">Registered</span>
            <span className="text-slate-400 text-[11px]">active users</span>
          </div>
        </div>
      </KpiCard>

      <KpiCard label="B2B Companies" icon={<Building2 className="w-4 h-4" />} iconClass="bg-purple-50 text-purple-600">
        <div>
          <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">{metrics?.activeCompanies ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <Link to={ROUTES.ADMIN.BUSINESS_APPLICATIONS} className="font-bold text-[#358B5B] hover:underline text-[11px]">
              {metrics?.pendingApplications ?? 0} Pending →
            </Link>
          </div>
        </div>
      </KpiCard>

      <KpiCard label="Catalog Items" icon={<Package className="w-4 h-4" />} iconClass="bg-amber-50 text-amber-600">
        <div>
          <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">{metrics?.activeCatalogItems ?? productsCount}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="inline-flex items-center font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">Active</span>
            <span className="text-slate-400 text-[11px]">in Database</span>
          </div>
        </div>
      </KpiCard>
    </div>
  );
}
