"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { projectsApi } from "@/lib/api/projects"
import { vendorsApi } from "@/lib/api/vendors"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { useProject, useApproveMilestone } from "@/hooks/useProjects"
import { useVendor } from "@/hooks/useVendors"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { loadRazorpay, initializePayment } from "@/lib/razorpay"
import { paymentsApi } from "@/lib/api/payments"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { FileUpload } from "@/components/shared/FileUpload"
import { toast } from "sonner"
import {
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Star,
  Upload,
  User,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"

export const ProjectDetailClient: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const projectId = params.id as string
  const { user: currentUser } = useAuth()

  // 1. Fetch project data using Suspense Query
  const { data: project } = useProject(projectId)

  // 2. Fetch vendor details if assigned
  const { data: vendor } = useQuery({
    queryKey: queryKeys.vendors.detail(project?.vendorId || ""),
    queryFn: () => vendorsApi.get(project?.vendorId || ""),
    enabled: !!project?.vendorId,
  })

  const approveMilestoneMutation = useApproveMilestone()

  // Escrow approve modal states
  const [selectedMilestone, setSelectedMilestone] = React.useState<any | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false)

  // Photo uploading states
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null)

  if (!project) return null

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

  // Budget calculations
  const budget = project?.budget || 0
  const spent = React.useMemo(() => {
    return (
      project?.milestones
        ?.filter((m) => m.status === "released")
        .reduce((sum, m) => sum + m.amount, 0) || 0
    )
  }, [project])
  const remaining = budget - spent
  const percentUsed = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0

  // Milestone completion ratio
  const totalMilestones = project?.milestones?.length || 0
  const completedMilestones =
    project?.milestones?.filter((m) => m.status === "released").length || 0

  // Days elapsed calculations
  const daysElapsed = React.useMemo(() => {
    if (!project?.startDate) return 0
    const start = new Date(project.startDate).getTime()
    const elapsed = Date.now() - start
    return Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
  }, [project])

  // Trigger milestone approval modal
  const handleApproveClick = (milestone: any) => {
    setSelectedMilestone(milestone)
    setConfirmOpen(true)
  }

  // Razorpay Checkout sequence
  const handleConfirmApproval = async () => {
    if (!selectedMilestone) return

    try {
      setIsProcessingPayment(true)
      toast.info("Initializing secure gateway connection...")

      // 1. Create Razorpay order on backend
      const order = await paymentsApi.initiateEscrow(
        projectId,
        selectedMilestone.id,
        selectedMilestone.amount
      )

      // 2. Load SDK dynamically
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        throw new Error("Razorpay script checkout failed to load. Check connection.")
      }

      // 3. Initiate payment pop-up
      toast.info("Connecting to Razorpay checkout...")
      const paymentResult = await initializePayment(order, {
        name: currentUser?.name,
        email: currentUser?.email,
        contact: currentUser?.phone,
      })

      toast.info("Verifying transaction credentials...")

      // 4. Submit confirmation details to backend API
      await paymentsApi.confirmPayment(
        paymentResult.razorpay_order_id,
        paymentResult.razorpay_payment_id,
        paymentResult.razorpay_signature
      )

      // 5. Trigger milestone release updates (triggers local optimistic cache)
      await approveMilestoneMutation.mutateAsync({
        projectId,
        milestoneId: selectedMilestone.id,
      })

      toast.success(`Milestone "${selectedMilestone.title}" successfully approved & escrow released! 🎉`)
      setConfirmOpen(false)
      setSelectedMilestone(null)
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Escrow verification failed. Transaction cancelled.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Upload photo handler
  const handlePhotoUpload = async () => {
    if (!uploadingFile) return
    try {
      toast.info("Uploading photo to gallery...")
      await projectsApi.uploadSitePhoto(projectId, uploadingFile)
      toast.success("Site photo uploaded successfully!")
      setUploadOpen(false)
      setUploadingFile(null)
      // Refresh cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    } catch (e: any) {
      console.error(e)
      toast.error("Failed to upload image.")
    }
  }

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Header Navigation link */}
        <div className="flex items-center gap-2 text-2xs text-[#6F5B4B] font-medium">
          <span className="cursor-pointer hover:underline" onClick={() => router.push("/client/projects")}>
            My Projects
          </span>
          <span>&middot;</span>
          <span className="text-[#3D2B1F] font-semibold">{project.title}</span>
        </div>

        {/* Project Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E85D04]/10 p-6 rounded-xl shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">{project.title}</h2>
              <Badge className="bg-[#E85D04]/10 text-[#E85D04] border-0 text-3xs font-semibold uppercase">
                {project.status}
              </Badge>
            </div>
            <p className="text-xs text-[#6F5B4B] font-medium tracking-wide flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {project.location} &middot; Category: {project.category}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setUploadOpen(true)}
              variant="outline"
              className="border-border/60 hover:bg-[#E85D04]/5 hover:text-[#E85D04] font-semibold text-xs active:scale-95 transition-all"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Photos
            </Button>
            <Button
              onClick={() => {
                toast.success("Progress update request sent to contractor!")
              }}
              className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs active:scale-95 transition-all shadow-xs"
            >
              Request Update
            </Button>
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (Left - 2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Interactive Milestone Timeline */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs">
              <h3 className="font-serif text-base font-bold text-[#3D2B1F] mb-6">Milestone Progress & Escrow Releases</h3>

              <div className="relative pl-6 border-l border-border/80 ml-3 py-2 space-y-8">
                {project.milestones?.map((milestone, idx) => {
                  let dotClass = "bg-muted-foreground/30 text-muted-foreground"
                  let textClass = "text-muted-foreground"
                  let statusText = "Upcoming"
                  let StatusIcon = Clock

                  if (milestone.status === "released") {
                    dotClass = "bg-green-500 text-white ring-4 ring-green-500/10"
                    textClass = "text-green-700"
                    statusText = "Escrow Released"
                    StatusIcon = CheckCircle2
                  } else if (milestone.status === "pending") {
                    dotClass = "bg-amber-500 text-white ring-4 ring-amber-500/10"
                    textClass = "text-amber-700"
                    statusText = "Completed - Awaiting Release"
                    StatusIcon = AlertTriangle
                  } else if (milestone.status === "in_progress") {
                    dotClass = "bg-[#E85D04] text-white ring-4 ring-orange/20 animate-pulse"
                    textClass = "text-[#E85D04] font-semibold"
                    statusText = "In Progress"
                    StatusIcon = RefreshCw
                  }

                  return (
                    <div key={milestone.id} className="relative group">
                      {/* Timeline dot indicator */}
                      <span className={`absolute -left-9 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shadow-xs transition-transform duration-300 group-hover:scale-110 ${dotClass}`}>
                        {milestone.status === "in_progress" ? (
                          <StatusIcon className="h-3 w-3 animate-spin" />
                        ) : (
                          <StatusIcon className="h-3.5 w-3.5" />
                        )}
                      </span>

                      {/* Detail card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FDF8F2]/30 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:border-[#E85D04]/20 hover:shadow-2xs">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-[#3D2B1F] tracking-tight">
                            {milestone.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/40 ${textClass}`}>
                              {statusText}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Due: {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <span className="text-sm font-bold text-[#3D2B1F]">
                            {formatCurrency(milestone.amount)}
                          </span>

                          {milestone.status === "pending" && (
                            <Button
                              onClick={() => handleApproveClick(milestone)}
                              className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-3xs py-1 px-3 h-7 shadow-2xs active:scale-95"
                            >
                              Approve & Release
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Site Photos Gallery */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-base font-bold text-[#3D2B1F]">Site Construction Photos</h3>
                <span className="text-3xs text-muted-foreground font-semibold">
                  {project.sitePhotos?.length || 0} Images
                </span>
              </div>

              {!project.sitePhotos || project.sitePhotos.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                  No site photos uploaded yet. Request updates or upload yours to track milestones visually.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {project.sitePhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl aspect-square border border-border bg-muted cursor-zoom-in"
                    >
                      <Image
                        src={photo}
                        alt={`Site upload ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZkZjhmMiIvPjwvc3ZnPg=="
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                        <span className="text-4xs text-white/95 font-semibold">
                          Uploaded Photo &middot; {i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column (Right - 1/3 width) */}
          <div className="space-y-6">
            {/* Budget Summary Card */}
            <Card className="border-[#E85D04]/10 bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#3D2B1F] border-b border-border/40 pb-2">
                  Budget Escrow Ledger
                </h3>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-[#6F5B4B]">
                    <span>Contracted Budget</span>
                    <span className="font-semibold text-[#3D2B1F]">{formatCurrency(budget)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6F5B4B]">
                    <span>Spent (Released)</span>
                    <span className="font-semibold text-green-600">{formatCurrency(spent)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6F5B4B]">
                    <span>Remaining Secure</span>
                    <span className="font-semibold text-[#E85D04]">{formatCurrency(remaining)}</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-4xs font-semibold text-[#6F5B4B]">
                      <span>Funds Released</span>
                      <span>{percentUsed}%</span>
                    </div>
                    <Progress value={percentUsed} className="h-2 bg-border/40" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Details Sidebar Widget */}
            {project.vendorId && vendor ? (
              <Card className="border-[#E85D04]/10 bg-white">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-[#3D2B1F] border-b border-border/40 pb-2">
                    Assigned Professional
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#E85D04]/15 text-[#E85D04] font-serif font-bold text-sm flex items-center justify-center border border-[#E85D04]/25 shrink-0 shadow-2xs">
                      {vendor.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="leading-tight overflow-hidden">
                      <span className="text-xs font-bold text-[#3D2B1F] block truncate">{vendor.name}</span>
                      <span className="text-3xs text-muted-foreground block truncate">{vendor.businessName}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-[#6F5B4B] pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{vendor.rating.toFixed(1)} rating ({vendor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{vendor.isVerified ? "Verified Phone" : "+91 XXXXX XXXXX"}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/client/messages?vendor=${vendor.id}`)}
                    className="w-full bg-[#3D2B1F] text-white hover:bg-[#2C1F16] text-xs font-semibold shadow-xs"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Message Contractor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#E85D04]/10 bg-white">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-serif text-sm font-bold text-[#3D2B1F]">Contractor Search</h3>
                  <p className="text-xs text-[#6F5B4B]">
                    No builder has been hired yet for this project.
                  </p>
                  <Button
                    onClick={() => router.push("/client/vendors")}
                    className="w-full bg-[#E85D04] text-white hover:bg-[#D45203] text-xs font-semibold shadow-xs"
                  >
                    Browse Local Vendors
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Progress Metrics Card */}
            <Card className="border-[#E85D04]/10 bg-white">
              <CardContent className="p-5 space-y-3.5">
                <h3 className="font-serif text-sm font-bold text-[#3D2B1F] border-b border-border/40 pb-2">
                  Project Pulse
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#FDF8F2] border border-[#E85D04]/5">
                    <span className="text-2xs text-[#6F5B4B] block font-medium">Days Hired</span>
                    <span className="text-sm font-bold text-[#3D2B1F] block">{daysElapsed}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FDF8F2] border border-[#E85D04]/5">
                    <span className="text-2xs text-[#6F5B4B] block font-medium">Milestones</span>
                    <span className="text-sm font-bold text-[#3D2B1F] block">{completedMilestones}/{totalMilestones}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FDF8F2] border border-[#E85D04]/5">
                    <span className="text-2xs text-[#6F5B4B] block font-medium">% Budget</span>
                    <span className="text-sm font-bold text-[#3D2B1F] block">{percentUsed}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Milestone Escrow Authorization Confirm Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
                onClick={() => setConfirmOpen(false)}
                disabled={isProcessingPayment}
                className="text-xs font-semibold text-[#6F5B4B]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApproval}
                disabled={isProcessingPayment}
                className="bg-green-600 text-white hover:bg-green-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2Icon className="h-4.5 w-4.5 animate-spin" /> Authorizing...
                  </>
                ) : (
                  <>
                    Authorize Release
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload File dialog widget */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-sm w-full bg-white text-[#3D2B1F] p-6 rounded-xl border border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-base font-bold">
                Add Construction Snapshot
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6F5B4B]">
                Upload site design sheets or layout photos. Limit 5MB.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2">
              <FileUpload
                accept="image/*"
                multiple={false}
                onUpload={(fileList) => setUploadingFile(fileList[0] || null)}
                label="Site snapshot"
                maxSize={5 * 1024 * 1024}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadOpen(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                disabled={!uploadingFile}
                onClick={handlePhotoUpload}
                className="bg-[#3D2B1F] text-white hover:bg-[#2C1F16] text-xs font-semibold"
              >
                Upload Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}

// Sub-component dummy loaders for styling inside dialog buttons
const Loader2Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export default ProjectDetailClient
