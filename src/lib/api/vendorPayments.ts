import apiClient from "./client";
import { VendorStats, EarningsByMonth, Payment, ApiResponse } from "@/types";

export const vendorPaymentsApi = {
  getStats: async (): Promise<VendorStats> => {
    const response = await apiClient.get<ApiResponse<VendorStats>>("/vendor/payments/stats");
    return response.data.data;
  },

  getEarningsByMonth: async (): Promise<EarningsByMonth[]> => {
    const response = await apiClient.get<ApiResponse<EarningsByMonth[]>>("/vendor/payments/earnings");
    return response.data.data;
  },

  getHistory: async (filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Payment[]>> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>("/vendor/payments/history", {
      params: filters,
    });
    return response.data;
  },

  getEscrowBalance: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ balance: number }>>("/vendor/payments/escrow-balance");
    return response.data.data.balance;
  },

  generateInvoice: async (projectId: string, milestoneId: string): Promise<Blob> => {
    const response = await apiClient.get(`/vendor/payments/invoice`, {
      params: { projectId, milestoneId },
      responseType: "blob",
    });
    return response.data;
  },
};
