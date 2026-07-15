"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Calendar, BarChart3, PieChart as PieIcon, MapPin, Download } from "lucide-react"
import dynamic from "next/dynamic"

const AnalyticsCharts = dynamic(() => import("@/components/admin/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="py-24 flex items-center justify-center bg-slate-900 border border-slate-850 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider animate-pulse">
          Loading charts telemetry...
        </span>
      </div>
    </div>
  ),
})

export default function AnalyticsPage() {
  const { user } = useAuth()

  // State Date filters
  const [dateRange, setDateRange] = React.useState({ start: "2025-07-01", end: "2026-06-30" })

  // Queries
  const { data: revenueRes } = useQuery({
    queryKey: ["admin", "analytics", "revenue", dateRange],
    queryFn: () => adminApi.analytics.getRevenueByMonth(),
  })

  const { data: userGrowthRes } = useQuery({
    queryKey: ["admin", "analytics", "growth", dateRange],
    queryFn: () => adminApi.analytics.getUserGrowth(),
  })

  const { data: topVendorsRes } = useQuery({
    queryKey: ["admin", "analytics", "top-vendors", dateRange],
    queryFn: () => adminApi.analytics.getTopVendors(),
  })

  // Mock data fallbacks
  const revenueData = (revenueRes?.data && revenueRes.data.length > 0) ? revenueRes.data : [
    { month: "Jul", revenue: 850000 },
    { month: "Aug", revenue: 1100000 },
    { month: "Sep", revenue: 950000 },
    { month: "Oct", revenue: 1400000 },
    { month: "Nov", revenue: 1650000 },
    { month: "Dec", revenue: 2100000 },
    { month: "Jan", revenue: 1950000 },
    { month: "Feb", revenue: 2400000 },
    { month: "Mar", revenue: 2850000 },
    { month: "Apr", revenue: 3200000 },
    { month: "May", revenue: 4100000 },
    { month: "Jun", revenue: 3850000 },
  ]

  const userGrowthData = (userGrowthRes?.data && userGrowthRes.data.length > 0) ? userGrowthRes.data : [
    { month: "Jul", clients: 400, vendors: 120 },
    { month: "Aug", clients: 480, vendors: 150 },
    { month: "Sep", clients: 550, vendors: 175 },
    { month: "Oct", clients: 640, vendors: 198 },
    { month: "Nov", clients: 720, vendors: 220 },
    { month: "Dec", clients: 810, vendors: 245 },
    { month: "Jan", clients: 900, vendors: 270 },
    { month: "Feb", clients: 990, vendors: 290 },
    { month: "Mar", clients: 1100, vendors: 310 },
    { month: "Apr", clients: 1250, vendors: 330 },
    { month: "May", clients: 1350, vendors: 340 },
    { month: "Jun", clients: 1420, vendors: 345 },
  ]

  const topVendors = (topVendorsRes?.data && topVendorsRes.data.length > 0) ? topVendorsRes.data : [
    { id: "v_1", name: "Satish Kumar K.", businessName: "Guntur Masonry & Builders", earnings: 680000, category: "Masonry" },
    { id: "v_2", name: "P. Ranganath", businessName: "Ranga Carpentry & Kitchens", earnings: 512000, category: "Carpentry" },
    { id: "v_3", name: "V. Anil Kumar", businessName: "Vizag Painters & Finishers", earnings: 420000, category: "Painting" },
    { id: "v_4", name: "Naidu Electricals", businessName: "Naidu Electricals", earnings: 385000, category: "Electrical" },
    { id: "v_5", name: "Gopal Raju", businessName: "Gopal Raju Steel fabrication", earnings: 295000, category: "Masonry" },
    { id: "v_6", name: "Kalyan Kumar", businessName: "Kalyan Plumbing Works", earnings: 210000, category: "Plumbing" },
    { id: "v_7", name: "Sri Srinivasa Tiles", businessName: "Srinivasa Tiling Services", earnings: 185000, category: "Masonry" },
    { id: "v_8", name: "AP Interior Studio", businessName: "Andhra Decorators", earnings: 160000, category: "Carpentry" },
  ]

  // Pie chart services categories data
  const servicesData = [
    { name: "Masonry / Civil", value: 45, color: "#3b82f6" },
    { name: "Carpentry & Modular", value: 25, color: "#10b981" },
    { name: "Painting & Texture", value: 15, color: "#f59e0b" },
    { name: "Electrical Hookups", value: 10, color: "#8b5cf6" },
    { name: "Plumbing & Sanitary", value: 5, color: "#ec4899" },
  ]

  // AP districts project geographic coverage data
  const geographicData = [
    { district: "Visakhapatnam", projects: 124, gmv: 3450000, vendors: 68 },
    { district: "Vijayawada (NTR)", projects: 98, gmv: 2800000, vendors: 52 },
    { district: "Guntur", projects: 85, gmv: 2100000, vendors: 45 },
    { district: "Nellore", projects: 54, gmv: 1350000, vendors: 28 },
    { district: "Tirupati (Chittoor)", projects: 48, gmv: 1100000, vendors: 24 },
    { district: "Kurnool", projects: 32, gmv: 850000, vendors: 18 },
    { district: "Kakinada (East Godavari)", projects: 30, gmv: 780000, vendors: 15 },
    { district: "Rajahmahendravaram", projects: 26, gmv: 620000, vendors: 12 },
  ]

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val)
  }

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Admin Ops",
      email: user?.email || "admin@homeevo.in",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "AD",
    }
  }, [user])

  return (
    <DashboardShell
      role="admin"
      navItems={adminNavItems}
      user={shellUser}
    >
      <div className="space-y-6 text-slate-100 font-admin">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Operational Analytics & Reports</h1>
            <p className="text-xs text-slate-400">Deep-dive tracking of project categories, cash volumes, and district penetration.</p>
          </div>

          {/* Date range picker for all charts */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-400 shrink-0">
            <Calendar className="h-4 w-4 text-blue-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-3xs text-white rounded px-2 py-0.5 outline-none font-mono"
            />
            <span>&rarr;</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-3xs text-white rounded px-2 py-0.5 outline-none font-mono"
            />
          </div>
        </div>

        {/* Interactive Charts (Dynamically Loaded) */}
        <AnalyticsCharts
          revenueData={revenueData}
          userGrowthData={userGrowthData}
          topVendors={topVendors}
          servicesData={servicesData}
          formatCurrency={formatCurrency}
        />

        {/* Lower Section: Geographic coverage table */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-400" /> Geographic District Coverage (Andhra Pradesh)
            </h3>
            <button
              onClick={() => toast.success("Region report generated for download.")}
              className="text-[10px] text-blue-400 font-bold uppercase hover:underline flex items-center gap-0.5"
            >
              <Download className="h-3 w-3" /> Export Region CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="pb-2.5 pl-1.5">AP District</th>
                  <th className="pb-2.5 text-right">Project Count</th>
                  <th className="pb-2.5 text-right">Verified Contractors</th>
                  <th className="pb-2.5 text-right pr-1.5">Gross Escrow Value (GMV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {geographicData.map((reg) => (
                  <tr key={reg.district} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-2.5 pl-1.5 font-bold text-white">{reg.district}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{reg.projects}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{reg.vendors}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-blue-400 pr-1.5">
                      {formatCurrency(reg.gmv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardShell>
  )
}
