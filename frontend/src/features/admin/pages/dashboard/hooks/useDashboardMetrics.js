import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";

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

export function useDashboardMetrics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: metrics, isLoading, isFetching } = useQuery({
    queryKey: ["admin-dashboard-metrics", timeRange],
    queryFn: () => Api.admin.getDashboardMetrics({ timeRange }),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Api.admin.getProducts(),
  });

  const productsCount = Array.isArray(productsData)
    ? productsData.length
    : metrics?.activeCatalogItems ?? 24;

  const revenueData = metrics?.revenueSeries ?? DEFAULT_REVENUE_SERIES;
  const categoryData = metrics?.categoryDistribution ?? DEFAULT_CATEGORY_DISTRIBUTION;
  const recentOrders = metrics?.recentOrders ?? [];
  const pendingApps = metrics?.pendingApplicationsList ?? [];

  return {
    metrics,
    isLoading,
    isFetching,
    timeRange,
    setTimeRange,
    productsCount,
    revenueData,
    categoryData,
    recentOrders,
    pendingApps,
  };
}
