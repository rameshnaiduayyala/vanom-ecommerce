import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { BRAND_COLORS } from "../../../constants/colors.js";
import {
  DollarSign,
  ShoppingBag,
  Building2,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
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
} from "recharts";

const REVENUE_SERIES = [
  { month: "Jan", revenue: 42000, orders: 320, b2b: 28000 },
  { month: "Feb", revenue: 58000, orders: 410, b2b: 39000 },
  { month: "Mar", revenue: 65000, orders: 480, b2b: 44000 },
  { month: "Apr", revenue: 51000, orders: 390, b2b: 35000 },
  { month: "May", revenue: 78000, orders: 560, b2b: 54000 },
  { month: "Jun", revenue: 92000, orders: 690, b2b: 68000 },
  { month: "Jul", revenue: 110000, orders: 810, b2b: 82000 },
  { month: "Aug", revenue: 128540, orders: 940, b2b: 97500 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "Electronics & POS", value: 35, color: "#006B3C" },
  { name: "Packaging Supplies", value: 25, color: "#003D2B" },
  { name: "Commercial Kitchen", value: 20, color: "#D9A514" },
  { name: "Groceries & FMCG", value: 12, color: "#008C52" },
  { name: "Other Categories", value: 8, color: "#94A3B8" },
];

const RECENT_ORDERS = [
  {
    id: "ORD-94821",
    customer: "Global Hospitality Corp",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    items: "3500W Induction Cooktop (x4)",
    amount: "$340.00",
    status: "DELIVERED",
    date: "10 mins ago",
    type: "B2B",
  },
  {
    id: "ORD-94820",
    customer: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
    items: "3-Ply Heavy-Duty Shipping Boxes (x10)",
    amount: "$165.00",
    status: "PROCESSING",
    date: "35 mins ago",
    type: "B2C",
  },
  {
    id: "ORD-94819",
    customer: "Apex Retailers Ltd",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    items: "Commercial POS Barcode Terminals (x8)",
    amount: "$1,890.00",
    status: "SHIPPED",
    date: "2 hours ago",
    type: "B2B",
  },
  {
    id: "ORD-94818",
    customer: "Michael Zhang",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    items: "High-Capacity Soil Conditioners (x50)",
    amount: "$750.00",
    status: "DELIVERED",
    date: "4 hours ago",
    type: "B2C",
  },
  {
    id: "ORD-94817",
    customer: "Nordic Hotel Group",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    items: "Glazed Architectural Planters (x24)",
    amount: "$2,450.00",
    status: "PENDING",
    date: "6 hours ago",
    type: "B2B",
  },
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
    : productsData?.items?.length || 24;

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, Ramesh! Here is the latest performance breakdown for Vanom Commerce.
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
                    ? "bg-[#003D2B] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#006B3C] hover:bg-[#00522E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006B3C] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics?.revenueToday || "$128,540.00"}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +14.8%
                </span>
                <span className="text-slate-400">vs last month</span>
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
                {metrics?.activeOrdersCount ? `${metrics.activeOrdersCount} Orders` : "1,482"}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="inline-flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +8.4%
                </span>
                <span className="text-slate-400">vs last month</span>
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
                  9 Categories
                </span>
                <span className="text-slate-400">• Active</span>
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
                {metrics?.totalB2BCompanies ? `${metrics.totalB2BCompanies} Verified` : "48 Verified"}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <Link
                  to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
                  className="font-bold text-[#006B3C] hover:underline"
                >
                  {metrics?.pendingCompanyVerifications || 3} Pending Reviews →
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
                <span className="w-3 h-3 rounded-full bg-[#006B3C]" />
                <span className="text-slate-600 font-medium">B2B Wholesale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D9A514]" />
                <span className="text-slate-600 font-medium">B2C Retail</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_SERIES}>
                <defs>
                  <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006B3C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006B3C" stopOpacity={0.0} />
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
                  stroke="#006B3C"
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
            <h3 className="text-base font-bold text-slate-900">Category Sales Share</h3>
            <p className="text-xs text-slate-500">Distribution across active departments</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, "Share"]}
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
            {CATEGORY_DISTRIBUTION.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{item.value}%</span>
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
              <p className="text-xs text-slate-500">Real-time storefront and enterprise purchases</p>
            </div>

            <Link
              to={ROUTES.ADMIN.ORDERS}
              className="text-xs font-bold text-[#006B3C] hover:underline flex items-center gap-1"
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
                {RECENT_ORDERS.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-800">
                      {ord.id}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {ord.date}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ord.avatar}
                          alt={ord.customer}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{ord.customer}</p>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              ord.type === "B2B"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {ord.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 max-w-[200px] truncate">{ord.items}</td>
                    <td className="py-3 font-bold text-slate-900">{ord.amount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700"
                            : ord.status === "SHIPPED"
                            ? "bg-blue-50 text-blue-700"
                            : ord.status === "PROCESSING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={ROUTES.ADMIN.ORDERS}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Review / B2B Applications (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Review Queue</h3>
              <p className="text-xs text-slate-500">Pending enterprise applications</p>
            </div>

            <Link
              to={ROUTES.ADMIN.BUSINESS_APPLICATIONS}
              className="text-xs font-bold text-[#006B3C] hover:underline"
            >
              All (3)
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Prime Logistics & Supplies LLC
                  </h4>
                  <p className="text-[11px] text-slate-500">United States • NET 15 Terms</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                  Pending
                </span>
              </div>
              <Link
                to={`/admin/companies/comp-2`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:underline pt-1"
              >
                <span>Review Verification Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Kavya Agricultural Exporters Ltd
                  </h4>
                  <p className="text-[11px] text-slate-500">India • GSTIN: 27AABCV1234F1Z5</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                  Pending
                </span>
              </div>
              <Link
                to={`/admin/companies/comp-1`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#006B3C] hover:underline pt-1"
              >
                <span>Review Verification Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
