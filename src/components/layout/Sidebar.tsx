"use client"

import * as React from "react"
import { LogOut, ChevronLeft, ChevronRight, HardHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils/cn"
import { NavItem } from "@/types"

export interface SidebarProps {
  /** User role determining the color palette and typography styles */
  role: "client" | "vendor" | "admin"
  /** List of navigation items containing labels, links, icons, and optional badges */
  items: NavItem[]
  /** Object representing the logged-in user profile */
  user: {
    name: string
    email: string
    avatarInitials: string
    avatarUrl?: string
  }
  /** Collapsed toggle state flag */
  collapsed: boolean
  /** Triggered when the collapse switch is toggled */
  onCollapse: () => void
  /** Optional custom signout handler */
  onSignOut?: () => void
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * Sidebar renders the main navigation container.
 * It manages layout options, custom branding themes, and collapse states.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  role,
  items,
  user,
  collapsed,
  onCollapse,
  onSignOut,
  className,
}) => {
  // We can track the active state using window.location.pathname.
  const [activePath, setActivePath] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname)
    }
  }, [])

  // Brand and theme colors map based on roles
  const themeStyles = {
    client: {
      sidebar: "bg-white border-border text-[#3D2B1F]",
      logoFont: "font-serif text-[#3D2B1F]",
      bodyFont: "font-body",
      userCard: "bg-[#FDF8F2]/50 border-[#F7EFE4]",
      badge: "bg-orange/15 text-orange",
      activeItem: "bg-orange-light text-orange border-r-4 border-orange",
      hoverItem: "hover:bg-[#FDF8F2] text-[#3D2B1F]/80 hover:text-[#3D2B1F]",
      toggleBtn: "hover:bg-[#FDF8F2] text-[#3D2B1F]/60 hover:text-[#3D2B1F]",
    },
    vendor: {
      sidebar: "bg-[#111315] border-[#1E2226] text-white/90",
      logoFont: "font-industrial uppercase tracking-wider text-white",
      bodyFont: "font-mono text-xs",
      userCard: "bg-[#181B1E] border-[#1E2226]",
      badge: "bg-orange/20 text-orange",
      activeItem: "bg-orange-glow text-orange border-l-4 border-orange",
      hoverItem: "hover:bg-[#1E2226] text-white/70 hover:text-white",
      toggleBtn: "hover:bg-[#1E2226] text-white/50 hover:text-white",
    },
    admin: {
      sidebar: "bg-slate-950 border-slate-900 text-white/90",
      logoFont: "font-admin font-bold tracking-tight text-white",
      bodyFont: "font-admin text-sm",
      userCard: "bg-slate-900 border-slate-900",
      badge: "bg-blue-600/20 text-blue-400",
      activeItem: "bg-blue-600/10 text-blue-400 border-r-4 border-blue-600",
      hoverItem: "hover:bg-slate-900 text-white/70 hover:text-white",
      toggleBtn: "hover:bg-slate-900 text-white/50 hover:text-white",
    },
  }

  const styles = themeStyles[role]

  return (
    <aside
      className={cn(
        "h-screen border-r flex flex-col justify-between transition-all duration-300 z-40 fixed top-0 left-0",
        collapsed ? "w-20" : "w-64",
        styles.sidebar,
        styles.bodyFont,
        className
      )}
    >
      {/* Top Brand Logo Section */}
      <div>
        <div
          className={cn(
            "h-16 flex items-center border-b px-5 select-none overflow-hidden shrink-0",
            collapsed ? "justify-center" : "justify-between",
            role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange text-white shrink-0 shadow-sm transition-transform hover:scale-105">
              <HardHat className="h-5 w-5" />
            </span>
            {!collapsed && (
              <span className={cn("text-lg font-bold tracking-tight", styles.logoFont)}>
                HomeEvo
              </span>
            )}
          </div>
        </div>

        {/* User Profile Card Section */}
        <div
          className={cn(
            "p-4 border-b transition-all duration-300 overflow-hidden",
            role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
          )}
        >
          <div className={cn("flex items-center rounded-lg p-2 border transition-colors", collapsed ? "justify-center border-transparent bg-transparent p-0" : styles.userCard)}>
            <Avatar className="h-9 w-9 bg-orange select-none shrink-0 font-semibold border border-background/20 shadow-2xs">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-orange text-white text-xs">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="ml-3 overflow-hidden leading-tight">
                <span className="text-sm font-medium text-foreground block truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-2xs text-muted-foreground block truncate max-w-[140px] mb-1 font-normal">
                  {user.email}
                </span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider", styles.badge)}>
                  {role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Links Section */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {items.map((item) => {
            const isActive = activePath === item.href
            const Icon = item.icon

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  // Allow browser navigation, update local state for preview
                  setActivePath(item.href)
                }}
                className={cn(
                  "flex items-center h-10 px-3.5 rounded-md font-medium text-xs tracking-wide transition-all select-none overflow-hidden",
                  isActive ? styles.activeItem : styles.hoverItem,
                  collapsed ? "justify-center" : "justify-between"
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                
                {!collapsed && item.badge && (
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0", styles.badge)}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange" />
                )}
              </a>
            )
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions (Collapse & Logout) */}
      <div
        className={cn(
          "p-3 space-y-1 border-t shrink-0",
          role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
        )}
      >
        {/* Collapse Toggle Switch */}
        <Button
          variant="ghost"
          onClick={onCollapse}
          className={cn("w-full h-10 flex items-center justify-start gap-3 px-3.5 rounded-md font-medium text-xs tracking-wide transition-colors duration-200 select-none", styles.toggleBtn)}
        >
          {collapsed ? (
            <>
              <ChevronRight className="h-4.5 w-4.5 shrink-0 mx-auto" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4.5 w-4.5 shrink-0" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </Button>

        {/* Logout Control Button */}
        <Button
          variant="ghost"
          onClick={onSignOut}
          className={cn(
            "w-full h-10 flex items-center justify-start gap-3 px-3.5 rounded-md font-medium text-xs tracking-wide transition-all select-none",
            "text-red-500 hover:text-red-600 hover:bg-red-500/10"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}
export default Sidebar
