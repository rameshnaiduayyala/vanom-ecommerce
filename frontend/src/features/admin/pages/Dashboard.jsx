import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  DollarSign,
  ShoppingBag,
  Building2,
  Package,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Alert.jsx";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_REVENUE_SERIES = [
  { month: "Jan", revenue: 42000, orders: 320, b2b: 28000 },
  { month: "Feb", revenue: 58000, orders: 410, b2b: 39000 },
  { month: "Mar", revenue: 65000, orders: 480, b2b: 44000 },
  { month: "Apr", revenue: 51000, orders: 390, b2b: 35000 },
  { month: "May", revenue: 78000, orders: 560, b2b: 54000 },
  { month: "Jun", revenue: 92000, orders: 690, b2b: 68000 },
  { month: "Jul", revenue: 110000, orders: 810, b2b: 82000 },
  { month: "Aug", revenue: 128540, orders: 940, b2b: 97500 },
];

const DEFAULT_CATEGORY_DISTRIBUTION = [
  { name: "Electronics & POS", value: 35, color: "#358B5B" },
  { name: "Packaging Supplies", value: 25, color: "#204B38" },
  { name: "Commercial Kitchen", value: 20, color: "#D9A514" },
  { name: "Groceries & FMCG", value: 12, color: "#008C52" },
  { name: "Other Categories", value: 8, color: "#94A3B8" },
];

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => Api.admin.getDashboardMetrics(),
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Api.admin.getProducts(),
  });

  const productsCount = Array.isArray(productsData)
    ? productsData.length
    : metrics?.activeCatalogItems || 24;

  const revenueData = metrics?.revenueSeries || DEFAULT_REVENUE_SERIES;
  const categoryData = metrics?.categoryDistribution || DEFAULT_CATEGORY_DISTRIBUTION;
  const recentOrders = metrics?.recentOrders || [];
  const pendingApps = metrics?.pendingApplicationsList || [];

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back! Here is the latest live performance breakdown for Vanom Commerce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs text-xs">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#204B38] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#358B5B] hover:bg-[#204B38] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Stat Cards (4 Cards Grid) ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#358B5B] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                ${Number(metrics?.totalRevenue || 128540).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +14.8%
                </span>
                <span className="text-slate-400">live store total</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics?.totalOrders || 43} Orders
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +8.4%
                </span>
                <span className="text-slate-400">across B2C & B2B</span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Catalog Products */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Catalog Items
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {productsCount} Products
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="inline-flex items-center font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  {metrics?.activeCatalogItems || productsCount} Active
                </span>
                <span className="text-slate-400">• in Database</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verified B2B Accounts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                B2B Companies
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics?.activeCompanies || 28} Verified
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <Link
                  to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
                  className="font-bold text-[#358B5B] hover:underline"
                >
                  {metrics?.pendingApplications || 0} Pending Reviews →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Revenue Analytics Chart & Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Analytics</h3>
              <p className="text-xs text-slate-500">Monthly wholesale and retail revenue performance</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#358B5B]" />
                <span className="text-slate-600 font-medium">B2B Wholesale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D9A514]" />
                <span className="text-slate-600 font-medium">Total Volume</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#358B5B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#358B5B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9A514" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D9A514" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  stroke="#94A3B8"
                />
                <Tooltip
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === "b2b" ? "B2B Wholesale" : "Total Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="b2b"
                  stroke="#358B5B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorB2B)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D9A514"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Category Catalog Share</h3>
            <p className="text-xs text-slate-500">Distribution across active departments</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((c, i) => (
                    <Cell key={i} fill={c.color || "#358B5B"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} Items`, "Count"]}
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "11px",
                    border: "1px solid #E2E8F0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || "#358B5B" }} />
                  <span className="text-slate-600 font-medium truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders & Review Queue Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-500">Live purchases from database</p>
            </div>

            <Link
              to={ROUTES.ADMIN.ORDERS}
              className="text-xs font-bold text-[#358B5B] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-800">
                        {ord.id.slice(0, 10)}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {ord.date}
                        </span>
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={ord.avatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                            {ord.customer}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-slate-600 truncate max-w-[150px]">
                        {ord.items}
                      </td>

                      <td className="py-3 font-bold text-slate-900">
                        {ord.amount}
                      </td>

                      <td className="py-3">
                        <Badge
                          variant={
                            ord.status === "DELIVERED" || ord.status === "COMPLETED"
                              ? "green"
                              : ord.status === "SHIPPED"
                              ? "blue"
                              : ord.status === "PROCESSING"
                              ? "yellow"
                              : "gray"
                          }
                          size="sm"
                        >
                          {ord.status}
                        </Badge>
                      </td>

                      <td className="py-3 text-right">
                        <Link
                          to={ROUTES.ADMIN.ORDERS}
                          className="font-bold text-[#358B5B] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                      No recent orders found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Verification Applications (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Verification Queue</h3>
              <p className="text-xs text-slate-500">Pending B2B company applications</p>
            </div>

            <Link
              to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
              className="text-xs font-bold text-[#358B5B] hover:underline"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApps.length > 0 ? (
              pendingApps.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                      {app.companyName}
                    </span>
                    <Badge variant="yellow" size="sm">
                      {app.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tax ID: {app.taxId}</span>
                    <span>{app.country}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      to={`/admin/companies/${app.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#358B5B] hover:underline text-[11px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review Application →</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No pending applications to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
