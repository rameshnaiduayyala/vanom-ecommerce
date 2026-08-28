import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { Boxes, PackageCheck, AlertTriangle } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function Inventory() {
  const warehouses = [
    { name: "Mumbai Central Warehouse", country: "India (IN)", stock: 2450, reserved: 200, available: 2250 },
    { name: "Dallas Fulfillment Center", country: "United States (US)", stock: 890, reserved: 50, available: 840 },
    { name: "London Logistics Depot", country: "United Kingdom (GB)", stock: 350, reserved: 20, available: 330 },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Multi-Warehouse Inventory Tracking</h1>
        <p className="text-xs text-text-muted">Real-time stock balance, active checkout reservations, and fulfillment capacity</p>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Warehouse Facility</th>
              <th className="p-4">Country Jurisdiction</th>
              <th className="p-4">On-Hand Balance</th>
              <th className="p-4">Checkout Reserved</th>
              <th className="p-4">Available For Sale</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {warehouses.map((wh, idx) => (
              <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-bold text-text-primary">{wh.name}</td>
                <td className="p-4 text-text-secondary">{wh.country}</td>
                <td className="p-4 font-mono font-semibold">{wh.stock}</td>
                <td className="p-4 font-mono text-amber-600">{wh.reserved}</td>
                <td className="p-4 font-mono font-black text-brand-700">{wh.available}</td>
                <td className="p-4 text-right">
                  <Badge variant="green" size="sm">Optimal Stock</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Orders() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => Api.admin.getOrders(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Master Orders & Fulfillment</h1>
        <p className="text-xs text-text-muted">Monitor B2C retail orders and B2B wholesale purchase orders</p>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Type</th>
              <th className="p-4">Customer / Company</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Payment Terms</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => {
              const statusConfig = ORDER_STATUSES[o.status] || { label: o.status, color: "gray" };

              return (
                <tr key={o.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-text-primary">{o.orderNumber}</td>
                  <td className="p-4">
                    <Badge variant={o.type === "B2B" ? "gold" : "default"} size="sm">
                      {o.type}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {o.companyName || o.shippingAddress?.name || "Direct Customer"}
                  </td>
                  <td className="p-4 text-text-muted">{formatDate(o.createdAt)}</td>
                  <td className="p-4 font-bold text-brand-700">
                    {formatPrice(o.totalAmount, o.currency, o.symbol)}
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{o.paymentTerms || "PREPAID"}</td>
                  <td className="p-4 text-right">
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
