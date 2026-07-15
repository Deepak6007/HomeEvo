"use client"

import * as React from "react"
import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export interface TopbarProps {
  /** User role determining the visual branding styles */
  role: "client" | "vendor" | "admin"
  /** Title text representing the active page view */
  pageTitle: string
  /** Triggered when the hamburger menu is clicked on mobile screens */
  onMenuClick: () => void
  /** Optional custom action nodes to render on the right-hand side */
  actions?: React.ReactNode
}

/**
 * Topbar renders the dashboard header panel.
 * It dynamically handles menu toggles, title formatting per role typography,
 * and profile/notification slots.
 */
export const Topbar: React.FC<TopbarProps> = ({
  role,
  pageTitle,
  onMenuClick,
  actions,
}) => {
  // Theme styling configurations based on user role
  const roleStyles = {
    client: {
      bar: "bg-white border-border text-foreground",
      title: "font-serif text-lg font-semibold text-[#3D2B1F]",
      btn: "hover:bg-[#FDF8F2] text-[#3D2B1F]/70 hover:text-[#3D2B1F]",
    },
    vendor: {
      bar: "bg-[#111315] border-[#1E2226] text-white",
      title: "font-industrial text-xl uppercase tracking-wider text-white",
      btn: "hover:bg-[#1E2226] text-white/70 hover:text-white",
    },
    admin: {
      bar: "bg-slate-950 border-slate-900 text-white",
      title: "font-admin text-lg font-semibold tracking-tight text-white",
      btn: "hover:bg-slate-900 text-white/70 hover:text-white",
    },
  }

  const styles = roleStyles[role]

  return (
    <header
      className={cn(
        "h-16 w-full border-b flex items-center justify-between px-4 sticky top-0 z-30 transition-colors duration-300",
        styles.bar
      )}
    >
      {/* Left Menu / Hamburger Trigger + Title Area */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className={cn("lg:hidden shrink-0", styles.btn)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        
        <h2 className={styles.title}>
          {pageTitle}
        </h2>
      </div>

      {/* Right User Actions Area */}
      <div className="flex items-center gap-2">
        {actions ? (
          actions
        ) : (
          <>
            {/* Fallback actions */}
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("relative shrink-0", styles.btn)}
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-full border border-border/30 shrink-0", styles.btn)}
            >
              <User className="h-4 w-4" />
              <span className="sr-only">User Profile</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
export default Topbar
