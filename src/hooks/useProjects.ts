import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { CreateProjectDTO, Project } from "@/types";
import { queryKeys } from "./queryKeys";

export function useProjects(filters?: { status?: string; page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectsApi.list(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectDTO) => projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      projectsApi.approveMilestone(projectId, milestoneId),
    onMutate: async ({ projectId, milestoneId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });

      const previousProject = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(projectId)
      );

      if (previousProject) {
        const updatedMilestones = previousProject.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, status: 'released' as const, approvedAt: new Date().toISOString() }
            : m
        );
        queryClient.setQueryData<Project>(queryKeys.projects.detail(projectId), {
          ...previousProject,
          milestones: updatedMilestones,
        });
      }

      return { previousProject, projectId };
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData<Project>(
          queryKeys.projects.detail(context.projectId),
          context.previousProject
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

export function useUploadSitePhoto() {
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      projectsApi.uploadSitePhoto(projectId, file),
  });
}

export function useProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.timeline(projectId),
    queryFn: () => projectsApi.getTimeline(projectId),
    enabled: !!projectId,
  });
}
