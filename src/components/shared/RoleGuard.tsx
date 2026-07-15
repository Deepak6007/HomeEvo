"use client"

import * as React from "react"
import { useAuthStore } from "@/stores/authStore"
import { Role } from "@/types"

export interface RoleGuardProps {
  /** The list of user roles authorized to view the children components */
  allowedRoles: Role[]
  /** Elements to render if the user's role is in the allowedRoles list */
  children: React.ReactNode
  /** Optional fallback interface to render if the user is unauthorized */
  fallback?: React.ReactNode
}

/**
 * RoleGuard provides client-side role-based authorization for UI rendering.
 * It reads the user context from useAuthStore and renders children or fallbacks.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const user = useAuthStore((state) => state.user)

  // Verify authorization
  const isAuthorized = user && allowedRoles.includes(user.role)

  if (!isAuthorized) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default RoleGuard
