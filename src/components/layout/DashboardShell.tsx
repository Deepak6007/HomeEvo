"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { MobileNav } from "./MobileNav"
import { cn } from "@/lib/utils/cn"
import { authApi } from "@/lib/api"
import { NavItem } from "@/types"

export interface DashboardShellProps {
  /** User dashboard role determining themes and fonts */
  role: "client" | "vendor" | "admin"
  /** Navigation configuration items */
  navItems: NavItem[]
  /** Core children page content */
  children: React.ReactNode
  /** Currently authenticated user details */
  user: {
    name: string
    email: string
    avatarInitials: string
    avatarUrl?: string
  }
  /** Optional custom actions to render in the top bar */
  topbarActions?: React.ReactNode
}

/**
 * DashboardShell is the top-level layout component for dashboards.
 * It ties together Topbars, Sidebars, Mobile drawers, and coordinates
 * size transitions and role themes.
 */
export const DashboardShell: React.FC<DashboardShellProps> = ({
  role,
  navItems,
  children,
  user,
  topbarActions,
}) => {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [currentPageTitle, setCurrentPageTitle] = React.useState("Dashboard")

  const handleSignOut = async () => {
    // Clear cookie named 'homeevo-token'
    document.cookie = "homeevo-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    try {
      await authApi.signout()
    } catch (e) {
      console.error("Signout failed:", e)
    }
    router.push("/signin")
  }

  // Dynamically resolve page title from path match or default to dashboard
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname
      const matchedItem = navItems.find((item) => item.href === currentPath)
      if (matchedItem) {
        setCurrentPageTitle(matchedItem.label)
      } else {
        // Fallback or custom titles matching admin overview, etc.
        if (currentPath.includes("/dashboard") || currentPath.includes("/overview")) {
          setCurrentPageTitle("Dashboard Overview")
        } else if (currentPath.includes("/settings")) {
          setCurrentPageTitle("Account Settings")
        }
      }
    }
  }, [navItems])

  // Shell themes and font bindings per user role
  const shellThemes = {
    client: {
      shellBg: "bg-[#FDF8F2] text-[#3D2B1F]",
      fontFamily: "font-body",
      mainBg: "bg-white/40",
    },
    vendor: {
      shellBg: "bg-[#0C0D0F] text-white/90",
      fontFamily: "font-mono text-xs",
      mainBg: "bg-[#111315]/50",
    },
    admin: {
      shellBg: "bg-slate-950 text-white/90",
      fontFamily: "font-admin text-sm",
      mainBg: "bg-slate-900/30",
    },
  }

  const theme = shellThemes[role]

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", theme.shellBg, theme.fontFamily)}>
      {/* Desktop Sidebar Layout */}
      <Sidebar
        role={role}
        items={navItems}
        user={user}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={handleSignOut}
        className="hidden lg:flex"
      />

      {/* Slide Navigation Drawer for Mobile Viewports */}
      <MobileNav
        role={role}
        items={navItems}
        user={user}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Wrappers */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Topbar
          role={role}
          pageTitle={currentPageTitle}
          onMenuClick={() => setMobileNavOpen(true)}
          actions={topbarActions}
        />

        <main className={cn("flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto", theme.mainBg)}>
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
export default DashboardShell
