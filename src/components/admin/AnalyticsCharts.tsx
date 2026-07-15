"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie
} from "recharts"
import { PieChart as PieIcon } from "lucide-react"

interface AnalyticsChartsProps {
  revenueData: any[]
  userGrowthData: any[]
  topVendors: any[]
  servicesData: any[]
  formatCurrency: (val: number) => string
}

export default function AnalyticsCharts({
  revenueData,
  userGrowthData,
  topVendors,
  servicesData,
  formatCurrency,
}: AnalyticsChartsProps) {
  return (
    <>
      {/* Row 1: Charts (Revenue + User curves) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue month-by-month */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Revenue Month-By-Month (GMV)</h3>
          <div className="h-60">
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
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#0f172a", stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Registration growth curve */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Clients vs Vendors Cumulative</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="anColorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="anColorVendors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
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
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "10px" }} />
                <Area type="monotone" dataKey="clients" name="Clients" stroke="#3b82f6" fill="url(#anColorClients)" strokeWidth={2} />
                <Area type="monotone" dataKey="vendors" name="Vendors" stroke="#10b981" fill="url(#anColorVendors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Charts (Top earners + Services Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Vendors Horizontal bar chart (2/3 width) */}
        <Card className="bg-slate-900 border-slate-800 p-4 lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Partners by Cumulative Earnings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topVendors}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#94a3b8" 
                  fontSize={9} 
                  tickLine={false}
                  tickFormatter={(v) => `₹${v/1000}k`} 
                />
                <YAxis 
                  type="category" 
                  dataKey="businessName" 
                  stroke="#94a3b8" 
                  fontSize={9} 
                  tickLine={false}
                  width={130}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "10px", fontWeight: "bold" }}
                  itemStyle={{ color: "#3b82f6", fontSize: "10px" }}
                  formatter={(val) => formatCurrency(val as number)}
                />
                <Bar dataKey="earnings" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Services breakdown pie chart (1/3 width) */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <PieIcon className="h-4 w-4 text-blue-400" /> Category Breakdown
          </h3>
          
          <div className="h-44 relative flex items-center justify-center select-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold text-white">450+</span>
              <span className="text-3xs text-slate-500 uppercase font-bold tracking-widest">Projects</span>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-1.5 text-2xs">
            {servicesData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-bold text-white font-mono">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
