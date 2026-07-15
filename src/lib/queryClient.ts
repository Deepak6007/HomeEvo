import { QueryClient } from "@tanstack/react-query"

/**
 * Creates and configures a new QueryClient instance with production performance settings.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes (default stale state trigger)
        gcTime: 10 * 60 * 1000,    // 10 minutes (garbage collect unused query caches)
        retry: 2,                  // Retry failed queries up to twice
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchOnWindowFocus: false, // Prevent redundant focus fetches in production
      },
      mutations: {
        retry: 0,                  // Never automatic-retry mutations (non-idempotent safeguard)
      },
    },
  })
}
