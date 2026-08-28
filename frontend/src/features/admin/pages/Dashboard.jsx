import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
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
  TrendingUp,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const REVENUE_DATA = [
  { day: "Mon", b2c: 125000, b2b: 340000, total: 465000 },
  { day: "Tue", b2c: 148000, b2b: 420000, total: 568000 },
  { day: "Wed", b2c: 132000, b2b: 510000, total: 642000 },
  { day: "Thu", b2c: 195000, b2b: 620000, total: 815000 },
  { day: "Fri", b2c: 210000, b2b: 780000, total: 990000 },
  { day: "Sat", b2c: 280000, b2b: 490000, total: 770000 },
  { day: "Sun (Today)", b2c: 310000, b2b: 975400, total: 1285400 },
];

const REGIONAL_SPLIT = [
  { name: "India (INR)", value: 58, color: "#008522" },
  { name: "United States (USD)", value: 27, color: "#D9A000" },
  { name: "United Kingdom (GBP)", value: 15, color: "#2563EB" },
];

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

      {/* Interactive Charts with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Analytics Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                7-Day Revenue Velocity (B2C Retail vs B2B Wholesale)
              </h3>
            </div>
            <Badge variant="brand" size="sm">Live Analytics</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="b2bColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008522" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#008522" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="b2cColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9A000" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9A000" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E2" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#7A847A" />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  stroke="#7A847A"
                />
                <Tooltip
                  formatter={(val, name) => [
                    `₹${val.toLocaleString()}`,
                    name === "b2b" ? "B2B Wholesale" : "B2C Retail",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #E2E8E2",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="b2b"
                  stroke="#008522"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#b2bColor)"
                  name="b2b"
                />
                <Area
                  type="monotone"
                  dataKey="b2c"
                  stroke="#D9A000"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#b2cColor)"
                  name="b2c"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Market Distribution Donut */}
        <div className="p-6 rounded-2xl bg-white border border-border space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Regional Market Split
            </h3>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REGIONAL_SPLIT}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {REGIONAL_SPLIT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, "Share"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-border text-xs">
            {REGIONAL_SPLIT.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-text-secondary">{r.name}</span>
                </div>
                <span className="font-bold text-text-primary">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <h5 className="text-xs font-bold text-text-primary">Prime Logistics & Supplies LLC</h5>
              <p className="text-[11px] text-text-muted">EIN: 82-9384721 • United States • NET 15 Terms</p>
            </div>
            <Link to={`/admin/companies/comp-2`}>
              <Button variant="primary" size="sm" className="text-xs font-semibold">
                Review Documents
              </Button>
            </Link>
          </div>
        </div>

        {/* Multi-Warehouse Stock Health */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Multi-Warehouse Inventory Health
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span>Mumbai Central Warehouse (India)</span>
              <span className="font-bold">5,200 sacks available</span>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span>Dallas Fulfillment Center (USA)</span>
              <span className="font-bold">3,400 bundles available</span>
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
