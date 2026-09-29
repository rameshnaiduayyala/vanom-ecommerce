import React from "react";
import { MapPin, Truck, Warehouse } from "lucide-react";

export function CompanyAddressCard({ company }) {
  const address =
    typeof company?.address === "string"
      ? company.address
      : company?.address?.line1
      ? `${company.address.line1}, ${company.address.city || ""}, ${company.address.state || ""} ${
          company.address.postalCode || ""
        }`
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-sm transition-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-[#358B5B]" />
          <span>Fulfillment & Billing Address</span>
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">Logistics Routing</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Registered Billing Address */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Registered Legal Office</span>
          </span>
          {address ? (
            <p className="font-semibold text-slate-800 leading-relaxed">{address}</p>
          ) : (
            <p className="text-slate-400 italic">No registered office address provided yet.</p>
          )}
          <span className="text-[10px] text-slate-500 block">
            Used on official commercial invoices and tax filings.
          </span>
        </div>

        {/* Primary Logistics / Warehouse Hub */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#358B5B]" />
            <span>Inbound Freight Receiving Address</span>
          </span>
          {address ? (
            <p className="font-semibold text-slate-800 leading-relaxed">{address}</p>
          ) : (
            <p className="text-slate-400 italic">No inbound delivery address configured.</p>
          )}
          <span className="text-[10px] text-emerald-700 font-semibold block">
            Destination for freight dispatch and shipping manifests.
          </span>
        </div>
      </div>
    </div>
  );
}

export default CompanyAddressCard;
