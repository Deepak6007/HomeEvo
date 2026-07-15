import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { vendorsApi } from "@/lib/api/vendors";
import { queryKeys } from "@/hooks/queryKeys";
import ProjectDetailClient from "./ProjectDetailClient";
import { Project } from "@/types";

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Project Detail - HomeEvo",
  description: "View project milestones, visual site updates, and manage secure escrow releases.",
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const queryClient = new QueryClient();
  const projectId = params.id;

  // 1. Prefetch project details
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectsApi.get(projectId),
  });

  // 2. Fetch project data from cache to check for vendorId
  const project = queryClient.getQueryData<Project>(queryKeys.projects.detail(projectId));

  // 3. If vendor assigned, prefetch vendor details
  if (project?.vendorId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.vendors.detail(project.vendorId),
      queryFn: () => vendorsApi.get(project.vendorId || ""),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetailClient />
    </HydrationBoundary>
  );
}
