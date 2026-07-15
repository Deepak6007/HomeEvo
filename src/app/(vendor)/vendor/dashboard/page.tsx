import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { vendorPaymentsApi } from "@/lib/api/vendorPayments";
import { leadsApi } from "@/lib/api/leads";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { queryKeys } from "@/hooks/queryKeys";
import VendorDashboard from "./VendorDashboard";

export const metadata = {
  title: "Vendor Dashboard - HomeEvo",
  description: "View and bid on construction leads, manage active projects, request milestone releases, and track earnings.",
};

export default async function VendorDashboardPage() {
  const queryClient = new QueryClient();

  // Prefetch data in parallel on the server
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: queryKeys.vendorStats.all,
      queryFn: () => vendorPaymentsApi.getStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.leads.list({ status: "new", limit: 5 }),
      queryFn: () => leadsApi.list({ status: "new", page: 1, pageSize: 5 }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.vendorProjects.list({ status: "active" }),
      queryFn: () => vendorProjectsApi.list({ status: "active" }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.vendorEarnings.all,
      queryFn: () => vendorPaymentsApi.getEarningsByMonth(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VendorDashboard />
    </HydrationBoundary>
  );
}
