export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'vendor' | 'admin'
  avatarUrl?: string
  phone?: string
}

export interface VendorProfile {
  businessName: string
  category: string
  gstin?: string
  aadhaar: string
  profileCompletion: number
}

export interface SigninPayload {
  email: string
  password: string
  role: 'client' | 'vendor'
}

export interface SignupPayload {
  email: string
  password: string
  name: string
  phone: string
  role: 'client' | 'vendor'
  businessName?: string
  category?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TokenPayload {
  sub: string
  role: string
  exp: number
}

export interface VendorOnboardingPayload {
  businessName: string
  category: string
  gstin?: string
  aadhaar: string
  experience?: number
  serviceAreas?: string[]
  documents?: string[]
  portfolio?: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

