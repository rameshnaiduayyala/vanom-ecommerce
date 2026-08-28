import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { PackageCheck, ArrowRight, Clock, FileText } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

export function B2BOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["b2b-orders-list"],
    queryFn: () => Api.orders.list(),
  });

  const orders = data?.items?.filter((o) => o.type === "B2B") || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wholesale Orders & POs</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No wholesale orders found"
          description="Your company hasn't placed any purchase orders yet."
          className="text-slate-300"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "gray" };

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gold-500/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono">{order.orderNumber}</span>
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label}
                    </Badge>
                    {order.poNumber && (
                      <span className="text-xs text-gold-400 font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded">
                        {order.poNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Placed {formatDate(order.createdAt, true)} • Terms: <strong>{order.paymentTerms || "NET_30"}</strong>
                  </p>
                  <p className="text-xs text-slate-300">
                    {order.itemsCount || 200} units (Palletized) • Total:{" "}
                    <span className="font-bold text-gold-400">
                      {formatPrice(order.totalAmount, order.currency, order.symbol)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={FileText} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    Tax Invoice
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CompanyProfile() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Company Organization Profile</h1>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Legal Business Name</span>
            <span className="text-base font-bold">Apex Global Wholesale Traders Pvt Ltd</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Trading Name</span>
            <span className="text-base font-bold">Apex Global Wholesale</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Corporate Registration (CIN/LLP)</span>
            <span className="font-mono font-semibold text-slate-200">U01100MH2020PTC345678</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">GSTIN / Tax ID</span>
            <span className="font-mono font-bold text-gold-400">27AAACA1234A1Z1 (Verified)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyDocuments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Documents & Compliance</h1>
        </div>
        <Button variant="gold" size="sm" className="font-bold text-slate-900">
          Upload New Document
        </Button>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs text-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-400 text-[11px] uppercase font-semibold">
            <tr>
              <th className="p-4">Document Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4">Uploaded At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            <tr>
              <td className="p-4 font-semibold text-white">GST_Certificate_2026.pdf</td>
              <td className="p-4 font-mono text-slate-400">TAX_CERTIFICATE</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-400">Jan 15, 2026</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Certificate_of_Incorporation.pdf</td>
              <td className="p-4 font-mono text-slate-400">BUSINESS_REGISTRATION</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-400">Jan 15, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompanyMembers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team Members & Access</h1>
        </div>
        <Button variant="gold" size="sm" className="font-bold text-slate-900">
          Invite Member
        </Button>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs text-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-400 text-[11px] uppercase font-semibold">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            <tr>
              <td className="p-4 font-bold text-white">Rajesh Kulkarni</td>
              <td className="p-4 text-slate-300">buyer@apexwholesale.in</td>
              <td className="p-4"><Badge variant="gold" size="sm">COMPANY_ADMIN</Badge></td>
              <td className="p-4 text-emerald-400 font-semibold">Active Primary</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-white">Sunil Verma</td>
              <td className="p-4 text-slate-300">procurement@apexwholesale.in</td>
              <td className="p-4"><Badge variant="default" size="sm">COMPANY_BUYER</Badge></td>
              <td className="p-4 text-emerald-400 font-semibold">Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
