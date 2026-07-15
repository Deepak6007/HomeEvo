"use client"

import * as React from "react"
import { LogOut, HardHat } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { NavItem } from "@/types"

export interface MobileNavProps {
  /** User role determining branding themes */
  role: "client" | "vendor" | "admin"
  /** List of navigation items */
  items: NavItem[]
  /** Logged-in user context */
  user: {
    name: string
    email: string
    avatarInitials: string
    avatarUrl?: string
  }
  /** Visibility state flag */
  open: boolean
  /** Triggered when the mobile drawer is closed */
  onClose: () => void
  /** Triggered on sign out click */
  onSignOut?: () => void
}

/**
 * MobileNav renders a slide-out drawer (using Sheet) containing sidebar navigation elements
 * optimized for smaller mobile screen widths.
 */
export const MobileNav: React.FC<MobileNavProps> = ({
  role,
  items,
  user,
  open,
  onClose,
  onSignOut,
}) => {
  const [activePath, setActivePath] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname)
    }
  }, [])

  // Brand and theme colors map based on roles
  const themeStyles = {
    client: {
      sheet: "bg-white text-[#3D2B1F]",
      logoFont: "font-serif text-[#3D2B1F]",
      bodyFont: "font-body",
      userCard: "bg-[#FDF8F2]/60 border-[#F7EFE4] text-[#3D2B1F]",
      badge: "bg-orange/15 text-orange",
      activeItem: "bg-orange-light text-orange border-r-4 border-orange",
      hoverItem: "hover:bg-[#FDF8F2] text-[#3D2B1F]/80 hover:text-[#3D2B1F]",
    },
    vendor: {
      sheet: "bg-[#111315] border-[#1E2226] text-white/90",
      logoFont: "font-industrial uppercase tracking-wider text-white",
      bodyFont: "font-mono text-xs",
      userCard: "bg-[#181B1E] border-[#1E2226] text-white/95",
      badge: "bg-orange/20 text-orange",
      activeItem: "bg-orange-glow text-orange border-l-4 border-orange",
      hoverItem: "hover:bg-[#1E2226] text-white/70 hover:text-white",
    },
    admin: {
      sheet: "bg-slate-950 border-slate-900 text-white/90",
      logoFont: "font-admin font-bold tracking-tight text-white",
      bodyFont: "font-admin text-sm",
      userCard: "bg-slate-900 border-slate-900 text-white/95",
      badge: "bg-blue-600/20 text-blue-400",
      activeItem: "bg-blue-600/10 text-blue-400 border-r-4 border-blue-600",
      hoverItem: "hover:bg-slate-900 text-white/70 hover:text-white",
    },
  }

  const styles = themeStyles[role]

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent
        side="left"
        className={cn(
          "w-72 p-0 flex flex-col justify-between border-r shadow-2xl h-full",
          styles.sheet,
          styles.bodyFont
        )}
      >
        <div>
          {/* Header Brand Section */}
          <SheetHeader
            className={cn(
              "h-16 flex items-center justify-between border-b px-5 select-none shrink-0 flex-row",
              role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange text-white shrink-0 shadow-sm">
                <HardHat className="h-5 w-5" />
              </span>
              <SheetTitle className={cn("text-lg font-bold tracking-tight text-left m-0", styles.logoFont)}>
                HomeEvo
              </SheetTitle>
            </div>
          </SheetHeader>

          {/* User Context Card Section */}
          <div
            className={cn(
              "p-4 border-b transition-all overflow-hidden",
              role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
            )}
          >
            <div className={cn("flex items-center rounded-lg p-3 border", styles.userCard)}>
              <Avatar className="h-9 w-9 bg-orange select-none shrink-0 font-semibold border border-background/20 shadow-2xs">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="bg-orange text-white text-xs">
                  {user.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 overflow-hidden leading-tight">
                <span className="text-sm font-medium block truncate max-w-[170px]">
                  {user.name}
                </span>
                <span className="text-2xs text-muted-foreground block truncate max-w-[170px] mb-1 font-normal">
                  {user.email}
                </span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider", styles.badge)}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav List Section */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {items.map((item) => {
              const isActive = activePath === item.href
              const Icon = item.icon

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActivePath(item.href)
                    onClose() // Close drawer after selection
                  }}
                  className={cn(
                    "flex items-center justify-between h-10 px-3.5 rounded-md font-medium text-xs tracking-wide transition-all select-none overflow-hidden",
                    isActive ? styles.activeItem : styles.hoverItem
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0", styles.badge)}>
                      {item.badge}
                    </span>
                  )}
                </a>
              )
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div
          className={cn(
            "p-3 border-t shrink-0",
            role === "client" ? "border-border" : role === "vendor" ? "border-[#1E2226]" : "border-slate-900"
          )}
        >
          <Button
            variant="ghost"
            onClick={() => {
              onClose()
              onSignOut?.()
            }}
            className="w-full h-10 flex items-center justify-start gap-3 px-3.5 rounded-md font-medium text-xs tracking-wide text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all select-none"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
export default MobileNav
