import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setMobileNav: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNav: (open) => set({ mobileNavOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "homeevo-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
