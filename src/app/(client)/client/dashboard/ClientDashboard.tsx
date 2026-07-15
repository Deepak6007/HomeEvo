"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { WelcomeBanner } from "@/components/client/WelcomeBanner"
import { StatsRow, StatsRowSkeleton } from "@/components/client/StatsRow"
import { ActiveProjectsCard } from "@/components/client/ActiveProjectsCard"
import { MilestoneWidget } from "@/components/client/MilestoneWidget"
import { EscrowSummaryCard } from "@/components/client/EscrowSummaryCard"
import { RecentVendorsCard } from "@/components/client/RecentVendorsCard"
import { ActivityFeedSection } from "@/components/client/ActivityFeedSection"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { SkeletonCard } from "@/components/shared/SkeletonCard"

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth()

  // Prepare fallback user details if not yet hydrated
  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Client User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [user])

  // Custom boundary fallback component with a Retry button
  const sectionFallback = (sectionName: string) => (error: Error, reset: () => void) => (
    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 text-center space-y-3">
      <p className="text-xs font-semibold text-red-600">
        Failed to load {sectionName}
      </p>
      <p className="text-2xs text-muted-foreground max-w-xs mx-auto">
        {error.message || "An unexpected error occurred while fetching section data."}
      </p>
      <button
        onClick={reset}
        className="text-2xs bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-md font-semibold transition-all active:scale-95 shadow-xs"
      >
        Retry
      </button>
    </div>
  )

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Row 1: Welcome Greeting Banner */}
        <WelcomeBanner />

        {/* Row 2: Stats Display (4 Columns) */}
        <ErrorBoundary fallback={sectionFallback("Dashboard Stats")}>
          <React.Suspense fallback={<StatsRowSkeleton />}>
            <StatsRow />
          </React.Suspense>
        </ErrorBoundary>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Projects List & Activities (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary fallback={sectionFallback("Active Projects")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="80px" />}>
                <ActiveProjectsCard />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Activity Feed")}>
              <React.Suspense fallback={<SkeletonCard lines={5} />}>
                <ActivityFeedSection />
              </React.Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Column: Wallet, Booked Pros & Milestones (1/3 width) */}
          <div className="space-y-6">
            <ErrorBoundary fallback={sectionFallback("Escrow Balance")}>
              <React.Suspense fallback={<SkeletonCard lines={3} height="120px" />}>
                <EscrowSummaryCard />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Booked Professionals")}>
              <React.Suspense fallback={<SkeletonCard lines={3} />}>
                <RecentVendorsCard />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Upcoming Milestones")}>
              <React.Suspense fallback={<SkeletonCard lines={4} />}>
                <MilestoneWidget />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

export default ClientDashboard
