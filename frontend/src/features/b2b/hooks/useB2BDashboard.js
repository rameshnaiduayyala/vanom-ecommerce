import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCountryStore } from "@/stores/country.store.js";

const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  CAD: "CA$",
  EUR: "€",
  GBP: "£",
};

/**
 * Fetches live B2B dashboard summary (business dossier, order aggregates,
 * bulk cart state, and featured catalog commodities).
 */
export function useB2BDashboard() {
  const { user, activeCompany } = useAuthStore();
  const { country } = useCountryStore();

  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ["b2b-dashboard-summary"],
    queryFn: async () => {
      const res = await Api.b2b.getDashboard();
      return res?.data || res;
    },
    staleTime: 30000,
  });

  const business = dashboardData?.business || activeCompany;
  const status = business?.status || activeCompany?.status;

  const stats = dashboardData?.stats || {
    totalOrders: 0,
    totalSpend: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    cartItemsCount: 0,
    cartLineItemsCount: 0,
    catalogCount: 0,
    currencyCode: country?.currency || "USD",
  };

  const currency = stats.currencyCode || country?.currency || "USD";
  const currencySymbol =
    country?.currency === currency && country?.symbol
      ? country.symbol
      : CURRENCY_SYMBOLS[currency] || currency;

  return {
    user,
    country,
    business,
    status,
    stats,
    recentOrders: dashboardData?.recentOrders || [],
    featuredProducts: dashboardData?.featuredProducts || [],
    cart: dashboardData?.cart || null,
    currency,
    currencySymbol,
    isLoading,
    isError,
    refetch,
  };
}
