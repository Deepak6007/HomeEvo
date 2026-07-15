import { useQuery } from "@tanstack/react-query";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { queryKeys } from "../queryKeys";

export function useVendorProjects(filters?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: queryKeys.vendorProjects.list(filters),
    queryFn: () => vendorProjectsApi.list(filters),
  });
}
