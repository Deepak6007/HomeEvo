import apiClient from "./client";
import { Payment, EscrowBalance, RazorpayOrderResponse, ApiResponse } from "@/types";

export const paymentsApi = {
  initiateEscrow: async (projectId: string, milestoneId: string, amount: number): Promise<RazorpayOrderResponse> => {
    const response = await apiClient.post<ApiResponse<RazorpayOrderResponse>>("/payments/escrow/initiate", {
      projectId,
      milestoneId,
      amount,
    });
    return response.data.data;
  },

  confirmPayment: async (orderId: string, paymentId: string, signature: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>("/payments/escrow/confirm", {
      orderId,
      paymentId,
      signature,
    });
    return response.data.data;
  },

  getEscrowBalance: async (): Promise<EscrowBalance> => {
    const response = await apiClient.get<ApiResponse<EscrowBalance>>("/payments/escrow/balance");
    return response.data.data;
  },

  getHistory: async (filters?: { page?: number; pageSize?: number }): Promise<ApiResponse<Payment[]>> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>("/payments/history", {
      params: filters,
    });
    return response.data;
  },
};
