"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { MessagesView } from "@/components/shared/MessagesView";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const VendorMessagesContainer: React.FC = () => {
  const { user } = useAuth();

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "VU",
    };
  }, [user]);

  const errorFallback = (error: Error, reset: () => void) => (
    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center space-y-4 max-w-md mx-auto my-12 font-mono text-xs">
      <p className="text-sm font-semibold text-red-500">FAILED TO LOAD INBOX</p>
      <p className="text-[10px] text-neutral-400">{error.message}</p>
      <button
        onClick={reset}
        className="text-[10px] bg-orange text-white hover:bg-orange/90 px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-sm"
      >
        RELOAD INBOX
      </button>
    </div>
  );

  return (
    <DashboardShell role="vendor" navItems={vendorNavItems} user={shellUser}>
      <ErrorBoundary fallback={errorFallback}>
        <MessagesView role="vendor" />
      </ErrorBoundary>
    </DashboardShell>
  );
};

export default VendorMessagesContainer;
