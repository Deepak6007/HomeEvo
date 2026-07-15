"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { Payment } from "@/types"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  RotateCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from "lucide-react"

interface AdminPaymentRecord extends Payment {
  projectName: string
  milestoneName: string
  clientName: string
  vendorName: string
  disputed: boolean
  disputeNotes?: string
}

export default function AdminPaymentsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // State
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  // Refund dialog state
  const [refundingPayment, setRefundingPayment] = React.useState<AdminPaymentRecord | null>(null)
  const [refundReason, setRefundReason] = React.useState("")

  // Queries
  const { data: statsRes, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin", "payments", "stats"],
    queryFn: () => adminApi.payments.getStats(),
  })

  const { data: paymentsRes, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["admin", "payments", "list", { page, statusFilter, search }],
    queryFn: () => adminApi.payments.list({ 
      page, 
      pageSize, 
      status: statusFilter || undefined 
    }),
  })

  // Mutation
  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.payments.initiateRefund(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] })
      toast.success("Razorpay escrow refund initiated successfully! Funds will credit within 5-7 business days.")
      setRefundingPayment(null)
      setRefundReason("")
    },
    onError: () => toast.error("Failed to initiate refund transaction")
  })

  // Mock financial statistics
  const stats = {
    gmv: 4850000,          // Total contract volume booked
    commission: 242500,     // 5% Platform cut
    refunds: 180000,        // Total refunds issued
    ...(statsRes?.data && !Array.isArray(statsRes.data) ? statsRes.data : {})
  }

  // Mock transactions
  const mockPayments: AdminPaymentRecord[] = [
    {
      id: "pay_001",
      amount: 120000,
      type: "escrow",
      status: "escrow",
      projectId: "proj_101",
      milestoneId: "ms_2",
      razorpayOrderId: "order_RP_9918231",
      razorpayPaymentId: "pay_RP_9918231_A",
      createdAt: "2026-06-01T10:00:00Z",
      projectName: "Luxury Villa Painting & Finishing",
      milestoneName: "Core Exterior Texture Coating",
      clientName: "A. Reddy",
      vendorName: "Vizag Painters & Finishers",
      disputed: false
    },
    {
      id: "pay_002",
      amount: 80000,
      type: "escrow",
      status: "released",
      projectId: "proj_101",
      milestoneId: "ms_1",
      razorpayOrderId: "order_RP_9918112",
      razorpayPaymentId: "pay_RP_9918112_B",
      createdAt: "2026-05-28T09:00:00Z",
      projectName: "Luxury Villa Painting & Finishing",
      milestoneName: "Initial Surface Preparation",
      clientName: "A. Reddy",
      vendorName: "Vizag Painters & Finishers",
      disputed: false
    },
    {
      id: "pay_003",
      amount: 45000,
      type: "escrow",
      status: "disputed",
      projectId: "proj_102",
      milestoneId: "ms_4",
      razorpayOrderId: "order_RP_9821332",
      razorpayPaymentId: "pay_RP_9821332_C",
      createdAt: "2026-05-30T16:30:00Z",
      projectName: "Guntur Residential Construction",
      milestoneName: "Wall Plastering Stage 1",
      clientName: "P. Srinivasa Rao",
      vendorName: "Guntur Masonry & Builders",
      disputed: true,
      disputeNotes: "Client claims contractor skipped cement ratio specifications. Structural crack visible."
    },
    {
      id: "pay_004",
      amount: 135000,
      type: "escrow",
      status: "released",
      projectId: "proj_103",
      milestoneId: "ms_5",
      razorpayOrderId: "order_RP_9711092",
      razorpayPaymentId: "pay_RP_9711092_D",
      createdAt: "2026-05-25T11:00:00Z",
      projectName: "Modular Kitchen Cabinet Woodworking",
      milestoneName: "Acrylic Panel Laminates",
      clientName: "Ananya Reddi",
      vendorName: "Ranga Carpentry & Kitchens",
      disputed: false
    },
    {
      id: "pay_005",
      amount: 60000,
      type: "escrow",
      status: "refunded",
      projectId: "proj_104",
      milestoneId: "ms_6",
      razorpayOrderId: "order_RP_9655102",
      razorpayPaymentId: "pay_RP_9655102_E",
      createdAt: "2026-05-18T14:15:00Z",
      projectName: "Office Cabinet Woodworking",
      milestoneName: "Initial Frame Plywood Delivery",
      clientName: "Chaitanya V.",
      vendorName: "Ranga Carpentry & Kitchens",
      disputed: false
    }
  ]

  const rawPayments = (paymentsRes?.data && (paymentsRes.data as any).length > 0) ? (paymentsRes.data as any) : mockPayments

  // Client-side filtering in case API is offline
  const filteredPayments = React.useMemo(() => {
    let result = [...rawPayments]
    if (search) {
      result = result.filter(p => 
        p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) || 
        p.razorpayOrderId.toLowerCase().includes(search.toLowerCase()) || 
        p.projectName.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter)
    }
    return result
  }, [rawPayments, search, statusFilter])

  const paginatedPayments = React.useMemo(() => {
    const startIdx = (page - 1) * pageSize
    return filteredPayments.slice(startIdx, startIdx + pageSize)
  }, [filteredPayments, page])

  const totalPages = Math.max(Math.ceil(filteredPayments.length / pageSize), 1)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val)
  }

  const handleRefundSubmit = () => {
    if (!refundingPayment) return
    if (!refundReason.trim()) {
      toast.error("Please enter a reason for this refund.")
      return
    }
    refundMutation.mutate({ id: refundingPayment.id, reason: refundReason })
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s === "released" || s === "paid") {
      return "bg-green-500/10 text-green-400 border-green-500/20"
    }
    if (s === "escrow" || s === "held") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
    if (s === "disputed") {
      return "bg-red-500/10 text-red-400 border-red-500/20"
    }
    return "bg-slate-800 text-slate-400 border-slate-700"
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
        
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Escrow Payment Ledger</h1>
            <p className="text-xs text-slate-400">Oversee platform commissions, manage escrow funds, and resolve payment disputes.</p>
          </div>
        </div>

        {/* 3 Summary counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* GMV */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">TOTAL GMV ESCROWED</span>
              <TrendingUp className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {formatCurrency(stats.gmv)}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Sum of all contract milestones booked</p>
            </div>
          </Card>

          {/* Commission earned (5%) */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">COMMISSION EARNED (5%)</span>
              <IndianRupee className="h-4.5 w-4.5 text-green-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-green-400">
                {formatCurrency(stats.commission)}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Deducted automatically upon release</p>
            </div>
          </Card>

          {/* Total Refunds Issued */}
          <Card className="bg-slate-900 border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">REFUNDS ISSUED</span>
              <RotateCcw className="h-4.5 w-4.5 text-red-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {formatCurrency(stats.refunds)}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Returned to client source accounts</p>
            </div>
          </Card>
        </div>

        {/* Filters and search */}
        <Card className="bg-slate-900 border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <Input
                placeholder="Search payment or order IDs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 bg-slate-950 border-slate-800 text-xs h-9"
              />
            </div>

            {/* Filter status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider">ESCROW STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="">All Transactions</option>
                <option value="escrow">Held in Escrow</option>
                <option value="released">Released to Vendor</option>
                <option value="disputed">Disputed Payments</option>
                <option value="refunded">Refunded Payments</option>
              </select>
            </div>

          </div>
        </Card>

        {/* Transactions ledger table */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 pl-1.5">Created</th>
                  <th className="pb-3">Project / Milestone</th>
                  <th className="pb-3">Razorpay payment ID</th>
                  <th className="pb-3">Razorpay Order ID</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isPaymentsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 animate-pulse">
                      Loading payments ledger data...
                    </td>
                  </tr>
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No matching transaction records found.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((pay) => {
                    const formattedDate = new Date(pay.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })

                    // Check if payment is disputed to highlight in red
                    const isDisputed = pay.status === "disputed"

                    return (
                      <tr 
                        key={pay.id} 
                        className={`hover:bg-slate-850/30 transition-colors ${
                          isDisputed ? "bg-red-500/5 text-red-200 border-y border-red-500/20" : ""
                        }`}
                      >
                        <td className="py-4 pl-1.5 font-mono text-slate-400 text-[10px]">{formattedDate}</td>
                        <td className="py-4">
                          <div>
                            <span className={`font-bold block ${isDisputed ? "text-red-400" : "text-white"}`}>
                              {pay.projectName}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{pay.milestoneName}</span>
                            {isDisputed && pay.disputeNotes && (
                              <div className="flex items-start gap-1 bg-red-650/10 border border-red-500/10 rounded p-1.5 mt-2.5 text-[10px] text-red-400 font-sans leading-normal">
                                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                                <span>{pay.disputeNotes}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 font-mono text-[11px] text-slate-400">{pay.razorpayPaymentId || "—"}</td>
                        <td className="py-4 font-mono text-[11px] text-slate-400">{pay.razorpayOrderId}</td>
                        <td className={`py-4 text-right font-mono font-bold text-2xs ${isDisputed ? "text-red-400" : "text-slate-200"}`}>
                          {formatCurrency(pay.amount)}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider ${
                            getStatusColor(pay.status)
                          }`}>
                            {pay.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          {(pay.status === "escrow" || pay.status === "disputed") ? (
                            <Button
                              size="xs"
                              onClick={() => setRefundingPayment(pay)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[9px] tracking-wider h-7 px-2"
                            >
                              <RotateCcw className="h-3 w-3 mr-0.5" /> Refund
                            </Button>
                          ) : (
                            <span className="text-slate-500 text-[10px] font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
            <span>Showing {paginatedPayments.length} of {filteredPayments.length} transactions</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border border-slate-800 hover:bg-slate-800 hover:text-white h-8 text-xs px-2.5 font-bold uppercase"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-slate-300">Page {page} of {totalPages}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="border border-slate-800 hover:bg-slate-800 hover:text-white h-8 text-xs px-2.5 font-bold uppercase"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

        </Card>

        {/* Refund confirmation modal */}
        {refundingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <Card className="bg-slate-900 border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in scale-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500" /> Initiate Escrow Refund
                </h3>
                <button
                  onClick={() => { setRefundingPayment(null); setRefundReason(""); }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded p-3 text-xs space-y-2 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Project:</span>
                  <span className="text-white font-bold">{refundingPayment.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Milestone:</span>
                  <span className="text-slate-300">{refundingPayment.milestoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Escrow Amount:</span>
                  <span className="text-red-400 font-bold font-mono">{formatCurrency(refundingPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Razorpay Order:</span>
                  <span className="text-slate-400 font-mono">{refundingPayment.razorpayOrderId}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Reason for Refund Request (required)</span>
                <textarea
                  placeholder="Specify details, e.g., agreement cancelled, client/vendor dispute settlement resolution notes..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-red-500 text-xs rounded p-2.5 w-full h-20 outline-none text-slate-200 leading-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setRefundingPayment(null); setRefundReason(""); }}
                  className="border border-slate-800 hover:bg-slate-850 hover:text-white text-3xs font-bold uppercase h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRefundSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white text-3xs font-bold uppercase tracking-widest h-8"
                >
                  Confirm Refund
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardShell>
  )
}
