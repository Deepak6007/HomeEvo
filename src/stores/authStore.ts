import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User } from "@/types"

interface AuthTokens {
  accessToken?: string
  refreshToken?: string
  access?: string
  refresh?: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  role: 'client' | 'vendor' | 'admin' | null
  setAuth: (tokens: AuthTokens, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      setAuth: (tokens, user) => {
        const accessToken = tokens.accessToken || tokens.access || null
        const refreshToken = tokens.refreshToken || tokens.refresh || null
        set({
          accessToken,
          refreshToken,
          user,
          role: user?.role || null,
        })
      },
      setUser: (user) => set({ user, role: user?.role || null }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "homeevo-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        user: state.user,
      }),
    }
  )
)
