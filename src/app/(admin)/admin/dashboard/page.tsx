"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  IndianRupee, 
  Activity, 
  Database, 
  Server, 
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts"

export default function AdminDashboardPage() {
  const { user } = useAuth()

  // Queries for stats
  const { data: statsRes, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.analytics.getOverview(),
  })

  const { data: revenueRes, isLoading: isRevLoading } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: () => adminApi.analytics.getRevenueByMonth(),
  })

  const { data: userGrowthRes, isLoading: isGrowthLoading } = useQuery({
    queryKey: ["admin", "userGrowth"],
    queryFn: () => adminApi.analytics.getUserGrowth(),
  })

  const { data: recentUsersRes, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin", "recentUsers"],
    queryFn: () => adminApi.users.list({ page: 1, pageSize: 10 }),
  })

  const { data: healthRes, isLoading: isHealthLoading } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: () => adminApi.system.getHealth(),
    refetchInterval: 15000, // Poll system health every 15s
  })

  // Mock Fallbacks for Offline Mode
  const stats = {
    totalUsers: 1420,
    activeVendors: 345,
    pendingVerifications: 12,
    todayGmv: 485000,
    ...(statsRes?.data && !Array.isArray(statsRes.data) ? statsRes.data : {})
  }

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

  const recentUsers = (recentUsersRes?.data && recentUsersRes.data.length > 0) ? recentUsersRes.data : [
    { id: "u_1", name: "Suresh Kondeti", email: "suresh@apbuild.com", role: "vendor", status: "active", createdAt: "2026-06-01T10:45:00Z" },
    { id: "u_2", name: "Ananya Reddi", email: "ananya.r@outlook.com", role: "client", status: "active", createdAt: "2026-06-01T09:12:00Z" },
    { id: "u_3", name: "Naidu Electricals", email: "naidu.elec@gmail.com", role: "vendor", status: "active", createdAt: "2026-06-01T08:30:00Z" },
    { id: "u_4", name: "P. Srinivasa Rao", email: "psr.guntur@yahoo.com", role: "client", status: "active", createdAt: "2026-05-31T17:05:00Z" },
    { id: "u_5", name: "Gopal Raju", email: "gopal.raju@construction.in", role: "vendor", status: "active", createdAt: "2026-05-31T15:20:00Z" },
    { id: "u_6", name: "Chaitanya V.", email: "chaitanya@vizagdesign.com", role: "client", status: "suspended", createdAt: "2026-05-31T11:10:00Z" },
    { id: "u_7", name: "AP Masonry Group", email: "contact@apmasonry.in", role: "vendor", status: "active", createdAt: "2026-05-31T09:40:00Z" },
    { id: "u_8", name: "B. Lakshmi", email: "lakshmi.b@gmail.com", role: "client", status: "active", createdAt: "2026-05-30T16:15:00Z" },
    { id: "u_9", name: "Kalyan Kumar", email: "kalyan.plumbing@gmail.com", role: "vendor", status: "active", createdAt: "2026-05-30T14:02:00Z" },
    { id: "u_10", name: "M. Subba Reddy", email: "subbareddy@ap.gov.in", role: "client", status: "active", createdAt: "2026-05-30T11:55:00Z" },
  ]

  const health = {
    latency: 48,
    dbConnections: 14,
    queueDepth: 2,
    errorRate: 0.12,
    ...(healthRes?.data && !Array.isArray(healthRes.data) ? healthRes.data : {})
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

  const handleRefresh = () => {
    refetchStats()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <DashboardShell
      role="admin"
      navItems={adminNavItems}
      user={shellUser}
    >
      <div className="space-y-6 text-slate-100 font-admin">
        
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Operations Control Center</h1>
            <p className="text-xs text-slate-400">Live platform management, system telemetry, and escalation dashboards.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Telemetry Refresh</span>
          </button>
        </div>

        {/* 4 Platform overview stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Users */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">TOTAL SIGNUPS</span>
              <UsersIcon className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-[10px] text-green-400 ml-1.5 font-medium">+12% vs last month</span>
            </div>
          </Card>

          {/* Active Contractors */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">ACTIVE VENDORS</span>
              <ShieldCheck className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {stats.activeVendors.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-400 ml-1.5 font-medium">94% availability rate</span>
            </div>
          </Card>

          {/* Pending Verifications */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">PENDING VERIFICATION</span>
              <div className="relative">
                <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {stats.pendingVerifications.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-500 ml-1.5 font-medium">Require action</span>
            </div>
          </Card>

          {/* Today's GMV */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">TODAY'S ESCROW GMV</span>
              <IndianRupee className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {formatCurrency(stats.todayGmv)}
              </span>
              <span className="text-[10px] text-green-400 ml-1.5 font-medium">+24% vs yesterday</span>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue chart (LineChart) */}
          <Card className="bg-slate-900 border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">12-Month Escrow GMV Volume</h3>
              <Badge className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border-transparent text-[10px] font-bold">5% Platform cut</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={(v) => `₹${v/100000}L`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#3b82f6", fontSize: "11px" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Escrow Volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5}
                    dot={{ fill: "#0f172a", stroke: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* User growth chart (AreaChart) */}
          <Card className="bg-slate-900 border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platform Registration Curves</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px" }} />
                  <Area 
                    type="monotone" 
                    dataKey="clients" 
                    name="Clients (Homeowners)" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorClients)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vendors" 
                    name="Vendors (Contractors)" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorVendors)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Lower Row: Signups + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Signups Table (last 10 users) */}
          <Card className="bg-slate-900 border-slate-800 p-4 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Platform Registrations</h3>
              <a 
                href="/admin/users" 
                className="text-[10px] text-blue-400 font-bold uppercase hover:underline"
              >
                Inspect Users &rarr;
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-2.5 pl-1.5">User</th>
                    <th className="pb-2.5">Email</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5 text-right">Status</th>
                    <th className="pb-2.5 text-right pr-1.5">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {recentUsers.map((u: any) => {
                    const formattedDate = new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit"
                    })

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 pl-1.5 font-medium text-white">{u.name}</td>
                        <td className="py-2.5 text-slate-400 font-mono text-[11px]">{u.email}</td>
                        <td className="py-2.5 font-mono text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            u.role === 'vendor' ? 'bg-orange/10 text-orange' : 'bg-blue-600/10 text-blue-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`h-1.5 w-1.5 rounded-full inline-block mr-1.5 ${
                            u.status === "active" ? "bg-green-500" : "bg-red-500"
                          }`} />
                          <span className="capitalize">{u.status}</span>
                        </td>
                        <td className="py-2.5 text-right pr-1.5 text-slate-400 font-mono text-[10px]">{formattedDate}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* System Health Indicators */}
          <Card className="bg-slate-900 border-slate-800 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Telemetry Health Grid</h3>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Latency */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  <span>API Latency</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-lg font-bold text-white font-mono">{health.latency}</span>
                  <span className="text-3xs text-slate-500 ml-1">ms</span>
                </div>
                <div className="mt-1 flex items-center text-[9px] text-green-400 font-medium">
                  <span className="h-1 w-1 bg-green-400 rounded-full mr-1" />
                  Optimal
                </div>
              </div>

              {/* DB Connections */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                  <Database className="h-3.5 w-3.5 text-blue-400" />
                  <span>DB Pools</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-lg font-bold text-white font-mono">{health.dbConnections}</span>
                  <span className="text-3xs text-slate-500 ml-1">conns</span>
                </div>
                <div className="mt-1 flex items-center text-[9px] text-blue-400 font-medium">
                  <span className="h-1 w-1 bg-blue-400 rounded-full mr-1" />
                  14% cap
                </div>
              </div>

              {/* Job Queue Depth */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                  <Server className="h-3.5 w-3.5 text-blue-400" />
                  <span>Queue Depth</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-lg font-bold text-white font-mono">{health.queueDepth}</span>
                  <span className="text-3xs text-slate-500 ml-1">jobs</span>
                </div>
                <div className="mt-1 flex items-center text-[9px] text-green-400 font-medium">
                  <span className="h-1 w-1 bg-green-400 rounded-full mr-1" />
                  Empty
                </div>
              </div>

              {/* Error Rate */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                  <AlertTriangle className="h-3.5 w-3.5 text-blue-400" />
                  <span>Error Rate</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-lg font-bold text-white font-mono">{health.errorRate}%</span>
                </div>
                <div className="mt-1 flex items-center text-[9px] text-green-400 font-medium">
                  <span className="h-1 w-1 bg-green-400 rounded-full mr-1" />
                  &lt; 0.5% threshold
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href="/admin/system" 
                className="w-full text-center block px-3 py-2 border border-slate-800 rounded bg-slate-950 hover:bg-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-white uppercase transition-all"
              >
                Clear Cache & Restart Queues
              </a>
            </div>
          </Card>
        </div>

      </div>
    </DashboardShell>
  )
}
