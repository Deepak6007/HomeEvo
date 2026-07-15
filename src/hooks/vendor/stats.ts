import { useQuery } from "@tanstack/react-query";
import { vendorPaymentsApi } from "@/lib/api/vendorPayments";
import { queryKeys } from "../queryKeys";

export function useVendorStats() {
  return useQuery({
    queryKey: queryKeys.vendorStats.all,
    queryFn: () => vendorPaymentsApi.getStats(),
    refetchInterval: 60000, // Live stats, refetch every 60 seconds
  });
}

export function useVendorEarnings() {
  return useQuery({
    queryKey: queryKeys.vendorEarnings.all,
    queryFn: () => vendorPaymentsApi.getEarningsByMonth(),
    staleTime: 5 * 60 * 1000, // Earnings are static, cache for 5 minutes
  });
}
