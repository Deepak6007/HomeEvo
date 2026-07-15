import { useAuthStore } from '../authStore'

describe('authStore', () => {
  beforeEach(() => {
    // Clear Zustand store and localStorage before each test
    useAuthStore.getState().clearAuth()
    localStorage.clear()
  })

  test('should initialize with default null values', () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.role).toBeNull()
    expect(state.isAuthenticated()).toBe(false)
  })

  test('setAuth stores tokens and user details correctly', () => {
    const mockUser = {
      id: 'u1',
      email: 'test@homeevo.in',
      name: 'Krishna Kant',
      role: 'client' as const
    }
    const mockTokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123'
    }

    useAuthStore.getState().setAuth(mockTokens, mockUser)

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-123')
    expect(state.refreshToken).toBe('refresh-123')
    expect(state.user).toEqual(mockUser)
    expect(state.role).toBe('client')
    expect(state.isAuthenticated()).toBe(true)
  })

  test('setAuth works with alternate token property names (access/refresh)', () => {
    const mockUser = {
      id: 'u2',
      email: 'vendor@homeevo.in',
      name: 'Venkata Rao',
      role: 'vendor' as const
    }
    const mockTokens = {
      access: 'access-alt',
      refresh: 'refresh-alt'
    }

    useAuthStore.getState().setAuth(mockTokens, mockUser)

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-alt')
    expect(state.refreshToken).toBe('refresh-alt')
    expect(state.role).toBe('vendor')
  })

  test('clearAuth removes all token and user details', () => {
    const mockUser = {
      id: 'u1',
      email: 'test@homeevo.in',
      name: 'Krishna Kant',
      role: 'client' as const
    }
    const mockTokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123'
    }

    useAuthStore.getState().setAuth(mockTokens, mockUser)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)

    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.role).toBeNull()
    expect(state.isAuthenticated()).toBe(false)
  })

  test('persist middleware saves partial state to localStorage', () => {
    const mockUser = {
      id: 'u1',
      email: 'test@homeevo.in',
      name: 'Krishna Kant',
      role: 'client' as const
    }
    const mockTokens = {
      accessToken: 'access-persistent',
      refreshToken: 'refresh-persistent'
    }

    useAuthStore.getState().setAuth(mockTokens, mockUser)

    const storedValue = localStorage.getItem('homeevo-auth')
    expect(storedValue).not.toBeNull()

    const parsed = JSON.parse(storedValue!)
    expect(parsed.state.accessToken).toBe('access-persistent')
    expect(parsed.state.refreshToken).toBe('refresh-persistent')
    expect(parsed.state.role).toBe('client')
    // Check that user is persisted as per store definition
    expect(parsed.state.user).toEqual(mockUser)
  })

  test('isAuthenticated updates reactively and matches token existence', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)

    useAuthStore.getState().setAuth(
      { accessToken: 'token-active' },
      { id: '1', email: 'a@a.com', name: 'A', role: 'admin' }
    )
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)

    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})
