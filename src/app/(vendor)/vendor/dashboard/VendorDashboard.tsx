"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

// Import all vendor components from index
import {
  AvailabilityToggle,
  VendorWelcomeBanner,
  VendorStatsRow,
  ActiveProjectsPanel,
  NewLeadsPanel,
  MilestonePaymentsCard,
  QuickActionsGrid,
  ProfileCompletionCard,
} from "@/components/vendor";
import dynamic from "next/dynamic";

const EarningsChart = dynamic(() => import("@/components/vendor/EarningsChart"), {
  ssr: false,
  loading: () => <SkeletonCard lines={4} height="320px" />,
});

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "VP",
    };
  }, [user]);

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
  );

  return (
    <DashboardShell 
      role="vendor" 
      navItems={vendorNavItems} 
      user={shellUser} 
      topbarActions={<AvailabilityToggle />}
    >
      {/* Blueprint grid overlay backdrop */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 space-y-6">
        {/* Row 1: Welcome Greeting Banner */}
        <VendorWelcomeBanner />

        {/* Row 2: Stats Row */}
        <ErrorBoundary fallback={sectionFallback("Dashboard Stats")}>
          <React.Suspense fallback={<SkeletonCard lines={3} height="130px" />}>
            <VendorStatsRow />
          </React.Suspense>
        </ErrorBoundary>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Projects, Milestone Escrows, and New Leads (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary fallback={sectionFallback("Active Projects")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="200px" />}>
                <ActiveProjectsPanel />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Escrow Payments")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="220px" />}>
                <MilestonePaymentsCard />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("New Leads")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="250px" />}>
                <NewLeadsPanel />
              </React.Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Column: Earnings Chart, Quick Actions, and Profile Completion (1/3 width) */}
          <div className="space-y-6">
            <ErrorBoundary fallback={sectionFallback("Revenue Overview")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="320px" />}>
                <EarningsChart />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Quick Actions")}>
              <React.Suspense fallback={<SkeletonCard lines={3} height="180px" />}>
                <QuickActionsGrid />
              </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={sectionFallback("Profile Integrity")}>
              <React.Suspense fallback={<SkeletonCard lines={4} height="250px" />}>
                <ProfileCompletionCard />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default VendorDashboard;
