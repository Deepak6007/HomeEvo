import apiClient from '../client'
import { useAuthStore } from '@/stores/authStore'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { redirect } from '@/lib/utils/navigation'

jest.mock('@/lib/utils/navigation', () => ({
  redirect: jest.fn(),
}))

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

describe('apiClient', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
    jest.clearAllMocks()
    ;(redirect as jest.Mock).mockClear()
  })

  test('should attach Bearer token to requests when present in useAuthStore', async () => {
    useAuthStore.getState().setAuth(
      { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' },
      { id: '1', email: 'test@homeevo.in', name: 'Krishna', role: 'client' }
    )

    // Override the mock handler to verify the received Authorization header
    server.use(
      http.get(`${baseURL}/projects`, ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        return HttpResponse.json({
          success: true,
          data: [{ id: 'mock-id', auth: authHeader }]
        })
      })
    )

    const res = await apiClient.get('/projects')
    expect(res.data.success).toBe(true)
    expect(res.data.data[0].auth).toBe('Bearer test-access-token')
  })

  test('should handle 401 and transparently refresh access token', async () => {
    useAuthStore.getState().setAuth(
      { accessToken: 'expired-access-token', refreshToken: 'valid-refresh-token' },
      { id: '1', email: 'test@homeevo.in', name: 'Krishna', role: 'client' }
    )

    let callCount = 0
    // Endpoint returns 401 first, then returns 200 with the authorization header checked
    server.use(
      http.get(`${baseURL}/projects`, ({ request }) => {
        callCount++
        if (callCount === 1) {
          return new HttpResponse(null, { status: 401 })
        }
        return HttpResponse.json({
          success: true,
          data: { status: 'retry-success', token: request.headers.get('Authorization') }
        })
      })
    )

    const response = await apiClient.get('/projects')
    
    // Check that we got the retry response
    expect(response.data.success).toBe(true)
    expect(response.data.data.status).toBe('retry-success')
    expect(response.data.data.token).toBe('Bearer new-mock-access-token')

    // Confirm that the Zustand store was updated with the new token
    const storeState = useAuthStore.getState()
    expect(storeState.accessToken).toBe('new-mock-access-token')
    expect(storeState.refreshToken).toBe('new-mock-refresh-token')
  })

  test('should clear auth and redirect to /signin when refresh token is missing', async () => {
    // Only set accessToken, omit refreshToken
    useAuthStore.getState().setAuth(
      { accessToken: 'expired-access-token' },
      { id: '1', email: 'test@homeevo.in', name: 'Krishna', role: 'client' }
    )

    server.use(
      http.get(`${baseURL}/projects`, () => {
        return new HttpResponse(null, { status: 401 })
      })
    )

    await expect(apiClient.get('/projects')).rejects.toThrow()

    // Auth should be cleared
    const storeState = useAuthStore.getState()
    expect(storeState.accessToken).toBeNull()
    expect(storeState.refreshToken).toBeNull()
    expect(storeState.user).toBeNull()

    // Redirect should be triggered
    expect(redirect).toHaveBeenCalledWith('/signin')
  })

  test('should clear auth and redirect to /signin when refresh token request fails', async () => {
    useAuthStore.getState().setAuth(
      { accessToken: 'expired-access-token', refreshToken: 'expired-refresh-token' },
      { id: '1', email: 'test@homeevo.in', name: 'Krishna', role: 'client' }
    )

    // Make both endpoint and refresh call fail
    server.use(
      http.get(`${baseURL}/projects`, () => {
        return new HttpResponse(null, { status: 401 })
      }),
      http.post(`${baseURL}/auth/refresh`, () => {
        return HttpResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 })
      })
    )

    await expect(apiClient.get('/projects')).rejects.toThrow()

    const storeState = useAuthStore.getState()
    expect(storeState.accessToken).toBeNull()
    expect(storeState.refreshToken).toBeNull()
    expect(redirect).toHaveBeenCalledWith('/signin')
  })

  test('should queue concurrent requests during token refresh and retry all', async () => {
    useAuthStore.getState().setAuth(
      { accessToken: 'expired-access-token', refreshToken: 'valid-refresh-token' },
      { id: '1', email: 'test@homeevo.in', name: 'Krishna', role: 'client' }
    )

    let projectsCount = 0
    let usersCount = 0
    let refreshCalls = 0

    server.use(
      http.get(`${baseURL}/projects`, ({ request }) => {
        projectsCount++
        if (projectsCount === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({
          success: true,
          data: { from: 'projects', token: request.headers.get('Authorization') }
        })
      }),
      http.get(`${baseURL}/auth/me`, ({ request }) => {
        usersCount++
        if (usersCount === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({
          success: true,
          data: { from: 'me', token: request.headers.get('Authorization') }
        })
      }),
      http.post(`${baseURL}/auth/refresh`, async () => {
        refreshCalls++
        return HttpResponse.json({
          success: true,
          data: {
            accessToken: 'shared-new-access',
            refreshToken: 'shared-new-refresh'
          }
        })
      })
    )

    // Trigger two requests concurrently
    const [resProjects, resMe] = await Promise.all([
      apiClient.get('/projects'),
      apiClient.get('/auth/me')
    ])

    expect(resProjects.data.success).toBe(true)
    expect(resProjects.data.data.from).toBe('projects')
    expect(resProjects.data.data.token).toBe('Bearer shared-new-access')

    expect(resMe.data.success).toBe(true)
    expect(resMe.data.data.from).toBe('me')
    expect(resMe.data.data.token).toBe('Bearer shared-new-access')

    // Refresh should only be called once
    expect(refreshCalls).toBe(1)
  })
})
