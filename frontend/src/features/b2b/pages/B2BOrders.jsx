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
    queryKey: ["b2b-bulk-orders-list"],
    queryFn: async () => {
      try {
        const res = await Api.b2b.listBulkOrders();
        if (res?.items) return res.items;
        if (Array.isArray(res)) return res;
      } catch (err) {
        console.warn("Falling back to standard orders query", err);
      }
      const fallback = await Api.orders.list();
      return fallback?.items?.filter((o) => o.type === "B2B") || [];
    },
  });

  const orders = data || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Wholesale Orders & POs</h1>
          <p className="text-xs text-slate-500 mt-1">Track container shipments, fulfillment status, and download commercial tax invoices from dedicated BulkOrder records.</p>
        </div>

        <Link to={ROUTES.B2B.BULK_ORDER}>
          <Button variant="primary" size="sm" icon={PackageCheck} className="font-bold shadow-xs">
            Create Bulk Purchase Order
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No wholesale purchase orders found"
          description="Your company hasn't placed any bulk purchase orders yet."
          className="text-slate-600 bg-white border border-slate-200 rounded-2xl p-10"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "gray" };
            const itemsCount = order.items?.length || order.itemsCount || 1;
            const currencyCode = order.currency?.code || order.currency || "INR";
            const currencySymbol = order.currency?.symbol || "₹";

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#006B3C]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 font-mono">{order.orderNumber || `BLK-${order.id.slice(0, 8)}`}</span>
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label}
                    </Badge>
                    {order.poNumber && (
                      <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {order.poNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Placed {formatDate(order.createdAt, true)} • Facility: <strong>{order.company?.legalName || "Corporate Account"}</strong>
                  </p>
                  <p className="text-xs text-slate-700">
                    {itemsCount} product line(s) • Total:{" "}
                    <span className="font-bold text-slate-900">
                      {formatPrice(order.totalAmount, currencyCode, currencySymbol)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={FileText} className="border-slate-300 text-slate-700 hover:bg-slate-50">
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Company Organization Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Verified commercial tax details and corporate identity.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Legal Business Name</span>
            <span className="text-base font-bold text-slate-900">Apex Global Wholesale Traders Pvt Ltd</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Trading Name</span>
            <span className="text-base font-bold text-slate-900">Apex Global Wholesale</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Corporate Registration (CIN/LLP)</span>
            <span className="font-mono font-semibold text-slate-700">U01100MH2020PTC345678</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN / Tax ID</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">27AAACA1234A1Z1 (Verified)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyDocuments() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Business Documents & Compliance</h1>
          <p className="text-xs text-slate-500 mt-1">Corporate GST certificates, licenses, and tax exemption filings.</p>
        </div>
        <Button variant="primary" size="sm" className="font-bold shadow-xs">
          Upload New Document
        </Button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Document Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4">Uploaded At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="p-4 font-bold text-slate-900">GST_Certificate_2026.pdf</td>
              <td className="p-4 font-mono text-slate-500">TAX_CERTIFICATE</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-500">Jan 15, 2026</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">Certificate_of_Incorporation.pdf</td>
              <td className="p-4 font-mono text-slate-500">BUSINESS_REGISTRATION</td>
              <td className="p-4"><Badge variant="green" size="sm">Verified</Badge></td>
              <td className="p-4 text-slate-500">Jan 15, 2026</td>
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Team Members & Access</h1>
          <p className="text-xs text-slate-500 mt-1">Authorized procurement agents and corporate purchasing accounts.</p>
        </div>
        <Button variant="primary" size="sm" className="font-bold shadow-xs">
          Invite Member
        </Button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="p-4 font-bold text-slate-900">Rajesh Kulkarni</td>
              <td className="p-4 text-slate-600">buyer@apexwholesale.in</td>
              <td className="p-4"><Badge variant="default" size="sm">COMPANY_ADMIN</Badge></td>
              <td className="p-4 text-emerald-700 font-bold">Active Primary</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-900">Sunil Verma</td>
              <td className="p-4 text-slate-600">procurement@apexwholesale.in</td>
              <td className="p-4"><Badge variant="default" size="sm">COMPANY_BUYER</Badge></td>
              <td className="p-4 text-emerald-700 font-bold">Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
