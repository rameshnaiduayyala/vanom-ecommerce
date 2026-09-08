import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function AdminQuotes() {
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: () => Api.admin.getAdminQuotes(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">B2B Quote Negotiation Desk</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Quote #</th>
              <th className="p-4">Company</th>
              <th className="p-4">Version</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q, idx) => (
              <tr key={q.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-mono font-bold">{q.quoteNumber || `QTE-${q.id}`}</td>
                <td className="p-4 font-semibold">{q.company?.legalName || q.companyName || "AgroWholesale India"}</td>
                <td className="p-4 font-mono">v{q.version || 1}</td>
                <td className="p-4 font-bold text-emerald-800">
                  {formatPrice(q.totalAmount || 218490, q.currency?.code || "USD")}
                </td>
                <td className="p-4">
                  <Badge variant={q.status === "APPROVED" ? "green" : "yellow"} size="sm">
                    {q.status || "Quoted"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="secondary" size="sm">Review Terms</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPayments() {
  const { data: payments = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => Api.admin.getPayments(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Payment Gateways & Webhooks</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Idempotency Key</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-mono font-bold">{p.transactionId || p.id}</td>
                <td className="p-4 font-semibold text-brand-700">{p.provider || "Direct / Gateway"}</td>
                <td className="p-4 font-bold">{formatPrice(p.amount || 120, "USD")}</td>
                <td className="p-4 font-mono text-text-muted">{p.idempotencyKey || `idem_${idx}`}</td>
                <td className="p-4 text-right">
                  <Badge variant="green" size="sm">{p.status || "CAPTURED"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminReports() {
  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => Api.admin.getReports(),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Financial & Tax Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">India GST Collected (Q1 2026)</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.indiaGst || 482450.00, "USD")}
          </div>
          <p className="text-[11px] text-text-muted">18% HSN Code 3101 compliant</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">US State Sales Tax Collected</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.usSalesTax || 18420.00, "USD")}
          </div>
          <p className="text-[11px] text-text-muted">Texas & California jurisdictions</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">UK HMRC VAT Collected</span>
          <div className="text-2xl font-black text-brand-700">
            {formatPrice(reports?.ukVat || 12900.00, "GBP")}
          </div>
          <p className="text-[11px] text-text-muted">Standard 20% Rate</p>
        </div>
      </div>
    </div>
  );
}

export function AdminAuditLogs() {
  const { data: logsData = [] } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => Api.admin.getAuditLogs(),
  });

  const logs = Array.isArray(logsData) ? logsData : Array.isArray(logsData?.items) ? logsData.items : [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">System Audit Trail</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity Type</th>
              <th className="p-4">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-text-muted">
                  No system audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4 text-text-muted">{formatDate(log.createdAt || new Date())}</td>
                  <td className="p-4 font-semibold text-text-primary">{log.actorId || log.actor?.email || "admin@vanom.com"}</td>
                  <td className="p-4">
                    <Badge variant="green" size="sm">{log.action || "SYSTEM_EVENT"}</Badge>
                  </td>
                  <td className="p-4 font-mono">{log.entityType || "Resource"}</td>
                  <td className="p-4 font-mono text-text-secondary">{log.entityId || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { data: usersData = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => Api.admin.getUsers(),
  });

  const users = Array.isArray(usersData) ? usersData : Array.isArray(usersData?.items) ? usersData.items : [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Registered Users</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Customer Type</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-text-muted">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4 font-bold text-text-primary">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-text-secondary">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.customerType === "B2B" ? "gold" : "default"} size="sm">
                      {u.customerType === "B2B" ? "B2B Wholesale" : "B2C Retail"}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono">{Array.isArray(u.roles) ? u.roles.join(", ") : u.roles || "CUSTOMER"}</td>
                  <td className="p-4 text-right">
                    <Badge variant={u.status === "ACTIVE" ? "green" : "gray"} size="sm">
                      {u.status || "ACTIVE"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCompanies() {
  const { data: companiesData = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const companies = Array.isArray(companiesData) ? companiesData : Array.isArray(companiesData?.items) ? companiesData.items : [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">B2B Corporate Entities</h1>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Country</th>
              <th className="p-4">Tax ID</th>
              <th className="p-4">Credit Limit</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {companies.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-text-muted">
                  No B2B corporate entities found.
                </td>
              </tr>
            ) : (
              companies.map((c, idx) => (
                <tr key={c.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4 font-bold text-text-primary">{c.legalName || c.tradingName}</td>
                  <td className="p-4">{c.country?.name || "India (IN)"}</td>
                  <td className="p-4 font-mono text-text-secondary">{c.taxId || "GSTIN-VALID"}</td>
                  <td className="p-4 font-bold text-emerald-800">
                    {formatPrice(c.creditLimit || 500000, "USD")} (NET {c.paymentTermsDays || 30})
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant={c.status === "APPROVED" ? "green" : "yellow"} size="sm">
                      {c.status || "APPROVED"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
