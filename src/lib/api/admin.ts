import apiClient from "./client";
import { ApiResponse, User, Vendor, Payment } from "@/types";

export interface SystemHealth {
  latency: number;
  dbConnections: number;
  queueDepth: number;
  errorRate: number;
}

export interface SystemJobStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
}

export interface Complaint {
  id: string;
  clientId: string;
  clientName: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  issue: string;
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  description: string;
  chatThread?: { sender: string; message: string; timestamp: string }[];
}

export interface RevenueMonth {
  month: string;
  revenue: number;
}

export interface UserGrowthMonth {
  month: string;
  clients: number;
  vendors: number;
}

export interface TopVendor {
  id: string;
  name: string;
  businessName: string;
  category: string;
  earnings: number;
  projectsCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeVendors: number;
  pendingVerifications: number;
  todayGmv: number;
}

export const adminApi = {
  users: {
    list: async (filters?: { role?: string; status?: string; search?: string; page?: number; pageSize?: number }): Promise<ApiResponse<User[]>> => {
      const response = await apiClient.get<ApiResponse<User[]>>("/admin/users", { params: filters });
      return response.data;
    },
    get: async (id: string): Promise<ApiResponse<User>> => {
      const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
      return response.data;
    },
    suspend: async (id: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/suspend`);
      return response.data;
    },
    reinstate: async (id: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/reinstate`);
      return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.delete<ApiResponse<any>>(`/admin/users/${id}`);
      return response.data;
    },
  },
  vendors: {
    list: async (filters?: { category?: string; status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<Vendor[]>> => {
      const response = await apiClient.get<ApiResponse<Vendor[]>>("/admin/vendors", { params: filters });
      return response.data;
    },
    get: async (id: string): Promise<ApiResponse<Vendor>> => {
      const response = await apiClient.get<ApiResponse<Vendor>>(`/admin/vendors/${id}`);
      return response.data;
    },
    verify: async (id: string, notes?: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/vendors/${id}/verify`, { notes });
      return response.data;
    },
    reject: async (id: string, reason: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/vendors/${id}/reject`, { reason });
      return response.data;
    },
    getPendingVerifications: async (): Promise<ApiResponse<Vendor[]>> => {
      const response = await apiClient.get<ApiResponse<Vendor[]>>("/admin/vendors/pending");
      return response.data;
    },
  },
  payments: {
    list: async (filters?: { status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<Payment[]>> => {
      const response = await apiClient.get<ApiResponse<Payment[]>>("/admin/payments", { params: filters });
      return response.data;
    },
    getStats: async (): Promise<ApiResponse<{ gmv: number; commission: number; refunds: number }>> => {
      const response = await apiClient.get<ApiResponse<{ gmv: number; commission: number; refunds: number }>>("/admin/payments/stats");
      return response.data;
    },
    initiateRefund: async (paymentId: string, reason: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/payments/${paymentId}/refund`, { reason });
      return response.data;
    },
  },
  analytics: {
    getOverview: async (): Promise<ApiResponse<AdminStats>> => {
      const response = await apiClient.get<ApiResponse<AdminStats>>("/admin/analytics/overview");
      return response.data;
    },
    getRevenueByMonth: async (): Promise<ApiResponse<RevenueMonth[]>> => {
      const response = await apiClient.get<ApiResponse<RevenueMonth[]>>("/admin/analytics/revenue");
      return response.data;
    },
    getUserGrowth: async (): Promise<ApiResponse<UserGrowthMonth[]>> => {
      const response = await apiClient.get<ApiResponse<UserGrowthMonth[]>>("/admin/analytics/user-growth");
      return response.data;
    },
    getTopVendors: async (): Promise<ApiResponse<TopVendor[]>> => {
      const response = await apiClient.get<ApiResponse<TopVendor[]>>("/admin/analytics/top-vendors");
      return response.data;
    },
  },
  complaints: {
    list: async (filters?: { status?: string; priority?: string; page?: number; pageSize?: number }): Promise<ApiResponse<Complaint[]>> => {
      const response = await apiClient.get<ApiResponse<Complaint[]>>("/admin/complaints", { params: filters });
      return response.data;
    },
    get: async (id: string): Promise<ApiResponse<Complaint>> => {
      const response = await apiClient.get<ApiResponse<Complaint>>(`/admin/complaints/${id}`);
      return response.data;
    },
    resolve: async (id: string, notes: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/complaints/${id}/resolve`, { notes });
      return response.data;
    },
    escalate: async (id: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/complaints/${id}/escalate`);
      return response.data;
    },
  },
  system: {
    getHealth: async (): Promise<ApiResponse<SystemHealth>> => {
      const response = await apiClient.get<ApiResponse<SystemHealth>>("/admin/system/health");
      return response.data;
    },
    getJobQueueStats: async (): Promise<ApiResponse<SystemJobStats>> => {
      const response = await apiClient.get<ApiResponse<SystemJobStats>>("/admin/system/jobs");
      return response.data;
    },
    clearCache: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.post<ApiResponse<any>>("/admin/system/clear-cache");
      return response.data;
    },
  },
};
