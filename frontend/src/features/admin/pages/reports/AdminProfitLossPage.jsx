import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Truck,
  CreditCard,
  Building2,
  ShoppingBag,
  Download,
  Printer,
  Calendar,
  Loader2,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";

const TIME_RANGES = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

export function AdminProfitLossPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: reportData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-profit-loss", timeRange],
    queryFn: () => Api.admin.getProfitLossReport({ timeRange }),
    staleTime: 60 * 1000,
  });

  const summary = reportData?.data?.summary || {
    grossSales: 0,
    discounts: 0,
    refunds: 0,
    netSales: 0,
    totalBilled: 0,
    cogs: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    operatingExpenses: {
      shippingFulfillment: 0,
      paymentProcessingFees: 0,
      packagingHandling: 0,
      total: 0,
    },
    taxesCollected: {
      total: 0,
      indiaGst: 0,
      usSalesTax: 0,
      ukVat: 0,
    },
    netProfit: 0,
    netMarginPct: 0,
    ordersCount: 0,
  };

  const channels = reportData?.data?.channels || {
    b2b: { revenue: 0, ordersCount: 0, avgOrderValue: 0 },
    b2c: { revenue: 0, ordersCount: 0, avgOrderValue: 0 },
  };

  const timeline = reportData?.data?.timeline || [];
  const productProfitability = reportData?.data?.productProfitability || [];

  const isProfitable = summary.netProfit >= 0;

  // Format currency helper
  const fmt = (val) =>
    `$${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Export structured P&L Statement to CSV
  const handleExportCSV = () => {
    const rows = [
      ["VANOM ENTERPRISE - PROFIT & LOSS STATEMENT"],
      [`Generated at: ${new Date().toLocaleString()}`],
      [`Time Period: ${timeRange.toUpperCase()}`],
      [""],
      ["FINANCIAL LINE ITEM", "AMOUNT (USD)", "NOTES / RATIO"],
      ["1. OPERATING REVENUE"],
      ["Gross Product Sales", summary.grossSales, "Total catalog product orders"],
      ["Discounts & Coupons Given (-)", -summary.discounts, "Promotional reductions"],
      ["Customer Refunds & Returns (-)", -summary.refunds, "Cancelled/Refunded transactions"],
      ["NET PRODUCT SALES", summary.netSales, "Net operating sales"],
      [""],
      ["2. COST OF GOODS SOLD (COGS)"],
      ["Direct Product Base Cost (-)", -summary.cogs, "Cost of fulfilled inventory"],
      ["GROSS PROFIT", summary.grossProfit, `Gross Margin: ${summary.grossMarginPct}%`],
      [""],
      ["3. OPERATING & LOGISTICS EXPENSES"],
      ["Shipping & Carrier Fulfillment (-)", -summary.operatingExpenses.shippingFulfillment, "Freight charges"],
      ["Payment Gateway Processing Fees (-)", -summary.operatingExpenses.paymentProcessingFees, "Stripe / Card merchant fees"],
      ["Warehouse & Packaging Depot (-)", -summary.operatingExpenses.packagingHandling, "Depot operations"],
      ["TOTAL OPERATING EXPENSES (-)", -summary.operatingExpenses.total, ""],
      [""],
      ["4. TAXES COLLECTED & REMITTED"],
      ["Total Taxes Collected", summary.taxesCollected.total, "GST, VAT & Sales Taxes"],
      ["India GST Component", summary.taxesCollected.indiaGst, ""],
      ["US Sales Tax Component", summary.taxesCollected.usSalesTax, ""],
      ["UK VAT Component", summary.taxesCollected.ukVat, ""],
      [""],
      ["5. NET OPERATING PROFIT / (LOSS)"],
      ["NET EARNINGS", summary.netProfit, `Net Profit Margin: ${summary.netMarginPct}%`],
      [""],
      ["CHANNEL PERFORMANCE"],
      ["Channel", "Orders Count", "Gross Revenue (USD)", "Average Order Value (USD)"],
      ["B2B Wholesale", channels.b2b.ordersCount, channels.b2b.revenue, channels.b2b.avgOrderValue],
      ["B2C Retail", channels.b2c.ordersCount, channels.b2c.revenue, channels.b2c.avgOrderValue],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vanom_profit_loss_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header & Global Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00875A] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </span>
              Profit & Loss Financial Statement
            </h1>
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#006B3C] text-[11px] font-bold border border-emerald-200/80 shadow-2xs animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-[#006B3C]" />
                Calculating...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time accounting audit of gross revenue, COGS, fulfillment, payment fees, margins and net income.
          </p>
        </div>

        {/* Action Buttons & Time Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range pills */}
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 hidden sm:block" />
            {TIME_RANGES.map((opt) => {
              const active = timeRange === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeRange(opt.value)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    active
                      ? "bg-[#00875A] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="text-xs font-bold cursor-pointer"
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
            className="text-xs font-bold cursor-pointer hidden md:flex"
          >
            Print
          </Button>
        </div>
      </div>

      {/* ── 5 Executive Financial KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Gross Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : fmt(summary.totalBilled)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across {summary.ordersCount} total orders
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Discounts: {fmt(summary.discounts)}</span>
            <span>Net: {fmt(summary.netSales)}</span>
          </div>
        </div>

        {/* 2. Cost of Goods Sold (COGS) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Cost of Goods (COGS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : fmt(summary.cogs)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Direct commodity & product cost
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Refunds: {fmt(summary.refunds)}</span>
            <span className="font-semibold text-amber-700">Cost Base</span>
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Gross Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {isLoading ? "..." : fmt(summary.grossProfit)}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                {summary.grossMarginPct}% Margin
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Net Sales minus direct product COGS
          </div>
        </div>

        {/* 4. Operating Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Operating Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : fmt(summary.operatingExpenses.total)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Shipping, Gateway & Handling
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stripe Fees: {fmt(summary.operatingExpenses.paymentProcessingFees)}</span>
            <span>Freight: {fmt(summary.operatingExpenses.shippingFulfillment)}</span>
          </div>
        </div>

        {/* 5. Net Profit (Bottom Line) */}
        <div
          className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between space-y-3 transition-colors ${
            isProfitable
              ? "bg-emerald-50/70 border-emerald-300/80 text-emerald-950"
              : "bg-rose-50/70 border-rose-300/80 text-rose-950"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={isProfitable ? "text-emerald-800" : "text-rose-800"}>
              Net Income (EBIT)
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${
                isProfitable
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {isProfitable ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <p
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isProfitable ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {isLoading ? "..." : fmt(summary.netProfit)}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isProfitable
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-rose-200 text-rose-900"
                }`}
              >
                {summary.netMarginPct}% Net Margin
              </span>
            </div>
          </div>
          <div
            className={`pt-2 border-t text-[11px] font-semibold ${
              isProfitable ? "border-emerald-200 text-emerald-800" : "border-rose-200 text-rose-800"
            }`}
          >
            {isProfitable ? "Net Operating Profit" : "Net Operating Loss"}
          </div>
        </div>
      </div>

      {/* ── Financial Timeline Chart Section ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Financial Trajectory: Revenue vs COGS vs Net Profit
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Daily and period trends illustrating inflow, inventory depletion and net retained profit.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00875A]" /> Gross Sales
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> COGS & Expenses
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Net Profit
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#00875A]" />
              <p className="text-xs font-bold text-slate-600">Calculating financial trends...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <p className="font-bold text-slate-600">No transaction data in this period.</p>
              <p className="text-[11px] text-slate-400">Orders placed will populate this trend graph.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00875A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00875A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  formatter={(val, name) => [
                    fmt(val),
                    name === "revenue"
                      ? "Gross Sales"
                      : name === "cogs"
                      ? "COGS & Operations"
                      : "Net Operating Profit",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00875A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradRev)"
                />
                <Area
                  type="monotone"
                  dataKey="cogs"
                  stroke="#D97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradExp)"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradNet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Channel Split: B2B Wholesale vs B2C Retail ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* B2B Wholesale Channel Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">B2B Wholesale Portal</h3>
                <p className="text-[11px] text-slate-500">Commercial verified buyers</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
              {summary.totalBilled > 0
                ? `${((channels.b2b.revenue / summary.totalBilled) * 100).toFixed(0)}% Volume`
                : "0%"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue</span>
              <span className="text-sm font-black text-slate-900">{fmt(channels.b2b.revenue)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Orders</span>
              <span className="text-sm font-black text-slate-900">{channels.b2b.ordersCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Order</span>
              <span className="text-sm font-black text-slate-900">{fmt(channels.b2b.avgOrderValue)}</span>
            </div>
          </div>
        </div>

        {/* B2C Retail Channel Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">B2C Retail Storefront</h3>
                <p className="text-[11px] text-slate-500">Direct consumer transactions</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {summary.totalBilled > 0
                ? `${((channels.b2c.revenue / summary.totalBilled) * 100).toFixed(0)}% Volume`
                : "0%"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue</span>
              <span className="text-sm font-black text-slate-900">{fmt(channels.b2c.revenue)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Orders</span>
              <span className="text-sm font-black text-slate-900">{channels.b2c.ordersCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Order</span>
              <span className="text-sm font-black text-slate-900">{fmt(channels.b2c.avgOrderValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Formal GAAP/IFRS Profit & Loss Statement Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Statement of Profit or Loss (Income Statement)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Formal accounting ledger breakdown across revenues, COGS, and operational overhead.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Currency: USD ($)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[11px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Accounting Line Item</th>
                <th className="p-4 text-right">Debit / Cost (-)</th>
                <th className="p-4 text-right">Credit / Inflow (+)</th>
                <th className="p-4 text-right">% of Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Category 1: Operating Revenue */}
              <tr className="bg-slate-50/60 font-bold text-slate-900">
                <td colSpan={4} className="p-3 px-4 text-xs uppercase tracking-wider text-slate-600">
                  1. Operating Revenue & Sales
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Gross Product Sales (Subtotal)</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{fmt(summary.grossSales)}</td>
                <td className="p-3 text-right text-slate-500 font-mono">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Promotional Discounts Given</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">({fmt(summary.discounts)})</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.grossSales > 0 ? ((summary.discounts / summary.grossSales) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Customer Returns & Refunds</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">({fmt(summary.refunds)})</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.grossSales > 0 ? ((summary.refunds / summary.grossSales) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-slate-100/60 font-bold">
                <td className="p-3 px-6 text-slate-900">NET PRODUCT SALES</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right font-mono text-emerald-800 font-black">{fmt(summary.netSales)}</td>
                <td className="p-3 text-right text-slate-900 font-mono">
                  {summary.grossSales > 0 ? ((summary.netSales / summary.grossSales) * 100).toFixed(1) : 100}%
                </td>
              </tr>

              {/* Category 2: COGS */}
              <tr className="bg-slate-50/60 font-bold text-slate-900">
                <td colSpan={4} className="p-3 px-4 text-xs uppercase tracking-wider text-slate-600">
                  2. Cost of Goods Sold (COGS)
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Direct Product & Inventory Base Cost</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">({fmt(summary.cogs)})</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.netSales > 0 ? ((summary.cogs / summary.netSales) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-emerald-50/40 font-bold">
                <td className="p-3 px-6 text-emerald-900">GROSS PROFIT (Gross Margin: {summary.grossMarginPct}%)</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right font-mono text-emerald-700 font-black">{fmt(summary.grossProfit)}</td>
                <td className="p-3 text-right text-emerald-900 font-mono font-black">{summary.grossMarginPct}%</td>
              </tr>

              {/* Category 3: Operating Expenses */}
              <tr className="bg-slate-50/60 font-bold text-slate-900">
                <td colSpan={4} className="p-3 px-4 text-xs uppercase tracking-wider text-slate-600">
                  3. Operating & Logistics Expenses
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Shipping Freight & Delivery Fulfillment</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">
                  ({fmt(summary.operatingExpenses.shippingFulfillment)})
                </td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.totalBilled > 0
                    ? ((summary.operatingExpenses.shippingFulfillment / summary.totalBilled) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Payment Gateway Merchant Fees (Stripe / Banking)</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">
                  ({fmt(summary.operatingExpenses.paymentProcessingFees)})
                </td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.totalBilled > 0
                    ? ((summary.operatingExpenses.paymentProcessingFees / summary.totalBilled) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Warehouse & Packaging Depot Operations</td>
                <td className="p-3 text-right font-mono font-semibold text-rose-600">
                  ({fmt(summary.operatingExpenses.packagingHandling)})
                </td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-500 font-mono">
                  {summary.totalBilled > 0
                    ? ((summary.operatingExpenses.packagingHandling / summary.totalBilled) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
              <tr className="bg-slate-100/60 font-bold">
                <td className="p-3 px-6 text-slate-900">TOTAL OPERATING EXPENSES</td>
                <td className="p-3 text-right font-mono font-bold text-rose-700">
                  ({fmt(summary.operatingExpenses.total)})
                </td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-900 font-mono">
                  {summary.totalBilled > 0
                    ? ((summary.operatingExpenses.total / summary.totalBilled) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>

              {/* Category 4: Taxes Collected */}
              <tr className="bg-slate-50/60 font-bold text-slate-900">
                <td colSpan={4} className="p-3 px-4 text-xs uppercase tracking-wider text-slate-600">
                  4. Tax Liabilities & Compliance
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 px-6 text-slate-800">Total Sales Taxes, GST & VAT Collected (Remitted)</td>
                <td className="p-3 text-right font-mono text-slate-600">{fmt(summary.taxesCollected.total)}</td>
                <td className="p-3 text-right text-slate-400">—</td>
                <td className="p-3 text-right text-slate-400 font-mono">Pass-through</td>
              </tr>

              {/* Category 5: Net Profit Final */}
              <tr
                className={`font-black text-sm border-t-2 ${
                  isProfitable
                    ? "bg-emerald-100/80 border-emerald-400 text-emerald-950"
                    : "bg-rose-100/80 border-rose-400 text-rose-950"
                }`}
              >
                <td className="p-4 px-6 uppercase tracking-wider">
                  NET OPERATING PROFIT / (LOSS)
                </td>
                <td className="p-4 text-right text-slate-400">—</td>
                <td className="p-4 text-right font-mono text-lg font-black">
                  {fmt(summary.netProfit)}
                </td>
                <td className="p-4 text-right font-mono text-sm">
                  {summary.netMarginPct}% Net Margin
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Product Profitability Breakdown (Top 15) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Product-Level Profit Margins
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ranked items contributing highest retained net income after COGS.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Top {productProfitability.length} Commodities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[11px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Rank & Commodity Item</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-right">Units Sold</th>
                <th className="p-4 text-right">Gross Revenue</th>
                <th className="p-4 text-right">Est. COGS</th>
                <th className="p-4 text-right">Net Profit</th>
                <th className="p-4 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productProfitability.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No product transaction data available for this timeframe.
                  </td>
                </tr>
              ) : (
                productProfitability.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                      <span className="truncate max-w-[200px]">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">{p.sku || "—"}</td>
                    <td className="p-4 text-right font-mono font-semibold text-slate-800">
                      {p.unitsSold.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">{fmt(p.revenue)}</td>
                    <td className="p-4 text-right font-mono text-rose-600">({fmt(p.cogs)})</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-700">{fmt(p.profit)}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          p.marginPct >= 30
                            ? "bg-emerald-100 text-emerald-800"
                            : p.marginPct >= 15
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProfitLossPage;
