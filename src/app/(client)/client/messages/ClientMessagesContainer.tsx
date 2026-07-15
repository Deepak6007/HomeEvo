"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { clientNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { MessagesView } from "@/components/shared/MessagesView";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const ClientMessagesContainer: React.FC = () => {
  const { user } = useAuth();

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
    };
  }, [user]);

  const errorFallback = (error: Error, reset: () => void) => (
    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
      <p className="text-sm font-semibold text-red-600">Failed to load Inbox</p>
      <p className="text-xs text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="text-xs bg-orange text-white hover:bg-orange/90 px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 shadow-sm"
      >
        Reload Page
      </button>
    </div>
  );

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <ErrorBoundary fallback={errorFallback}>
        <MessagesView role="client" />
      </ErrorBoundary>
    </DashboardShell>
  );
};

export default ClientMessagesContainer;
