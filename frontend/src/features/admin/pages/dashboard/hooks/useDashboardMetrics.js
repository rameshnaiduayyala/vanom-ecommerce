import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";

export function useDashboardMetrics() {
  const [timeRange, setTimeRange] = useState("30d");

  // Live metrics query directly from backend database
  const { data: metrics, isLoading, isFetching } = useQuery({
    queryKey: ["admin-dashboard-metrics", timeRange],
    queryFn: () => Api.admin.getDashboardMetrics({ timeRange }),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  // Lightweight query only if activeCatalogItems is not present in metrics
  const { data: productsData } = useQuery({
    queryKey: ["admin-products-count-fallback"],
    queryFn: () => Api.admin.getProductsDropdown({ limit: 1 }),
    enabled: metrics?.activeCatalogItems == null,
  });

  const productList = useMemo(() => {
    return Array.isArray(productsData)
      ? productsData
      : Array.isArray(productsData?.items)
      ? productsData.items
      : Array.isArray(productsData?.data)
      ? productsData.data
      : [];
  }, [productsData]);

  const productsCount =
    metrics?.activeCatalogItems ??
    (productList.length > 0 ? productList.length : 0);

  // Strictly use real API response data (empty array if no orders or categories exist yet)
  const revenueData = metrics?.revenueSeries || [];
  const categoryData = metrics?.categoryDistribution || [];
  const recentOrders = metrics?.recentOrders || [];
  const topProducts = metrics?.topProducts || [];
  const pendingApps = metrics?.pendingApplicationsList || [];

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
    topProducts,
    pendingApps,
  };
}

export default useDashboardMetrics;
