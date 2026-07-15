import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { queryKeys } from "@/hooks/queryKeys";
import ProjectsListClient from "./ProjectsListClient";

interface ProjectsPageProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
  };
}

export const metadata = {
  title: "My Projects - HomeEvo",
  description: "Browse and manage your active and past home construction or renovation projects.",
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const queryClient = new QueryClient();

  const status = searchParams.status === "all" ? undefined : searchParams.status;
  const search = searchParams.search || undefined;
  const page = Number(searchParams.page) || 1;

  // Prefetch project listing on the server
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.list({ status, page, pageSize: 6, search }),
    queryFn: () => projectsApi.list({ status, page, pageSize: 6, search }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsListClient />
    </HydrationBoundary>
  );
}
