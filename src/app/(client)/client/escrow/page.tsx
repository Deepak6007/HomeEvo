"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { useEscrowBalance, usePaymentHistory } from "@/hooks/useEscrow"
import { useProjects, useApproveMilestone } from "@/hooks/useProjects"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { loadRazorpay, initializePayment } from "@/lib/razorpay"
import { paymentsApi } from "@/lib/api/payments"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { toast } from "sonner"
import {
  Wallet,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"

function EscrowWalletContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  // 1. Fetch search params pagination state
  const currentPage = Number(searchParams.get("page")) || 1

  // 2. Escrow API and payment logs
  const { data: balance, isLoading: balanceLoading } = useEscrowBalance()
  const { data: historyRes, isLoading: historyLoading } = usePaymentHistory({
    page: currentPage,
    pageSize: 8,
  })

  // 3. Projects details for listing milestone names in the table
  const { data: projectsRes } = useProjects()
  const projects = projectsRes?.data || []

  // Escrow milestone releases mutation
  const approveMilestoneMutation = useApproveMilestone()

  // Modal open states
  const [topupOpen, setTopupOpen] = React.useState(false)
  const [topupAmount, setTopupAmount] = React.useState("")
  const [isProcessingTopup, setIsProcessingTopup] = React.useState(false)

  const [releaseOpen, setReleaseOpen] = React.useState(false)
  const [selectedMilestone, setSelectedMilestone] = React.useState<any | null>(null)
  const [isProcessingRelease, setIsProcessingRelease] = React.useState(false)

  const shellUser = React.useMemo(() => {
    return {
      name: currentUser?.name || "Client User",
      email: currentUser?.email || "",
      avatarInitials: currentUser?.name
        ? currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [currentUser])

  // Ledger stats
  const total = balance?.total || 0
  const released = balance?.released || 0
  const pending = balance?.pending || 0
  const upcoming = balance?.upcoming || 0

  const sum = released + pending + upcoming
  const releasedPct = sum > 0 ? Math.round((released / sum) * 100) : 0
  const pendingPct = sum > 0 ? Math.round((pending / sum) * 100) : 0
  const upcomingPct = sum > 0 ? Math.round((upcoming / sum) * 100) : 0

  // History variables
  const payments = historyRes?.data || []
  const pagination = historyRes?.pagination

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle wallet top up
  const handleTopupSubmit = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      toast.error("Please enter a valid deposit amount.")
      return
    }

    try {
      setIsProcessingTopup(true)
      toast.info("Connecting to secure gateway...")

      const isLoaded = await loadRazorpay()
      if (!isLoaded) throw new Error("Razorpay script checkout failed to load.")

      // Simulate order request
      const order = {
        id: "topup_" + Math.random().toString(36).slice(2, 9),
        amount: Number(topupAmount) * 100,
        currency: "INR",
      }

      await initializePayment(order, {
        name: currentUser?.name,
        email: currentUser?.email,
        contact: currentUser?.phone,
      })

      // Simulate account crediting
      toast.success(`Wallet successfully credited with ${formatCurrency(Number(topupAmount))}! 🎉`)
      setTopupOpen(false)
      setTopupAmount("")
      queryClient.invalidateQueries({ queryKey: ["escrow"] })
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Top-up failed.")
    } finally {
      setIsProcessingTopup(false)
    }
  }

  // Handle transaction list milestone approval
  const handleApproveClick = (paymentItem: any) => {
    setSelectedMilestone({
      id: paymentItem.milestoneId,
      projectId: paymentItem.projectId,
      amount: paymentItem.amount,
      title: paymentItem.milestoneTitle || "Milestone Payment",
    })
    setReleaseOpen(true)
  }

  const handleConfirmRelease = async () => {
    if (!selectedMilestone) return
    try {
      setIsProcessingRelease(true)
      toast.info("Initializing payment verification...")

      const isLoaded = await loadRazorpay()
      if (!isLoaded) throw new Error("Payment script failed to load.")

      // 1. Create order on backend
      const order = await paymentsApi.initiateEscrow(
        selectedMilestone.projectId,
        selectedMilestone.id,
        selectedMilestone.amount
      )

      // 2. Open pop-up
      const result = await initializePayment(order, {
        name: currentUser?.name,
        email: currentUser?.email,
        contact: currentUser?.phone,
      })

      // 3. Verify on backend
      await paymentsApi.confirmPayment(
        result.razorpay_order_id,
        result.razorpay_payment_id,
        result.razorpay_signature
      )

      // 4. Release milestone
      await approveMilestoneMutation.mutateAsync({
        projectId: selectedMilestone.projectId,
        milestoneId: selectedMilestone.id,
      })

      toast.success(`Milestone funds released successfully!`)
      setReleaseOpen(false)
      setSelectedMilestone(null)
      queryClient.invalidateQueries({ queryKey: ["escrow"] })
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Release verification failed.")
    } finally {
      setIsProcessingRelease(false)
    }
  }

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">Escrow Wallet</h2>
            <p className="text-xs text-[#6F5B4B] font-medium tracking-wide">
              Manage milestone secure deposits, top-up wallets, and release builder funds.
            </p>
          </div>
          <Button
            onClick={() => setTopupOpen(true)}
            className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 px-4 shadow-sm active:scale-95 transition-all"
          >
            + Add Funds
          </Button>
        </div>

        {/* Ledger Balance visual block */}
        <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Account Balance Display */}
            <div className="space-y-1.5 md:border-r border-border/40 pr-6">
              <span className="text-2xs text-[#6F5B4B] font-semibold tracking-wider uppercase">
                Secure Escrow Balance
              </span>
              <span className="text-3xl font-bold text-[#3D2B1F] block">
                {balanceLoading ? "..." : formatCurrency(total)}
              </span>
            </div>

            {/* Proportional stacked bar */}
            <div className="md:col-span-2 space-y-4">
              <div className="w-full h-3 rounded-full bg-border/40 flex overflow-hidden">
                {releasedPct > 0 && <div style={{ width: `${releasedPct}%` }} className="bg-green-500" />}
                {pendingPct > 0 && <div style={{ width: `${pendingPct}%` }} className="bg-[#E85D04]" />}
                {upcomingPct > 0 && <div style={{ width: `${upcomingPct}%` }} className="bg-amber-500" />}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="text-left space-y-0.5">
                  <span className="inline-flex items-center gap-1 text-2xs text-[#6F5B4B]">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Released
                  </span>
                  <span className="font-bold text-[#3D2B1F] block">{formatCurrency(released)}</span>
                </div>
                <div className="text-center space-y-0.5">
                  <span className="inline-flex items-center gap-1 text-2xs text-[#6F5B4B]">
                    <span className="h-2 w-2 rounded-full bg-[#E85D04]" /> Pending
                  </span>
                  <span className="font-bold text-[#3D2B1F] block">{formatCurrency(pending)}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="inline-flex items-center gap-1 text-2xs text-[#6F5B4B]">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Upcoming
                  </span>
                  <span className="font-bold text-[#3D2B1F] block">{formatCurrency(upcoming)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table Widget */}
        <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs">
          <h3 className="font-serif text-base font-bold text-[#3D2B1F] mb-4">Transaction History</h3>

          {historyLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((k) => (
                <div key={k} className="h-10 rounded bg-border/20 animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-8 w-8 text-[#E85D04]" />}
              title="No Transactions Logged"
              description="No payments or escrow activities found on your account ledger."
            />
          ) : (
            <div className="space-y-4">
              {/* Responsive scroll wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-[#6F5B4B] font-semibold text-3xs uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Milestone</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => {
                      // Fetch project details
                      const matchProj = projects.find((p) => p.id === pay.projectId)
                      const projectTitle = matchProj ? matchProj.title : "Direct Top-up"
                      const milestone =
                        matchProj?.milestones?.find((m) => m.id === pay.milestoneId)?.title ||
                        "Wallet Credit"

                      let badgeColor = "bg-muted text-muted-foreground"
                      if (pay.status === "completed") badgeColor = "bg-green-500/10 text-green-600 border-0"
                      else if (pay.status === "pending") badgeColor = "bg-amber-500/10 text-amber-600 border-0"

                      return (
                        <tr key={pay.id} className="border-b border-border/40 hover:bg-[#FDF8F2]/20">
                          <td className="py-3 px-4">{formatDate(pay.createdAt)}</td>
                          <td className="py-3 px-4 font-semibold text-[#3D2B1F] max-w-[150px] truncate">
                            {projectTitle}
                          </td>
                          <td className="py-3 px-4 max-w-[150px] truncate">{milestone}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#3D2B1F]">
                            {pay.type === "refund" ? "-" : "+"}
                            {formatCurrency(pay.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={`text-3xs font-semibold px-2 py-0 ${badgeColor}`}>
                              {pay.status === "completed" ? "Released" : "Held"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {pay.status === "pending" && pay.milestoneId && (
                              <Button
                                onClick={() => handleApproveClick(pay)}
                                className="bg-[#E85D04] text-white hover:bg-[#D45203] text-4xs font-semibold py-1 px-2.5 h-7 shadow-2xs active:scale-95"
                              >
                                Approve Release
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination block */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination className="pt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => updatePage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                      const num = idx + 1
                      return (
                        <PaginationItem key={num}>
                          <PaginationLink isActive={currentPage === num} onClick={() => updatePage(num)}>
                            {num}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => updatePage(currentPage + 1)}
                        className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>

        {/* Top-up Input Dialog */}
        <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
          <DialogContent className="max-w-xs w-full bg-white text-[#3D2B1F] p-6 rounded-xl border border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-base font-bold flex items-center gap-1.5">
                <Wallet className="text-[#E85D04] h-5 w-5" /> Top Up Escrow
              </DialogTitle>
              <DialogDescription className="text-2xs text-[#6F5B4B]">
                Specify funds to deposit safely in secured escrow.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2 space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  className="pl-7 bg-card/40"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setTopupOpen(false)}
                disabled={isProcessingTopup}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTopupSubmit}
                disabled={isProcessingTopup}
                className="bg-[#E85D04] text-white hover:bg-[#D45203] text-xs font-semibold"
              >
                {isProcessingTopup ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Authorize Pay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Release milestone approve dialog */}
        <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
          <DialogContent className="max-w-md w-full bg-white text-[#3D2B1F] p-6 rounded-xl border border-border">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Authorize Escrow Transfer
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6F5B4B]">
                This will release secure funds directly to your contractor. Ensure milestones meet your standard of quality first.
              </DialogDescription>
            </DialogHeader>

            {selectedMilestone && (
              <div className="bg-[#FDF8F2] border border-[#E85D04]/10 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Milestone Title</span>
                  <span className="text-[#3D2B1F]">{selectedMilestone.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Release Amount</span>
                  <span className="font-bold text-[#3D2B1F]">{formatCurrency(selectedMilestone.amount)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-end gap-2.5 pt-4">
              <Button
                variant="ghost"
                onClick={() => setReleaseOpen(false)}
                disabled={isProcessingRelease}
                className="text-xs font-semibold text-[#6F5B4B]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRelease}
                disabled={isProcessingRelease}
                className="bg-green-600 text-white hover:bg-green-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                {isProcessingRelease ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Authorizing...
                  </>
                ) : (
                  "Authorize Release"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

export default function EscrowWalletPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-[#E85D04] animate-spin" />
        </div>
      }
    >
      <EscrowWalletContent />
    </React.Suspense>
  )
}
