"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { projectsApi } from "@/lib/api/projects"
import { paymentsApi } from "@/lib/api/payments"
import { StatCard } from "@/components/shared/StatCard"
import { formatCurrency } from "@/lib/utils/format"
import { Briefcase, IndianRupee, ShieldCheck, Users } from "lucide-react"

export const StatsRow: React.FC = () => {
  const { data: projectsRes } = useSuspenseQuery({
    queryKey: queryKeys.projects.list({ status: "active" }),
    queryFn: () => projectsApi.list({ status: "active" }),
  })

  const { data: balance } = useSuspenseQuery({
    queryKey: queryKeys.escrow.balance(),
    queryFn: () => paymentsApi.getEscrowBalance(),
  })

  const activeCount = projectsRes.data?.length || 0
  const totalReleased = balance.released || 0
  const escrowPending = balance.pending || 0

  // Count unique vendors from active projects
  const uniqueVendors = React.useMemo(() => {
    const list = projectsRes.data || []
    const ids = list.map((p) => p.vendorId).filter((id): id is string => !!id)
    return new Set(ids).size
  }, [projectsRes.data])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Projects"
        value={activeCount}
        change={{ value: "+1", direction: "up" }}
        icon={<Briefcase className="h-5 w-5" />}
        variant="blue"
      />
      <StatCard
        label="Total Invested"
        value={formatCurrency(totalReleased)}
        change={{ value: "+8%", direction: "up" }}
        icon={<IndianRupee className="h-5 w-5" />}
        variant="green"
      />
      <StatCard
        label="In Escrow"
        value={formatCurrency(escrowPending)}
        change={{ value: "Stable", direction: "neutral" }}
        icon={<ShieldCheck className="h-5 w-5" />}
        variant="orange"
      />
      <StatCard
        label="Vendors Hired"
        value={uniqueVendors}
        change={{ value: "+1", direction: "up" }}
        icon={<Users className="h-5 w-5" />}
        variant="amber"
      />
    </div>
  )
}

export const StatsRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Active Projects" value="" isLoading={true} variant="blue" />
      <StatCard label="Total Invested" value="" isLoading={true} variant="green" />
      <StatCard label="In Escrow" value="" isLoading={true} variant="orange" />
      <StatCard label="Vendors Hired" value="" isLoading={true} variant="amber" />
    </div>
  )
}

export default StatsRow
