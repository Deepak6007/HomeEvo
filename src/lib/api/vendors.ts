import apiClient from "./client";
import { Vendor, VendorFilter, Review, VendorProjectBid, ApiResponse } from "@/types";

export const vendorsApi = {
  list: async (filters?: VendorFilter, page?: number): Promise<ApiResponse<Vendor[]>> => {
    const response = await apiClient.get<ApiResponse<Vendor[]>>("/vendors", {
      params: { ...filters, page },
    });
    return response.data;
  },

  get: async (id: string): Promise<Vendor> => {
    const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return response.data.data;
  },

  getReviews: async (vendorId: string): Promise<Review[]> => {
    const response = await apiClient.get<ApiResponse<Review[]>>(`/vendors/${vendorId}/reviews`);
    return response.data.data;
  },

  getBids: async (vendorId: string, projectId: string): Promise<VendorProjectBid[]> => {
    const response = await apiClient.get<ApiResponse<VendorProjectBid[]>>(`/vendors/${vendorId}/projects/${projectId}/bids`);
    return response.data.data;
  },
};
