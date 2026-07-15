import apiClient from "./client";
import { Bid, CreateBidPayload, ApiResponse } from "@/types";

export const bidsApi = {
  list: async (filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Bid[]>> => {
    const response = await apiClient.get<ApiResponse<Bid[]>>("/bids", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string): Promise<Bid> => {
    const response = await apiClient.get<ApiResponse<Bid>>(`/bids/${id}`);
    return response.data.data;
  },

  create: async (leadId: string, payload: CreateBidPayload): Promise<Bid> => {
    const response = await apiClient.post<ApiResponse<Bid>>("/bids", {
      ...payload,
      leadId,
    });
    return response.data.data;
  },

  update: async (bidId: string, payload: Partial<CreateBidPayload>): Promise<Bid> => {
    const response = await apiClient.patch<ApiResponse<Bid>>(`/bids/${bidId}`, payload);
    return response.data.data;
  },

  withdraw: async (bidId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/bids/${bidId}`);
    return response.data;
  },
};
