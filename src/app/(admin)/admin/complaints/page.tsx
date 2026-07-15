"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi, Complaint } from "@/lib/api/admin"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  AlertOctagon, 
  MessageSquare, 
  CheckCircle, 
  FolderKanban, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from "lucide-react"

export default function AdminComplaintsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // State
  const [activeTab, setActiveTab] = React.useState<string>("") // Filter status: All / Open / In Review / Resolved / Escalated
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null)
  const [resolutionNotes, setResolutionNotes] = React.useState("")

  // Queries
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "complaints", activeTab],
    queryFn: () => adminApi.complaints.list({ status: activeTab || undefined }),
  })

  // Mutations
  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => adminApi.complaints.resolve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] })
      toast.success("Dispute successfully marked as RESOLVED. Emails dispatched to both parties.")
      setSelectedComplaint(null)
      setResolutionNotes("")
    },
    onError: () => toast.error("Failed to resolve complaint")
  })

  const escalateMutation = useMutation({
    mutationFn: (id: string) => adminApi.complaints.escalate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] })
      toast.warning("Dispute escalated to operations lead.")
      setSelectedComplaint(null)
      setResolutionNotes("")
    },
    onError: () => toast.error("Failed to escalate complaint")
  })

  // Mock complaints list
  const mockComplaints: Complaint[] = [
    {
      id: "comp_001",
      clientId: "u_2",
      clientName: "Ananya Reddi",
      vendorId: "v_2",
      vendorName: "Ranga Carpentry & Kitchens",
      projectId: "proj_103",
      projectName: "Modular Kitchen Cabinet Woodworking",
      issue: "Defective hardware and panel misalignment",
      description: "Contractor used local hinges instead of the agreed Hettich soft-close hardware. Three drawer panels are rubbing and misaligned. Requesting refund for milestone 2 or replacement of hardware.",
      status: "open",
      priority: "high",
      createdAt: "2026-05-31T09:12:00Z",
      chatThread: [
        { sender: "client", message: "Hi Ranganath, the hinges installed in the kitchen drawers aren't Hettich brand. We explicitly wrote Hettich in the contract.", timestamp: "2026-05-29T10:00:00Z" },
        { sender: "vendor", message: "We faced supply shortage in Visakhapatnam warehouse. Local hinges are of same premium grade marine SS.", timestamp: "2026-05-29T11:15:00Z" },
        { sender: "client", message: "That is not acceptable. Hettich soft-close is what we paid for. Please replace them or refund the milestone value.", timestamp: "2026-05-29T11:45:00Z" },
        { sender: "vendor", message: "Replacing will cost us extra labor and delay cabinet mounting schedule.", timestamp: "2026-05-30T09:00:00Z" }
      ]
    },
    {
      id: "comp_002",
      clientId: "u_4",
      clientName: "P. Srinivasa Rao",
      vendorId: "v_1",
      vendorName: "Guntur Masonry & Builders",
      projectId: "proj_102",
      projectName: "Guntur Residential Construction",
      issue: "Structural crack in brick wall plastering",
      description: "A diagonal structural crack has opened up in the main brick wall plastered two days ago. Contractor claims it is a minor settlement crack, but it seems deep. We request structural review before escrow milestone release.",
      status: "in_review",
      priority: "high",
      createdAt: "2026-05-30T16:30:00Z",
      chatThread: [
        { sender: "client", message: "Satish, check this diagonal crack in the living room wall. It goes right from window corner to base.", timestamp: "2026-05-28T14:30:00Z" },
        { sender: "vendor", message: "Sir, this is just normal drying shrinkage. Plastering was done under high heat. It does not affect brick core.", timestamp: "2026-05-28T16:00:00Z" },
        { sender: "client", message: "No, this is wide. I can insert a coin. Please come inspect personally.", timestamp: "2026-05-28T16:30:00Z" }
      ]
    },
    {
      id: "comp_003",
      clientId: "u_8",
      clientName: "B. Lakshmi",
      vendorId: "v_3",
      vendorName: "Vizag Painters & Finishers",
      projectId: "proj_101",
      projectName: "Luxury Villa Painting & Finishing",
      issue: "Delay in milestone 3 schedule completion",
      description: "Paint work is running two weeks behind schedule due to cyclone warning in coastal Visakhapatnam. Both parties have agreed to a revised schedule extension and case was resolved.",
      status: "resolved",
      priority: "medium",
      createdAt: "2026-05-24T11:00:00Z",
      chatThread: []
    }
  ]

  const rawComplaints: Complaint[] = (response?.data && (response.data as Complaint[]).length > 0) ? (response.data as Complaint[]) : mockComplaints

  const filteredComplaints = React.useMemo(() => {
    let result = [...rawComplaints]
    if (activeTab) {
      result = result.filter((c: Complaint) => c.status === activeTab)
    }
    return result
  }, [rawComplaints, activeTab])

  const getPriorityStyle = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === "high") {
      return "bg-red-500/10 text-red-400 border-red-500/20"
    }
    if (p === "medium") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    }
    return "bg-slate-800 text-slate-400 border-slate-700"
  }

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === "open") {
      return "bg-red-600/10 text-red-400 border-red-600/20"
    }
    if (s === "in_review" || s === "review") {
      return "bg-amber-600/10 text-amber-400 border-amber-600/20"
    }
    if (s === "resolved") {
      return "bg-green-600/10 text-green-400 border-green-600/20"
    }
    return "bg-purple-600/10 text-purple-400 border-purple-600/20"
  }

  const handleResolveSubmit = () => {
    if (!selectedComplaint) return
    if (!resolutionNotes.trim()) {
      toast.error("Please add resolution audit notes describing the settlement.")
      return
    }
    resolveMutation.mutate({ id: selectedComplaint.id, notes: resolutionNotes })
  }

  const handleEscalateSubmit = () => {
    if (!selectedComplaint) return
    escalateMutation.mutate(selectedComplaint.id)
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
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Disputes & Complaints Desk</h1>
            <p className="text-xs text-slate-400">Resolve client-contractor arguments, read logs, audit chat threads, and release held escrow.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === ""
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            All Disputes ({rawComplaints.length})
          </button>
          <button
            onClick={() => setActiveTab("open")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "open"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Open ({rawComplaints.filter((c: Complaint) => c.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab("in_review")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "in_review"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            In Review ({rawComplaints.filter((c: Complaint) => c.status === 'in_review').length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "resolved"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Resolved ({rawComplaints.filter((c: Complaint) => c.status === 'resolved').length})
          </button>
        </div>

        {/* Main Content Grid: Left side table, Right side detail drawer */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Roster Table (2/3 width on large screens) */}
          <Card className="bg-slate-900 border-slate-800 p-4 xl:col-span-2 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 pl-1.5">Submitted</th>
                    <th className="pb-3">Project / Dispute</th>
                    <th className="pb-3">Involved Parties</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3 text-right">Status</th>
                    <th className="pb-3 text-right pr-1.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 animate-pulse">
                        Loading active complaints database...
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No active complaints match filter.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((comp) => {
                      const dateStr = new Date(comp.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short"
                      })

                      const isSelected = selectedComplaint?.id === comp.id

                      return (
                        <tr 
                          key={comp.id} 
                          className={`hover:bg-slate-850/30 transition-colors cursor-pointer ${
                            isSelected ? "bg-blue-600/5" : ""
                          }`}
                          onClick={() => setSelectedComplaint(comp)}
                        >
                          <td className="py-3.5 pl-1.5 font-mono text-[10px] text-slate-400">{dateStr}</td>
                          <td className="py-3.5">
                            <div>
                              <span className="font-bold text-white block">{comp.issue}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{comp.projectName}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="space-y-0.5">
                              <span className="text-blue-400 block text-[10px]">Client: {comp.clientName}</span>
                              <span className="text-orange block text-[10px]">Vendor: {comp.vendorName}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${
                              getPriorityStyle(comp.priority)
                            }`}>
                              {comp.priority}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${
                              getStatusStyle(comp.status)
                            }`}>
                              {comp.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedComplaint(comp)}
                              className="text-[10px] text-blue-400 hover:text-white font-bold uppercase flex items-center justify-end w-full"
                            >
                              Details <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Details Sidebar panel (1/3 width) */}
          <div className="space-y-4">
            {selectedComplaint ? (
              <Card className="bg-slate-900 border-slate-800 p-5 space-y-4 animate-in fade-in duration-300">
                
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">CASE ID: {selectedComplaint.id}</span>
                    <h3 className="text-xs font-bold text-white uppercase mt-0.5">Dispute Details</h3>
                  </div>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase"
                  >
                    Deselect
                  </button>
                </div>

                {/* Complaint Body */}
                <div className="space-y-4 text-xs">
                  
                  {/* Issue Description */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">COMPLAINT SUBMISSION</span>
                    <p className="text-slate-300 bg-slate-950 border border-slate-850 p-2.5 rounded leading-relaxed text-[11px]">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* Project summary */}
                  <div className="bg-slate-950 border border-slate-850 rounded p-2.5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <FolderKanban className="h-3.5 w-3.5 text-blue-400" /> Project Context
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Title:</span>
                        <span className="text-white font-medium">{selectedComplaint.projectName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disputant:</span>
                        <span className="text-slate-300 font-semibold">{selectedComplaint.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contractor:</span>
                        <span className="text-slate-300 font-semibold">{selectedComplaint.vendorName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat transcript thread */}
                  {selectedComplaint.chatThread && selectedComplaint.chatThread.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Chat Logs Transcript
                      </span>
                      <div className="bg-slate-950 border border-slate-850 rounded p-2.5 max-h-48 overflow-y-auto space-y-2">
                        {selectedComplaint.chatThread.map((chat, idx) => {
                          const isClient = chat.sender === "client"
                          return (
                            <div 
                              key={idx} 
                              className={`flex flex-col max-w-[85%] rounded p-2 ${
                                isClient 
                                  ? "bg-blue-600/10 border border-blue-500/10 text-blue-100 self-start" 
                                  : "bg-orange-500/5 border border-orange-500/10 text-orange-200 ml-auto items-end"
                              }`}
                            >
                              <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                                {isClient ? "Homeowner" : "Contractor"}
                              </span>
                              <p className="text-[10px] mt-0.5 leading-normal">{chat.message}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resolution Input Actions (Active in Open / In Review states) */}
                  {(selectedComplaint.status === "open" || selectedComplaint.status === "in_review") ? (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Arbitration Settlement Note</span>
                        <textarea
                          placeholder="Explain arbitration decision, escrow refund percentage, or cabinet rework guidelines..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs rounded p-2 w-full h-20 outline-none text-slate-200 leading-normal"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleResolveSubmit}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-3xs tracking-wider flex-1 h-9 rounded"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-0.5" /> Resolve Dispute
                        </Button>
                        <Button
                          onClick={handleEscalateSubmit}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-3xs tracking-wider flex-1 h-9 rounded"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 mr-0.5" /> Escalate Case
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-green-500/5 border border-green-500/15 rounded text-[11px] text-green-400 font-sans">
                      <span className="font-bold block uppercase text-[8px] tracking-wider mb-0.5">Resolution Decision</span>
                      Case resolved by operations admin. Settlement notes logged. Emails dispatched.
                    </div>
                  )}

                </div>

              </Card>
            ) : (
              <Card className="bg-slate-900 border-slate-800 p-8 text-center text-slate-500">
                <AlertOctagon className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <span className="text-xs">Select a dispute case from the roster to inspect logs, read message transcripts, and trigger arbitrations.</span>
              </Card>
            )}
          </div>

        </div>

      </div>
    </DashboardShell>
  )
}
