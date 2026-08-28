import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  DollarSign,
  ShoppingBag,
  Building2,
  Users,
  AlertTriangle,
  FileCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";

export function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => Api.admin.getDashboardMetrics(),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Executive Dashboard</h1>
          <p className="text-xs text-text-muted">Enterprise B2C Retail & B2B Wholesale Control Plane</p>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-border space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Gross Revenue (Today)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.revenueToday}</div>
            <span className="text-xs text-emerald-600 font-semibold">{metrics?.revenueGrowth} vs yesterday</span>
          </div>

          <div className="p-5 rounded-xl bg-white border border-border space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Active Orders</span>
              <ShoppingBag className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.activeOrdersCount}</div>
            <span className="text-xs text-text-muted">{metrics?.b2bOrdersCount} B2B Freight Orders</span>
          </div>

          <div className="p-5 rounded-xl bg-white border border-border space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Pending Verifications</span>
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{metrics?.pendingCompanyVerifications}</div>
            <Link to={ROUTES.ADMIN.BUSINESS_APPLICATIONS} className="text-xs text-brand-600 font-semibold hover:underline block">
              Review Queue →
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-white border border-border space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Wholesale Companies</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.totalB2BCompanies}</div>
            <span className="text-xs text-text-muted">{metrics?.totalCustomers} Retail Buyers</span>
          </div>
        </div>
      )}

      {/* Actionable Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Applications Box */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Wholesale Application Review Queue
            </h3>
            <Link to={ROUTES.ADMIN.BUSINESS_APPLICATIONS} className="text-xs text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted border border-border flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-text-primary">GreenHaven Landscaping LLC</h5>
              <p className="text-[11px] text-text-muted">EIN: 82-9384721 • United States • NET 15 Terms</p>
            </div>
            <Link to={`/admin/companies/comp-2`}>
              <Button variant="primary" size="sm" className="text-xs font-semibold">
                Review Documents
              </Button>
            </Link>
          </div>
        </div>

        {/* System Operations Notice */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Multi-Warehouse Inventory Health
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span>Mumbai Central Warehouse (India)</span>
              <span className="font-bold">2,450 sacks available</span>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span>Dallas Fulfillment Center (USA)</span>
              <span className="font-bold">890 boxes available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => Api.admin.getBusinessApplications(),
  });

  const companies = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">B2B Business Applications</h1>
        <p className="text-xs text-text-muted">Review corporate tax certificates and approve wholesale credit facilities</p>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Country</th>
              <th className="p-4">Tax ID / GST</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {companies.map((comp) => (
              <tr key={comp.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-bold text-text-primary">{comp.legalName}</td>
                <td className="p-4">{comp.country} ({comp.countryCode})</td>
                <td className="p-4 font-mono text-text-secondary">{comp.taxId}</td>
                <td className="p-4">
                  <Badge variant={comp.status === "APPROVED" ? "green" : "yellow"} size="sm">
                    {comp.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/admin/companies/${comp.id}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      Review Dossier
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
