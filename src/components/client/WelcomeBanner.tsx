"use client"

import * as React from "react"
import { useProjects } from "@/hooks/useProjects"
import { useEscrowBalance } from "@/hooks/useEscrow"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils/format"

export const WelcomeBanner: React.FC = () => {
  const { user } = useAuth()
  const { data: projectsRes } = useProjects({ status: "active" })
  const { data: balance } = useEscrowBalance()

  const activeCount = projectsRes?.data?.length || 0
  const escrowTotal = balance?.total || 0

  // Dynamic greeting based on time of day
  const [greeting, setGreeting] = React.useState("Welcome back")
  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const name = user?.name || "Client"

  // Format escrow balance in Lakhs (₹L) if >= 1,00,000
  const formattedEscrow = React.useMemo(() => {
    if (escrowTotal >= 100000) {
      return `₹${(escrowTotal / 100000).toFixed(1)}L`
    }
    return formatCurrency(escrowTotal)
  }, [escrowTotal])

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FDF8F2] via-[#F5ECE1] to-[#E85D04]/10 border border-[#E85D04]/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
      {/* Decorative background circle pattern */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
        <svg width="250" height="250" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#E85D04" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" stroke="#E85D04" strokeWidth="1" />
          <circle cx="50" cy="50" r="20" stroke="#E85D04" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="space-y-2 z-10">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3D2B1F] tracking-tight">
          {greeting}, {name} 🌿
        </h1>
        <p className="text-sm md:text-base text-[#6F5B4B] font-medium tracking-wide">
          {activeCount} active {activeCount === 1 ? "project" : "projects"} &middot; {formattedEscrow} in escrow
        </p>
      </div>

      <div className="flex items-center gap-3 z-10 shrink-0">
        <Link href="/client/projects?new=true" passHref legacyBehavior>
          <Button className="bg-[#E85D04] text-white hover:bg-[#D45203] font-medium transition-all active:scale-95 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
        <Link href="/client/vendors" passHref legacyBehavior>
          <Button variant="outline" className="border-[#3D2B1F]/20 text-[#3D2B1F] hover:bg-[#3D2B1F]/5 font-medium transition-all active:scale-95">
            <Search className="mr-2 h-4 w-4" /> Browse Vendors
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default WelcomeBanner
