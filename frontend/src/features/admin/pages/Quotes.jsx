import React from "react";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export function AdminQuotes() {
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
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-mono font-bold">QTE-20260228-1094</td>
              <td className="p-4 font-semibold">Apex Global Wholesale Traders Pvt Ltd</td>
              <td className="p-4 font-mono">v2</td>
              <td className="p-4 font-bold text-gold-600">$2,18,490.00</td>
              <td className="p-4"><Badge variant="green" size="sm">Quoted</Badge></td>
              <td className="p-4 text-right"><Button variant="secondary" size="sm">Review Terms</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPayments() {
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
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-mono font-bold">pay_rzp_98471928</td>
              <td className="p-4 font-semibold text-brand-700">Razorpay (India)</td>
              <td className="p-4 font-bold">$1,227.64</td>
              <td className="p-4 font-mono text-text-muted">idem_1772288000_abc</td>
              <td className="p-4 text-right"><Badge variant="green" size="sm">CAPTURED</Badge></td>
            </tr>
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-mono font-bold">ch_3N8F92849182</td>
              <td className="p-4 font-semibold text-blue-700">Stripe (US / UK)</td>
              <td className="p-4 font-bold">$129.50</td>
              <td className="p-4 font-mono text-text-muted">idem_1772288120_def</td>
              <td className="p-4 text-right"><Badge variant="green" size="sm">CAPTURED</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdmUSDeports() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Financial & Tax Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">India GST Collected (Q1 2026)</span>
          <div className="text-2xl font-black text-brand-700">$4,82,450.00</div>
          <p className="text-[11px] text-text-muted">18% HSN Code 3101 compliant</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">US State Sales Tax Collected</span>
          <div className="text-2xl font-black text-brand-700">$18,420.00</div>
          <p className="text-[11px] text-text-muted">Texas & California jurisdictions</p>
        </div>
        <div className="p-5 rounded-xl bg-white border border-border space-y-2">
          <span className="text-xs font-semibold text-text-muted">UK HMRC VAT Collected</span>
          <div className="text-2xl font-black text-brand-700">£14,890.00</div>
          <p className="text-[11px] text-text-muted">Standard 20% Rate</p>
        </div>
      </div>
    </div>
  );
}

export function AdminAuditLogs() {
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
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 text-text-muted">Feb 28, 2026, 14:30:00</td>
              <td className="p-4 font-semibold text-text-primary">admin@vanom.com</td>
              <td className="p-4"><Badge variant="green" size="sm">COMPANY_APPROVED</Badge></td>
              <td className="p-4 font-mono">Company</td>
              <td className="p-4 font-mono text-text-secondary">comp-1</td>
            </tr>
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 text-text-muted">Feb 28, 2026, 11:15:00</td>
              <td className="p-4 font-semibold text-text-primary">admin@vanom.com</td>
              <td className="p-4"><Badge variant="blue" size="sm">PRICE_TIER_UPDATED</Badge></td>
              <td className="p-4 font-mono">PriceTier</td>
              <td className="p-4 font-mono text-text-secondary">tier-soil-in</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUsers() {
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
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-bold text-text-primary">Rajesh Kulkarni</td>
              <td className="p-4 text-text-secondary">buyer@apexwholesale.in</td>
              <td className="p-4"><Badge variant="gold" size="sm">B2B Wholesale</Badge></td>
              <td className="p-4 font-mono">COMPANY_ADMIN</td>
              <td className="p-4 text-right"><Badge variant="green" size="sm">ACTIVE</Badge></td>
            </tr>
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-bold text-text-primary">Ramesh Sharma</td>
              <td className="p-4 text-text-secondary">customer@example.com</td>
              <td className="p-4"><Badge variant="default" size="sm">B2C Retail</Badge></td>
              <td className="p-4 font-mono">CUSTOMER</td>
              <td className="p-4 text-right"><Badge variant="green" size="sm">ACTIVE</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCompanies() {
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
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-bold text-text-primary">Apex Global Wholesale Traders Pvt Ltd</td>
              <td className="p-4">India (IN)</td>
              <td className="p-4 font-mono text-text-secondary">27AAACA1234A1Z1</td>
              <td className="p-4 font-bold text-gold-600">$10,00,000 (NET 30)</td>
              <td className="p-4 text-right"><Badge variant="green" size="sm">APPROVED</Badge></td>
            </tr>
            <tr className="hover:bg-surface-muted/50 transition-colors">
              <td className="p-4 font-bold text-text-primary">Prime Logistics & Supplies LLC</td>
              <td className="p-4">United States (US)</td>
              <td className="p-4 font-mono text-text-secondary">EIN-82-9384721</td>
              <td className="p-4 font-bold text-gold-600">$50,000 (NET 15)</td>
              <td className="p-4 text-right"><Badge variant="yellow" size="sm">UNDER_REVIEW</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
