"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import Image from "next/image"
import { Vendor } from "@/types"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Image as ImageIcon, 
  MapPin, 
  Star,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  Clock
} from "lucide-react"

interface VendorVerificationRecord extends Vendor {
  submittedAt: string
  aadhaarUrl: string
  gstinUrl?: string
  portfolioUrls: string[]
  verificationStatus: "pending" | "verified" | "rejected"
  rejectionReason?: string
  verificationNotes?: string
  businessAddress: string
}

export default function VendorVerificationPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Active Tab
  const [activeTab, setActiveTab] = React.useState<"pending" | "verified" | "rejected">("pending")
  
  // Document Viewer Overlay state
  const [inspectingDoc, setInspectingDoc] = React.useState<{ title: string; url: string; isImage: boolean } | null>(null)
  
  // Decision Form inputs
  const [decisionNotes, setDecisionNotes] = React.useState<Record<string, string>>({})

  // Queries
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "vendors", activeTab],
    queryFn: () => adminApi.vendors.list({ status: activeTab }),
  })

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminApi.vendors.verify(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] })
      toast.success("Vendor profile successfully verified and activated! Notification email dispatched.")
    },
    onError: () => toast.error("Failed to verify vendor")
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.vendors.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] })
      toast.error("Vendor profile rejected. Reason logs saved and contractor notified.")
    },
    onError: () => toast.error("Failed to reject vendor")
  })

  // Mock Vendor Records
  const mockVendors: VendorVerificationRecord[] = [
    {
      id: "v_1",
      name: "Satish Kumar K.",
      businessName: "Guntur Masonry & Builders",
      category: "Masonry",
      rating: 4.8,
      reviewCount: 34,
      isVerified: false,
      location: "Guntur",
      portfolioPhotos: ["/vizag1.jpg", "/guntur2.jpg"],
      priceRange: "₹₹",
      submittedAt: "2026-06-01T08:15:00Z",
      aadhaarUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Aadhaar+Satish+Kumar",
      gstinUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=GSTIN+Guntur+Masonry",
      portfolioUrls: [
        "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Portfolio+Photo+1",
        "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Portfolio+Photo+2"
      ],
      verificationStatus: "pending",
      businessAddress: "4-12, Lakshmipuram 3rd Lane, Guntur - 522007",
      gstin: "37AAAAA1111A1Z1",
      aadhaar: "1234 5678 9012"
    },
    {
      id: "v_2",
      name: "P. Ranganath",
      businessName: "Ranga Carpentry & Kitchens",
      category: "Carpentry",
      rating: 4.6,
      reviewCount: 18,
      isVerified: false,
      location: "Vijayawada",
      portfolioPhotos: ["/kitchen1.jpg"],
      priceRange: "₹₹₹",
      submittedAt: "2026-05-31T14:30:00Z",
      aadhaarUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Aadhaar+P+Ranganath",
      portfolioUrls: [
        "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Modular+Kitchen+Design+1",
        "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Modular+Kitchen+Design+2"
      ],
      verificationStatus: "pending",
      businessAddress: "Building 12, Besant Road, Governorpet, Vijayawada - 520002",
      aadhaar: "9876 5432 1098"
    },
    {
      id: "v_3",
      name: "V. Anil Kumar",
      businessName: "Vizag Painters & Finishers",
      category: "Painting",
      rating: 4.9,
      reviewCount: 42,
      isVerified: true,
      location: "Visakhapatnam",
      portfolioPhotos: [],
      priceRange: "₹",
      submittedAt: "2026-05-25T11:00:00Z",
      aadhaarUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Aadhaar+Anil+Painter",
      gstinUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=GSTIN+Anil+Painter",
      portfolioUrls: [],
      verificationStatus: "verified",
      businessAddress: "Flat 202, MVP Colony Sector 4, Visakhapatnam - 530017",
      verificationNotes: "All documents matches public directory. Portfolio verified by phone check.",
      gstin: "37BBBBB2222B2Z2",
      aadhaar: "5678 1234 9012"
    },
    {
      id: "v_4",
      name: "Ch. Venkata Rao",
      businessName: "Rao Electrical Works",
      category: "Electrical",
      rating: 3.5,
      reviewCount: 5,
      isVerified: false,
      location: "Nellore",
      portfolioPhotos: [],
      priceRange: "₹₹",
      submittedAt: "2026-05-20T09:00:00Z",
      aadhaarUrl: "https://via.placeholder.com/600x400/1e293b/3b82f6?text=Aadhaar+Venkata+Rao",
      portfolioUrls: [],
      verificationStatus: "rejected",
      businessAddress: "Mypadu Road, Near Bus Stand, Nellore - 524002",
      rejectionReason: "Uploaded Aadhaar card image is blurred and unreadable. GSTIN registration mismatch.",
      aadhaar: "2345 6789 0123"
    }
  ]

  // Filter vendors by active tab status
  const currentVendors = React.useMemo(() => {
    const apiVendors = response?.data
    const list = (apiVendors && apiVendors.length > 0)
      ? (apiVendors as unknown as VendorVerificationRecord[]).map(v => ({
          ...v,
          submittedAt: (v as any).submittedAt || new Date().toISOString(),
          aadhaarUrl: (v as any).aadhaarUrl || "",
          verificationStatus: (v as any).verificationStatus || activeTab,
          businessAddress: (v as any).businessAddress || v.location || ""
        }))
      : mockVendors
    return list.filter(v => v.verificationStatus === activeTab)
  }, [response?.data, activeTab])

  const handleApprove = (id: string) => {
    const notes = decisionNotes[id] || ""
    verifyMutation.mutate({ id, notes })
  }

  const handleReject = (id: string) => {
    const reason = decisionNotes[id] || ""
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason first.")
      return
    }
    rejectMutation.mutate({ id, reason })
  }

  const handleTextChange = (id: string, text: string) => {
    setDecisionNotes(prev => ({ ...prev, [id]: text }))
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
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Vendor Verification Panel</h1>
            <p className="text-xs text-slate-400">Verify local contractor credentials, Aadhaar cards, GSTIN numbers, and portfolio reviews.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Pending Verification ({mockVendors.filter(v => v.verificationStatus === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "verified"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Verified Partners ({mockVendors.filter(v => v.verificationStatus === 'verified').length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "rejected"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Rejected Submissions ({mockVendors.filter(v => v.verificationStatus === 'rejected').length})
          </button>
        </div>

        {/* Vendor Grid */}
        {currentVendors.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 p-12 text-center text-slate-500">
            <CheckCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm">No contractor profiles in this category.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {currentVendors.map((vendor) => {
              const formattedDate = new Date(vendor.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })

              return (
                <Card 
                  key={vendor.id} 
                  className={`bg-slate-900 border-slate-800 p-5 space-y-4 flex flex-col justify-between hover:border-slate-750 transition-all duration-300 shadow-lg ${
                    activeTab === "verified" ? "border-l-4 border-l-green-600" : activeTab === "rejected" ? "border-l-4 border-l-red-600" : ""
                  }`}
                >
                  <div className="space-y-3.5">
                    
                    {/* Header: Name, Category, Submission */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white uppercase">{vendor.businessName}</h3>
                          <span className="text-3xs text-slate-400">({vendor.name})</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-sans mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{vendor.location}</span>
                          <span className="text-slate-700 mx-1">|</span>
                          <span className="font-bold text-blue-400 uppercase">{vendor.category}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest">SUBMITTED ON</span>
                        <span className="text-[10px] text-slate-300 font-mono">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-800" />

                    {/* Meta information: Address, GSTIN, Aadhaar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Left: Address */}
                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Office Address</span>
                        <span className="text-slate-300 text-[11px] leading-relaxed block">{vendor.businessAddress}</span>
                      </div>

                      {/* Aadhaar Number */}
                      <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase block">Aadhaar Card</span>
                          <span className="text-[10px] text-slate-300 font-mono mt-0.5 block">{vendor.aadhaar}</span>
                        </div>
                        <button
                          onClick={() => setInspectingDoc({ title: `Aadhaar - ${vendor.businessName}`, url: vendor.aadhaarUrl, isImage: true })}
                          className="text-[9px] font-bold text-blue-400 hover:text-white uppercase flex items-center gap-0.5"
                        >
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      {/* GSTIN Number */}
                      <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase block">GSTIN Register</span>
                          <span className="text-[10px] text-slate-300 font-mono mt-0.5 block">{vendor.gstin || "N/A"}</span>
                        </div>
                        {vendor.gstinUrl ? (
                          <button
                            onClick={() => setInspectingDoc({ title: `GSTIN - ${vendor.businessName}`, url: vendor.gstinUrl!, isImage: true })}
                            className="text-[9px] font-bold text-blue-400 hover:text-white uppercase flex items-center gap-0.5"
                          >
                            View <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-bold uppercase font-sans">No GSTIN</span>
                        )}
                      </div>

                    </div>

                    {/* Portfolio images links */}
                    {vendor.portfolioUrls && vendor.portfolioUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Portfolio Work Samples ({vendor.portfolioUrls.length})</span>
                        <div className="flex flex-wrap gap-2">
                          {vendor.portfolioUrls.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => setInspectingDoc({ title: `${vendor.businessName} - Sample ${index + 1}`, url, isImage: true })}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded text-[10px] text-slate-300 font-mono flex items-center gap-1"
                            >
                              <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                              <span>Sample_{index + 1}.jpg</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display existing verifications or rejection logs */}
                    {vendor.verificationNotes && (
                      <div className="p-2.5 bg-green-500/5 border border-green-500/15 rounded text-[11px] text-green-400/90 leading-relaxed font-sans">
                        <span className="font-bold block uppercase text-[8px] tracking-wider mb-0.5">APPROVAL AUDIT NOTES</span>
                        {vendor.verificationNotes}
                      </div>
                    )}

                    {vendor.rejectionReason && (
                      <div className="p-2.5 bg-red-500/5 border border-red-500/15 rounded text-[11px] text-red-400/90 leading-relaxed font-sans">
                        <span className="font-bold block uppercase text-[8px] tracking-wider mb-0.5">REJECTION REASON DISPATCHED</span>
                        {vendor.rejectionReason}
                      </div>
                    )}

                  </div>

                  {/* Operational Decision Triggers (Active only in Pending Tab) */}
                  {activeTab === "pending" && (
                    <div className="space-y-3.5 pt-4 border-t border-slate-800">
                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Decision Logs & Verification Notes</span>
                        <Input
                          placeholder={
                            vendor.gstin 
                              ? "Specify audit confirmation, or details explaining rejection..."
                              : "Audit notes or reason for rejection (required for reject)..."
                          }
                          value={decisionNotes[vendor.id] || ""}
                          onChange={(e) => handleTextChange(vendor.id, e.target.value)}
                          className="bg-slate-950 border-slate-800 focus:border-blue-500 text-xs h-9"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleApprove(vendor.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-3xs flex-1 h-9 rounded"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve Partner
                        </Button>
                        <Button
                          onClick={() => handleReject(vendor.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-3xs flex-1 h-9 rounded"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Application
                        </Button>
                      </div>
                    </div>
                  )}

                </Card>
              )
            })}
          </div>
        )}

        {/* Document Inspection Lightbox Dialog */}
        {inspectingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
            <Card className="bg-slate-950 border-slate-800 max-w-2xl w-full p-4 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{inspectingDoc.title}</h3>
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden select-none relative w-full h-[460px]">
                {inspectingDoc.isImage ? (
                  <Image
                    src={inspectingDoc.url}
                    alt={inspectingDoc.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    className="object-contain rounded"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText className="h-12 w-12 text-slate-500 mx-auto" />
                    <span className="text-xs text-slate-400 block">PDF Document Stream Preview not available</span>
                    <a
                      href={inspectingDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] rounded inline-block"
                    >
                      Download Document File
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardShell>
  )
}
