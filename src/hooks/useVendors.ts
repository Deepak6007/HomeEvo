import { useQuery } from "@tanstack/react-query";
import { vendorsApi } from "@/lib/api/vendors";
import { VendorFilter } from "@/types";
import { queryKeys } from "./queryKeys";

export function useVendors(filters?: VendorFilter, page?: number) {
  return useQuery({
    queryKey: queryKeys.vendors.list(filters, page),
    queryFn: () => vendorsApi.list(filters, page),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => vendorsApi.get(id),
    enabled: !!id,
  });
}

export function useVendorReviews(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendors.reviews(vendorId),
    queryFn: () => vendorsApi.getReviews(vendorId),
    enabled: !!vendorId,
  });
}

export function useVendorBids(vendorId: string, projectId: string) {
  return useQuery({
    queryKey: queryKeys.vendors.bids(vendorId, projectId),
    queryFn: () => vendorsApi.getBids(vendorId, projectId),
    enabled: !!vendorId && !!projectId,
  });
}
