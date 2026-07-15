import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorProfileApi } from "@/lib/api/vendorProfile";
import { queryKeys } from "../queryKeys";
import { Vendor } from "@/types";

export function useVendorProfile() {
  return useQuery({
    queryKey: queryKeys.vendorProfile.detail(),
    queryFn: () => vendorProfileApi.get(),
    staleTime: 10 * 60 * 1000, // Profile data doesn't change often, cache for 10 minutes
  });
}

export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Vendor>) => vendorProfileApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProfile.all });
    },
  });
}
