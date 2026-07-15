import apiClient from "./client";
import { Lead, ApiResponse } from "@/types";

export const leadsApi = {
  list: async (filters?: {
    category?: string;
    status?: string;
    location?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Lead[]>> => {
    const response = await apiClient.get<ApiResponse<Lead[]>>("/leads", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
    return response.data.data;
  },

  markViewed: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/leads/${id}/view`);
    return response.data;
  },
};
