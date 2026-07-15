"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useQuery, useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { useVendor, useVendorReviews } from "@/hooks/useVendors"
import { useProjects } from "@/hooks/useProjects"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import apiClient from "@/lib/api/client"
import { toast } from "sonner"
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Briefcase,
  ChevronLeft,
  Mail,
  UserCheck,
  Loader2,
  Calendar,
  IndianRupee,
  MessageSquare,
  Award,
} from "lucide-react"

export default function VendorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string
  const { user } = useAuth()

  // 1. Fetch vendor profiles & reviews using Suspense hooks
  const { data: vendor } = useVendor(vendorId)
  const { data: reviews } = useVendorReviews(vendorId)

  // 2. Fetch client's active projects for quote mapping
  const { data: projectsRes } = useProjects({ status: "active" })
  const activeProjects = projectsRes?.data || []

  // Lightbox Zoom module states
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  // Quote modal states
  const [quoteOpen, setQuoteOpen] = React.useState(false)
  const [selectedProjectId, setSelectedProjectId] = React.useState("")
  const [quoteAmount, setQuoteAmount] = React.useState("")
  const [quoteProposal, setQuoteProposal] = React.useState("")
  const [quoteDuration, setQuoteDuration] = React.useState("")
  const [isSubmittingQuote, setIsSubmittingQuote] = React.useState(false)

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Client User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [user])

  if (!vendor) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Submit quote proposal handler
  const handleSendQuote = async () => {
    if (!selectedProjectId || !quoteAmount || !quoteProposal || !quoteDuration) {
      toast.error("Please fill out all bid requirements.")
      return
    }

    try {
      setIsSubmittingQuote(true)

      // Post bid attachment to backend API endpoint
      await apiClient.post(`/vendors/${vendorId}/bids`, {
        projectId: selectedProjectId,
        amount: Number(quoteAmount),
        proposal: quoteProposal,
        duration: quoteDuration,
      })

      toast.success("Quote proposal sent successfully to contractor! 🚀")
      setQuoteOpen(false)
      setSelectedProjectId("")
      setQuoteAmount("")
      setQuoteProposal("")
      setQuoteDuration("")
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.message || "Failed to submit quote request.")
    } finally {
      setIsSubmittingQuote(false)
    }
  }

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Navigation link row */}
        <div className="flex items-center gap-2 text-2xs text-[#6F5B4B] font-medium">
          <span className="cursor-pointer hover:underline" onClick={() => router.push("/client/vendors")}>
            Service Pros
          </span>
          <span>&middot;</span>
          <span className="text-[#3D2B1F] font-semibold">{vendor.name}</span>
        </div>

        {/* Dynamic header segment */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-[#E85D04]/10 p-6 rounded-xl shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#E85D04]/10 text-[#E85D04] font-serif font-bold text-lg flex items-center justify-center border border-[#E85D04]/20 shadow-2xs shrink-0">
              {getInitials(vendor.name)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-2xl font-bold text-[#3D2B1F] tracking-tight">{vendor.name}</h2>
                {vendor.isVerified && (
                  <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-3xs font-semibold px-2 py-0">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#6F5B4B] font-medium flex items-center gap-3 flex-wrap">
                <span>{vendor.businessName}</span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {vendor.location}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => setQuoteOpen(true)}
            className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 px-5 shrink-0 active:scale-95 transition-all shadow-xs"
          >
            Get a Quote
          </Button>
        </div>

        {/* 2 Column Details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Portfolio and Category column (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Bio widget */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs space-y-3">
              <h3 className="font-serif text-base font-bold text-[#3D2B1F] border-b pb-2 flex items-center gap-1.5">
                <Award className="h-5 w-5 text-[#E85D04]" /> Professional Overview
              </h3>
              <p className="text-xs text-[#6F5B4B] leading-relaxed">
                Expert contractor specializing in high-grade {vendor.category.toLowerCase()} engineering and custom building layouts. Known in {vendor.location} for delivering premium milestones on timeline budgets. Over {vendor.reviewCount} satisfied clients.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-border text-xs text-[#6F5B4B]">
                  Specialty: {vendor.category}
                </Badge>
                <Badge variant="outline" className="border-border text-xs text-[#6F5B4B]">
                  Area: {vendor.location}
                </Badge>
                <Badge variant="outline" className="border-border text-xs text-[#6F5B4B]">
                  Price Tier: {vendor.priceRange}
                </Badge>
              </div>
            </div>

            {/* Design Portfolio gallery */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-2xs">
              <h3 className="font-serif text-base font-bold text-[#3D2B1F] mb-6">Construction Project Portfolio</h3>
              
              {!vendor.portfolioPhotos || vendor.portfolioPhotos.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                  No portfolio images uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {vendor.portfolioPhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(photo)}
                      className="group relative overflow-hidden rounded-xl aspect-square border border-border bg-muted cursor-zoom-in shadow-2xs hover:shadow-sm transition-all"
                    >
                      <Image
                        src={photo}
                        alt={`Portfolio item ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZkZjhmMiIvPjwvc3ZnPg=="
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-3xs text-white font-bold bg-[#E85D04] px-2.5 py-1 rounded-md">
                          Enlarge
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews feeds */}
          <div className="space-y-6">
            {/* Business Contact card */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#3D2B1F] border-b pb-2">Business Cards</h3>
              <div className="space-y-3.5 text-xs text-[#6F5B4B]">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{vendor.isVerified ? "+91 98480 22338" : "Contact details via quote"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{vendor.businessName.replace(/\s+/g, "").toLowerCase()}@homeevo.in</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Serving {vendor.location} & surroundings</span>
                </div>
              </div>
            </div>

            {/* Client Reviews logs list */}
            <div className="bg-white border border-[#E85D04]/10 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-serif text-sm font-bold text-[#3D2B1F]">Client Endorsements</h3>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{vendor.rating.toFixed(1)}</span>
                </div>
              </div>

              {!reviews || reviews.length === 0 ? (
                <div className="text-center py-6 text-2xs text-muted-foreground">
                  No verified client reviews posted yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 border rounded-lg bg-[#FDF8F2]/30 border-border/60 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-3xs font-semibold">
                        <span className="text-[#3D2B1F] flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-green-600" />
                          {rev.clientName}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-3xs text-[#6F5B4B] italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio lightbox overlay */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in-25 duration-200"
          >
            <div className="relative max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-xl border border-white/10 bg-[#111]">
              <Image
                src={selectedImage}
                alt="Enlarged gallery item"
                width={1200}
                height={800}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Get a Quote project-attach modal */}
        <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
          <DialogContent className="max-w-md w-full bg-white text-[#3D2B1F] p-6 rounded-xl border border-border">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#E85D04]" />
                Request Project Quote
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6F5B4B]">
                Select an active construction project and submit a brief proposal description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Active Projects select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Active Project</label>
                {activeProjects.length === 0 ? (
                  <div className="text-2xs text-red-600 bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-center gap-1">
                    No active projects. Please create a project first before request a quote!
                  </div>
                ) : (
                  <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val || "")}>
                    <SelectTrigger className="bg-card/40 border border-border/80 text-xs">
                      <SelectValue placeholder="Select active project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border text-[#3D2B1F]">
                      {activeProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Estimate budget amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Target Cost Range (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">₹</span>
                  <Input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="e.g. 800000"
                    className="pl-7 bg-card/40"
                  />
                </div>
              </div>

              {/* Duration timeline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Estimated Duration</label>
                <Input
                  value={quoteDuration}
                  onChange={(e) => setQuoteDuration(e.target.value)}
                  placeholder="e.g. 4 months"
                  className="bg-card/40"
                />
              </div>

              {/* Pitch proposal detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Requirements Proposal</label>
                <textarea
                  value={quoteProposal}
                  onChange={(e) => setQuoteProposal(e.target.value)}
                  placeholder="Provide scope details (e.g., specific tiles choice, plumbing layout, wiring layout required)..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-lg border bg-card/40 outline-none focus:border-[#E85D04]/40"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2.5 pt-4">
              <Button
                variant="ghost"
                onClick={() => setQuoteOpen(false)}
                disabled={isSubmittingQuote}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendQuote}
                disabled={isSubmittingQuote || activeProjects.length === 0}
                className="bg-[#E85D04] text-white hover:bg-[#D45203] text-xs font-semibold active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                {isSubmittingQuote ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Request Bid Quote"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
