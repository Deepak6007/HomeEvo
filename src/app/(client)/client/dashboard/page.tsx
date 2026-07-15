import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { paymentsApi } from "@/lib/api/payments";
import { vendorsApi } from "@/lib/api/vendors";
import { queryKeys } from "@/hooks/queryKeys";
import ClientDashboard from "./ClientDashboard";

export const metadata = {
  title: "Client Dashboard - HomeEvo",
  description: "Manage your home construction and renovation projects, track escrows, and connect with pros.",
};

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // Prefetch data in parallel on the server
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.list({ status: "active" }),
      queryFn: () => projectsApi.list({ status: "active" }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.escrow.balance(),
      queryFn: () => paymentsApi.getEscrowBalance(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.vendors.list({ verified: true }, 1),
      queryFn: () => vendorsApi.list({ verified: true }, 1),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientDashboard />
    </HydrationBoundary>
  );
}
