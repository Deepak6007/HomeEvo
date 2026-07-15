import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bidsApi } from "@/lib/api/bids";
import { queryKeys } from "../queryKeys";
import { CreateBidPayload } from "@/types";

export function useBids(filters?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.vendorBids.list(filters),
    queryFn: () => bidsApi.list(filters),
  });
}

export function useCreateBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: CreateBidPayload }) =>
      bidsApi.create(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBids.all });
    },
  });
}
