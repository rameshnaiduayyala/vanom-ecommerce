import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { ORDER_STATUSES } from "../../../constants/countries.js";
import { resolveProductImageUrl } from "../../../utils/image.js";
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  Clock,
  FileText,
  Printer,
  ChevronRight,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585336261026-7f81498b584d?auto=format&fit=crop&w=400&q=80";

/**
 * Enterprise-grade Orders Hub & History.
 * Supports status tabs, live search by SKU / Order ID / Product Name, executive summary cards,
 * and high-fidelity invoice previews.
 */
export function OrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  const [timeRange, setTimeRange] = useState("ALL_TIME"); // ALL_TIME | 30_DAYS | 90_DAYS | THIS_YEAR

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["b2c-orders-hub"],
    queryFn: () => Api.orders.list({ limit: 100 }),
  });

  const rawList = Array.isArray(data) ? data : data?.items || [];
  const orders = useMemo(() => {
    return rawList.filter((o) => o.type !== "B2B_BULK");
  }, [rawList]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab Status Filter
      if (activeTab !== "ALL") {
        const orderStatus = (order.status || "").toUpperCase();
        if (activeTab === "PENDING" && !["PENDING", "UNPAID", "CONFIRMED"].includes(orderStatus)) return false;
        if (activeTab === "PROCESSING" && !["PROCESSING", "PACKED"].includes(orderStatus)) return false;
        if (activeTab === "SHIPPED" && !["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(orderStatus)) return false;
        if (activeTab === "DELIVERED" && !["DELIVERED", "COMPLETED"].includes(orderStatus)) return false;
        if (activeTab === "CANCELLED" && !["CANCELLED", "REFUNDED", "REJECTED"].includes(orderStatus)) return false;
      }

      // 2. Search Term Filter (Order Number, Item Names, SKUs, Address)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = (order.orderNumber || order.id || "").toLowerCase().includes(query);
        const matchesItems = order.items?.some(
          (it) =>
            (it.productName || it.name || it.product?.name || "").toLowerCase().includes(query) ||
            (it.sku || it.product?.sku || "").toLowerCase().includes(query)
        );
        const matchesAddress = (order.shippingAddress?.city || "").toLowerCase().includes(query);
        if (!matchesId && !matchesItems && !matchesAddress) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchTerm]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const activeFulfillments = orders.filter((o) =>
      ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes((o.status || "").toUpperCase())
    ).length;
    const completedOrders = orders.filter((o) =>
      ["DELIVERED", "COMPLETED"].includes((o.status || "").toUpperCase())
    ).length;
    const totalExpenditure = orders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);

    return {
      totalOrdersCount,
      activeFulfillments,
      completedOrders,
      totalExpenditure,
    };
  }, [orders]);

  const tabs = [
    { key: "ALL", label: "All Orders", count: orders.length },
    {
      key: "PENDING",
      label: "Pending / Placed",
      count: orders.filter((o) => ["PENDING", "UNPAID", "CONFIRMED"].includes(o.status)).length,
    },
    {
      key: "PROCESSING",
      label: "Processing",
      count: orders.filter((o) => ["PROCESSING", "PACKED"].includes(o.status)).length,
    },
    {
      key: "SHIPPED",
      label: "In Transit",
      count: orders.filter((o) => ["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(o.status)).length,
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      count: orders.filter((o) => ["DELIVERED", "COMPLETED"].includes(o.status)).length,
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      count: orders.filter((o) => ["CANCELLED", "REFUNDED"].includes(o.status)).length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Dossiers & History
          </h1>
        </div>

      </div>
      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID, SKU, product title, or delivery city..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00875A] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Timeframe:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#00875A] cursor-pointer"
            >
              <option value="ALL_TIME">All Historical Orders</option>
              <option value="30_DAYS">Past 30 Days</option>
              <option value="90_DAYS">Past 3 Months</option>
              <option value="THIS_YEAR">Current Calendar Year</option>
            </select>
          </div>
        </div>

        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${isActive
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders Listing ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00875A] flex items-center justify-center mx-auto shadow-2xs">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchTerm ? "No orders matched your search query" : "No orders found in this category"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "Try searching with a different SKU, keyword, or clear your search term."
                : "Explore our catalog to discover authentic premium products and place your first order."}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            {searchTerm ? (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="cursor-pointer">
                Clear Search Filter
              </Button>
            ) : (
              <Link to={ROUTES.PRODUCTS}>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#00875A] hover:bg-[#00522E] text-white font-bold cursor-pointer"
                >
                  Explore Store Catalog
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status || "CONFIRMED",
              color: "emerald",
            };

            const orderTotal = Number(order.total ?? order.totalAmount ?? 0);
            const currencyCode = order.currencyCode || order.currency?.code || "USD";
            const items = order.items || [];
            const displayItems = items.slice(0, 3);
            const extraCount = items.length - displayItems.length;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#00875A]/60 shadow-2xs hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Order Summary Header Bar */}
                <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Order Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber || order.id}</span>
                    </div>

                    <div className="hidden sm:block border-l border-slate-200 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Date Placed
                      </span>
                      <span className="font-semibold text-slate-700">{formatDate(order.createdAt, true)}</span>
                    </div>

                    <div className="hidden md:block border-l border-slate-200 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Destination
                      </span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px] block">
                        {order.shippingAddress?.city
                          ? `${order.shippingAddress.city}, ${order.shippingAddress.countryCode || "US"}`
                          : "Standard Logistics"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig.color} size="md">
                      {statusConfig.label}
                    </Badge>

                    <div className="text-right pl-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatPrice(orderTotal, currencyCode)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Preview Area */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Thumbnail Strip & Item Titles */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {displayItems.map((it, idx) => {
                        const product = it.product || {};
                        const imgSrc =
                          resolveProductImageUrl(product) ||
                          it.image ||
                          it.imageUrl ||
                          product.images?.[0]?.url ||
                          DEFAULT_IMAGE;

                        return (
                          <div
                            key={it.id || idx}
                            className="flex items-center gap-3 bg-slate-50/70 p-2 rounded-xl border border-slate-200/80 pr-3.5 max-w-sm"
                          >
                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                              <img src={imgSrc} alt={it.productName || "Item"} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {it.productName || it.name || product.name || "Product Item"}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Qty: {it.quantity} • {formatPrice(it.unitPrice || it.price || 0, currencyCode)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {extraCount > 0 && (
                        <div className="h-12 px-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          +{extraCount} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link to={`/orders/${order.id}/invoice`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-slate-700 bg-white border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
                        title="View & Download Invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#00875A]" />
                        <span>Tax Invoice</span>
                      </Button>
                    </Link>

                    <Link to={`${ROUTES.ORDERS}/${order.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200/80 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
