import apiClient from "./client";
import { Vendor, Review, ApiResponse } from "@/types";

export const vendorProfileApi = {
  get: async (): Promise<{ profile: Vendor; completionPercentage: number }> => {
    const response = await apiClient.get<ApiResponse<{ profile: Vendor; completionPercentage: number }>>("/vendor/profile");
    return response.data.data;
  },

  update: async (payload: Partial<Vendor>): Promise<Vendor> => {
    const response = await apiClient.patch<ApiResponse<Vendor>>("/vendor/profile", payload);
    return response.data.data;
  },

  uploadPortfolioPhoto: async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append("photo", file);
    const response = await apiClient.post<ApiResponse<{ url: string; id: string }>>(
      "/vendor/profile/portfolio",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  deletePortfolioPhoto: async (photoId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/vendor/profile/portfolio/${photoId}`);
    return response.data;
  },

  getReviews: async (filters?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Review[]>> => {
    const response = await apiClient.get<ApiResponse<Review[]>>("/vendor/profile/reviews", {
      params: filters,
    });
    return response.data;
  },
};
