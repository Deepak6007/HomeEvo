import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/leads";
import { queryKeys } from "../queryKeys";

export function useLeads(filters?: {
  category?: string;
  status?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadsApi.list(filters),
    staleTime: 30 * 1000, // leads change fast
  });
}
