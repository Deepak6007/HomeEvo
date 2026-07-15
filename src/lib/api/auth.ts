import apiClient from "./client"
import { useAuthStore } from "@/stores/authStore"
import {
  SigninPayload,
  SignupPayload,
  AuthResponse,
  VendorOnboardingPayload,
  User,
  ApiResponse,
} from "@/types"

export const authApi = {
  signin: async (payload: SigninPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/signin", payload)
    return response.data.data
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/signup", payload)
    return response.data.data
  },

  signout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>("/auth/signout")
    } catch (e) {
      console.error("Signout API call failed:", e)
    } finally {
      useAuthStore.getState().clearAuth()
    }
  },

  refreshToken: async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken: token }
    )
    return response.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>("/auth/reset-password", {
      token,
      password: newPassword,
    })
  },

  vendorOnboarding: async (payload: VendorOnboardingPayload): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>("/auth/vendor-onboarding", payload)
    return response.data.data
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me")
    return response.data.data
  },
}
