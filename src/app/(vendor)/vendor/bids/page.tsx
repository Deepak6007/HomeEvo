"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bidsApi } from "@/lib/api/bids";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { BidComposer } from "@/components/vendor/BidComposer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Gavel, 
  Calendar, 
  Trash2, 
  Edit3, 
  Eye, 
  Award,
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign,
  User
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function BidsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expandedBidId, setExpandedBidId] = React.useState<string | null>(null);

  // Edit composer states
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [editLeadId, setEditLeadId] = React.useState<string | null>(null);
  const [editBudget, setEditBudget] = React.useState("");

  // Query Hook
  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.vendorBids.list(),
    queryFn: () => bidsApi.list(),
  });

  const bids = response?.data ?? [
    // Fallback Mock Bids
    { id: "bid_1", leadId: "lead_2", amount: 135000, timeline: "4 Weeks", description: "Standard marine plywood modular setup with acrylic laminates and Hettich soft-close hinges.", status: "pending", createdAt: "2026-05-29T10:00:00Z", projectName: "Modular Kitchen Cabinet Woodworking", clientName: "Anonymized Client", milestones: [
      { title: "Initial Advance", amount: 45000, deliverable: "Material Procurement & Layout Setup", timeline: "1 Week" },
      { title: "Core Assembly", amount: 65000, deliverable: "Cabinet Framework & Assembly", timeline: "2 Weeks" },
      { title: "Final Finishing", amount: 25000, deliverable: "Laminates, Hardware & Handover", timeline: "1 Week" }
    ]},
    { id: "bid_2", leadId: "lead_1", amount: 275000, timeline: "3 Weeks", description: "Premium Asian Paints Ultima texture paint with anti-algae guarantee and wall putty repair prep.", status: "accepted", createdAt: "2026-05-25T14:30:00Z", projectName: "Luxury Villa Painting & Finishing", clientName: "A. Reddy", projectId: "proj_101", milestones: [
      { title: "Surface Preparation", amount: 80000, deliverable: "Putty work, scraping & base coating", timeline: "1 Week" },
      { title: "Core Painting", amount: 120000, deliverable: "Texture coating, double coat application", timeline: "1 Week" },
      { title: "Inspection & Touchups", amount: 75000, deliverable: "Final walkthrough & cleaning", timeline: "1 Week" }
    ]},
    { id: "bid_3", leadId: "lead_4", amount: 380000, timeline: "4 Weeks", description: "Complete office partitions using premium acoustic panels. Soundproof frames and clean designs.", status: "rejected", createdAt: "2026-05-20T09:15:00Z", projectName: "Commercial Office Cabin Partitioning", clientName: "Ch. Rao", milestones: [
      { title: "Frame Installations", amount: 150000, deliverable: "Setting metal layout & glass frames", timeline: "2 Weeks" },
      { title: "Acoustic Partition", amount: 150000, deliverable: "Placing glass panels & gypsum board", timeline: "1 Week" },
      { title: "Handover Setup", amount: 80000, deliverable: "Door lock systems & wiring", timeline: "1 Week" }
    ]}
  ];

  // Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: (bidId: string) => bidsApi.withdraw(bidId),
    onSuccess: () => {
      toast.success("Proposal withdrawn successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBids.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to withdraw proposal.");
    }
  });

  const handleWithdraw = (bidId: string) => {
    if (confirm("Are you sure you want to withdraw this proposal? This action is irreversible.")) {
      withdrawMutation.mutate(bidId);
    }
  };

  const handleEditBid = (leadId: string, budgetRange: string) => {
    setEditLeadId(leadId);
    setEditBudget(budgetRange);
    setComposerOpen(true);
  };

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
    };
  }, [user]);

  const toggleExpand = (bidId: string) => {
    setExpandedBidId(expandedBidId === bidId ? null : bidId);
  };

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="font-industrial text-2xl font-bold tracking-wider uppercase text-white">
              MY SUBMITTED PROPOSALS
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Track pending responses, accepted contracts, and milestone payments.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-dark-3 border border-white/6 p-1 rounded-lg flex w-full max-w-sm mb-6">
            <TabsTrigger value="all" className="flex-1 font-industrial text-4xs font-bold uppercase tracking-wider text-neutral-400 data-[state=active]:bg-orange data-[state=active]:text-white rounded py-1.5 transition-all">
              ALL
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 font-industrial text-4xs font-bold uppercase tracking-wider text-neutral-400 data-[state=active]:bg-orange data-[state=active]:text-white rounded py-1.5 transition-all">
              PENDING
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex-1 font-industrial text-4xs font-bold uppercase tracking-wider text-neutral-400 data-[state=active]:bg-orange data-[state=active]:text-white rounded py-1.5 transition-all">
              ACCEPTED
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 font-industrial text-4xs font-bold uppercase tracking-wider text-neutral-400 data-[state=active]:bg-orange data-[state=active]:text-white rounded py-1.5 transition-all">
              REJECTED
            </TabsTrigger>
          </TabsList>

          {["all", "pending", "accepted", "rejected"].map((tabStatus) => {
            const filteredBids = tabStatus === "all" 
              ? bids 
              : bids.filter((b) => b.status.toLowerCase() === tabStatus);

            return (
              <TabsContent key={tabStatus} value={tabStatus} className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-28 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-28 bg-white/5 rounded-xl border border-white/5" />
                  </div>
                ) : filteredBids.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-dark-3">
                    <Gavel className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">No proposals found in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBids.map((bid: any) => {
                      const isExpanded = expandedBidId === bid.id;
                      const statusStyles: Record<string, { label: string; textClass: string; bgClass: string }> = {
                        pending: { label: "UNDER REVIEW", textClass: "text-amber-400 border-amber-500/20", bgClass: "bg-amber-500/5" },
                        accepted: { label: "ACCEPTED", textClass: "text-green-400 border-green-500/20", bgClass: "bg-green-500/5" },
                        rejected: { label: "DECLINED", textClass: "text-red-400 border-red-500/20", bgClass: "bg-red-500/5" }
                      };
                      const bidStatus = statusStyles[bid.status] || statusStyles.pending;
                      const formattedDate = new Date(bid.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });

                      return (
                        <div 
                          key={bid.id} 
                          className="rounded-xl border border-white/6 bg-dark-3 overflow-hidden shadow-md group hover:border-white/10 transition-all duration-300"
                        >
                          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Left: Proposal Spec */}
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-body text-xs md:text-sm font-bold text-white group-hover:text-orange transition-colors">
                                  {bid.projectName || "Contract Proposal"}
                                </h3>
                                <div className={cn(
                                  "px-2 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider",
                                  bidStatus.bgClass,
                                  bidStatus.textClass
                                )}>
                                  {bidStatus.label}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-4xs text-neutral-400 font-body">
                                <div className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5 text-neutral-500" />
                                  <span>Client: {bid.clientName}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono">
                                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                                  <span>Submitted: {formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono">
                                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                                  <span>Timeline: {bid.timeline}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Price & Buttons */}
                            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                              <div className="space-y-0.5 pr-2 md:text-right">
                                <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider">PROPOSED PRICE</span>
                                <span className="font-mono text-sm md:text-base font-black text-orange block">
                                  ₹{bid.amount.toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {bid.status === "accepted" && bid.projectId && (
                                  <Link
                                    href={`/vendor/projects/${bid.projectId}`}
                                    className="font-industrial text-3xs font-black uppercase tracking-wider bg-orange hover:bg-orange/90 text-white px-3.5 py-2 rounded-md transition-all flex items-center gap-1.5 h-9"
                                  >
                                    <Award className="h-3.5 w-3.5" /> View Project
                                  </Link>
                                )}

                                {bid.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditBid(bid.leadId, `₹${bid.amount.toLocaleString()}`)}
                                      className="border border-white/5 hover:border-white/20 hover:bg-white/5 text-white font-industrial font-bold uppercase tracking-wider text-3xs h-9 px-3"
                                    >
                                      <Edit3 className="h-3.5 w-3.5 text-neutral-400 mr-1" /> Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleWithdraw(bid.id)}
                                      disabled={withdrawMutation.isPending}
                                      className="border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 font-industrial font-bold uppercase tracking-wider text-3xs h-9 px-3"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-500/60 mr-1" /> Withdraw
                                    </Button>
                                  </>
                                )}

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleExpand(bid.id)}
                                  className="border border-white/5 hover:bg-white/5 text-neutral-400 hover:text-white h-9 w-9"
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                          </div>

                          {/* Expanded milestones breakdown */}
                          {isExpanded && (
                            <div className="border-t border-white/5 bg-dark-2/50 p-5 space-y-3 font-body text-neutral-300">
                              <div className="space-y-1.5">
                                <span className="text-4xs font-mono text-neutral-500 block uppercase tracking-wider">Proposal Message Cover</span>
                                <p className="text-3xs text-neutral-400 leading-relaxed whitespace-pre-wrap">{bid.description}</p>
                              </div>

                              <div className="space-y-2 border-t border-white/5 pt-3">
                                <span className="text-4xs font-mono text-neutral-500 block uppercase tracking-wider">Milestone Escrow Schedule</span>
                                <div className="space-y-2 max-w-xl">
                                  {bid.milestones?.map((mil: any, i: number) => (
                                    <div key={i} className="p-3 bg-dark-3 border border-white/5 rounded flex justify-between items-center text-4xs">
                                      <div className="space-y-0.5">
                                        <span className="text-white font-semibold block">{mil.title}</span>
                                        <span className="text-neutral-500 block text-5xs leading-normal">{mil.deliverable} ({mil.timeline})</span>
                                      </div>
                                      <span className="font-mono text-orange font-bold">₹{mil.amount.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Global BidComposer for edit mode */}
        {editLeadId && (
          <BidComposer
            leadId={editLeadId}
            leadBudget={editBudget}
            isOpen={composerOpen}
            onClose={() => {
              setComposerOpen(false);
              setEditLeadId(null);
            }}
          />
        )}

      </div>
    </DashboardShell>
  );
}
