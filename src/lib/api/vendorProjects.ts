import apiClient from "./client";
import { Project, ApiResponse } from "@/types";

export const vendorProjectsApi = {
  list: async (filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>("/vendor/projects", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/vendor/projects/${id}`);
    return response.data.data;
  },

  requestMilestoneRelease: async (projectId: string, milestoneId: string): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/vendor/projects/${projectId}/milestones/${milestoneId}/request-release`
    );
    return response.data.data;
  },

  uploadSitePhoto: async (projectId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `/vendor/projects/${projectId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.url;
  },
};
