import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"

export function useAuth() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    let isMounted = true

    const hydrateUser = async () => {
      // Hydrate user profile if token is present but user data is not yet loaded in-memory
      if (accessToken && !user) {
        try {
          const userData = await authApi.me()
          if (isMounted) {
            setUser(userData)
          }
        } catch (error) {
          console.error("Failed to hydrate user profile:", error)
          if (isMounted) {
            clearAuth()
            router.push("/signin")
          }
        }
      }
    }

    hydrateUser()

    return () => {
      isMounted = false
    }
  }, [accessToken, user, setUser, clearAuth, router])

  const signout = async () => {
    try {
      await authApi.signout()
    } catch (error) {
      console.error("Error during API signout request:", error)
    } finally {
      clearAuth()
      router.push("/signin")
    }
  }

  return {
    user,
    role,
    isAuthenticated: !!accessToken,
    signout,
  }
}
