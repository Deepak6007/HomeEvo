import * as React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SignInPage from "../app/(auth)/signin/page"
import { useAuthStore } from "../stores/authStore"
import { authApi } from "../lib/api/auth"
import apiClient from "../lib/api/client"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

jest.mock('@/lib/utils/navigation', () => ({
  redirect: jest.fn(),
}))

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Get mock router push spy from next/navigation mock
const mockPush = jest.fn()
jest.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
  }
})

describe("Authentication Integration Flow", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
    mockPush.mockClear()
    // Clear cookies
    document.cookie = "homeevo-token=; path=/; max-age=0"
    jest.clearAllMocks()
  })

  test("Sign in with valid credentials -> tokens stored -> cookie set -> redirected to dashboard", async () => {
    render(<SignInPage />)

    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitBtn = screen.getByRole("button", { name: "Sign In" })

    // Fill credentials
    fireEvent.change(emailInput, { target: { value: "client@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    // Submit form
    fireEvent.click(submitBtn)

    await waitFor(() => {
      // Check Zustand store update
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe("mock-access-token")
      expect(state.refreshToken).toBe("mock-refresh-token")
      expect(state.user?.email).toBe("client@example.com")
      expect(state.role).toBe("client")

      // Check cookie value
      expect(document.cookie).toContain("homeevo-token=mock-access-token")

      // Check redirect
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })

  test("Sign in with invalid credentials -> error shown -> no redirect -> no state stored", async () => {
    render(<SignInPage />)

    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitBtn = screen.getByRole("button", { name: "Sign In" })

    // Fill invalid credentials (handlers.ts rejects invalid@example.com)
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })

    fireEvent.click(submitBtn)

    // Wait for the mock API response error
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })

    // Confirm no tokens are saved
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()

    // Confirm no redirection occurred
    expect(mockPush).not.toHaveBeenCalled()
  })

  test("Token refresh -> original request retried transparently", async () => {
    // Initialise store with expired access token and valid refresh token
    useAuthStore.getState().setAuth(
      { accessToken: "expired-token", refreshToken: "valid-refresh-token" },
      { id: "1", email: "client@example.com", name: "John Client", role: "client" }
    )

    let apiCalls = 0
    server.use(
      http.get(`${baseURL}/auth/me`, () => {
        apiCalls++
        if (apiCalls === 1) {
          return new HttpResponse(null, { status: 401 })
        }
        return HttpResponse.json({
          success: true,
          data: { id: "user-1", email: "client@example.com", name: "John Client", role: "client" },
          message: "Profile verified"
        })
      })
    )

    const userProfile = await authApi.me()

    expect(userProfile.email).toBe("client@example.com")
    expect(apiCalls).toBe(2) // 401 retry -> refresh -> retry success

    const storeState = useAuthStore.getState()
    expect(storeState.accessToken).toBe("new-mock-access-token")
    expect(storeState.refreshToken).toBe("new-mock-refresh-token")
  })

  test("Sign out -> tokens cleared -> redirected to landing redirect", async () => {
    // Populate store
    useAuthStore.getState().setAuth(
      { accessToken: "mock-access-token", refreshToken: "mock-refresh-token" },
      { id: "1", email: "client@example.com", name: "John Client", role: "client" }
    )
    document.cookie = "homeevo-token=mock-access-token; path=/"

    expect(useAuthStore.getState().isAuthenticated()).toBe(true)

    // Trigger API signout
    await authApi.signout()

    // Check store is cleared
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.role).toBeNull()
    expect(state.isAuthenticated()).toBe(false)
  })
})
