"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { paymentsApi } from "@/lib/api/payments"
import { formatCurrency } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Wallet } from "lucide-react"
import Link from "next/link"

export const EscrowSummaryCard: React.FC = () => {
  const { data: balance } = useSuspenseQuery({
    queryKey: queryKeys.escrow.balance(),
    queryFn: () => paymentsApi.getEscrowBalance(),
  })

  const total = balance.total || 0
  const released = balance.released || 0
  const pending = balance.pending || 0
  const upcoming = balance.upcoming || 0

  // Calculate percentages for horizontal stacked bar chart
  const sum = released + pending + upcoming
  const releasedPct = sum > 0 ? Math.round((released / sum) * 100) : 0
  const pendingPct = sum > 0 ? Math.round((pending / sum) * 100) : 0
  const upcomingPct = sum > 0 ? Math.round((upcoming / sum) * 100) : 0

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg font-bold text-[#3D2B1F] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#E85D04]" />
            Escrow Escort
          </h3>
          <span className="text-2xs text-[#6F5B4B] font-semibold bg-[#FDF8F2] border border-border/80 px-2 py-0.5 rounded-md">
            Secured Escrow
          </span>
        </div>

        {/* Big Balance */}
        <div className="space-y-1 mb-6">
          <span className="text-2xs text-[#6F5B4B] font-medium tracking-wide uppercase block">
            Total Account Value
          </span>
          <span className="text-3xl font-bold tracking-tight text-[#3D2B1F] block">
            {formatCurrency(total)}
          </span>
        </div>

        {/* CSS Horizontal Stacked Bar Chart */}
        <div className="space-y-4 mb-6">
          <div className="w-full h-3 rounded-full bg-border/40 flex overflow-hidden">
            {releasedPct > 0 && (
              <div
                style={{ width: `${releasedPct}%` }}
                className="bg-green-500 h-full hover:opacity-90 transition-all duration-300"
                title={`Released: ${releasedPct}%`}
              />
            )}
            {pendingPct > 0 && (
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-[#E85D04] h-full hover:opacity-90 transition-all duration-300"
                title={`Pending: ${pendingPct}%`}
              />
            )}
            {upcomingPct > 0 && (
              <div
                style={{ width: `${upcomingPct}%` }}
                className="bg-amber-500 h-full hover:opacity-90 transition-all duration-300"
                title={`Upcoming: ${upcomingPct}%`}
              />
            )}
          </div>

          {/* Breakdown items */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-1 text-left">
              <span className="inline-flex items-center gap-1.5 text-2xs text-[#6F5B4B] font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                Released
              </span>
              <span className="font-semibold text-[#3D2B1F] block">{formatCurrency(released)}</span>
            </div>
            <div className="space-y-1 text-center">
              <span className="inline-flex items-center gap-1.5 text-2xs text-[#6F5B4B] font-medium">
                <span className="h-2 w-2 rounded-full bg-[#E85D04] shrink-0" />
                Pending
              </span>
              <span className="font-semibold text-[#3D2B1F] block">{formatCurrency(pending)}</span>
            </div>
            <div className="space-y-1 text-right">
              <span className="inline-flex items-center gap-1.5 text-2xs text-[#6F5B4B] font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                Upcoming
              </span>
              <span className="font-semibold text-[#3D2B1F] block">{formatCurrency(upcoming)}</span>
            </div>
          </div>
        </div>
      </div>

      <Link href="/client/wallet" passHref legacyBehavior>
        <Button className="w-full bg-[#3D2B1F] text-white hover:bg-[#2C1F16] font-semibold text-xs active:scale-95 transition-all mt-4">
          <Wallet className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </Link>
    </div>
  )
}

export default EscrowSummaryCard
