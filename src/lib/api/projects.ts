import apiClient from "./client";
import { Project, CreateProjectDTO, MilestoneEvent, ApiResponse } from "@/types";

export const projectsApi = {
  list: async (filters?: { status?: string; page?: number; pageSize?: number; search?: string }): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateProjectDTO): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>("/projects", payload);
    return response.data.data;
  },

  approveMilestone: async (projectId: string, milestoneId: string): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/projects/${projectId}/milestones/${milestoneId}/approve`
    );
    return response.data.data;
  },

  uploadSitePhoto: async (projectId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `/projects/${projectId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.url;
  },

  getTimeline: async (projectId: string): Promise<MilestoneEvent[]> => {
    const response = await apiClient.get<ApiResponse<MilestoneEvent[]>>(`/projects/${projectId}/timeline`);
    return response.data.data;
  },
};
