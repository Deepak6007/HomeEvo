"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/leads";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { BidComposer } from "@/components/vendor/BidComposer";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Calendar, 
  UserCheck, 
  Gavel, 
  ArrowLeft,
  Lock,
  ChevronRight
} from "lucide-react";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { user } = useAuth();

  // BidComposer State
  const [composerOpen, setComposerOpen] = React.useState(false);

  // Query Detail
  const { data: lead, isLoading, error } = useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadsApi.get(id),
    enabled: !!id,
  });

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
    };
  }, [user]);

  // Fallback Mock Lead details if API returns empty
  const mockLead = React.useMemo(() => {
    if (lead) return lead as any;
    return {
      id,
      title: "Modular Kitchen Cabinet Woodworking",
      clientName: "S. Murthy (Anonymized)",
      category: "Carpentry",
      location: "Vijayawada, Andhra Pradesh",
      budgetRange: "₹1,20,000 - ₹1,50,000",
      description: "Need complete modular cabinet integration with premium acrylic finishes. Total space dimensions are 12x10 sq ft. Layout design plan is ready, seeking execution contractor. Standard client-approved materials only.",
      postedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      bidCount: 4,
      status: "new" as const,
      timeline: "3 Weeks",
      timeRemaining: "4 days left",
      photos: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1556909212-d5b604dadb72?w=600&auto=format&fit=crop&q=60"
      ]
    };
  }, [lead, id]) as any;

  if (isLoading) {
    return (
      <DashboardShell role="vendor" navItems={vendorNavItems} user={shellUser} topbarActions={<AvailabilityToggle />}>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-48 bg-white/5 rounded-xl" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/vendor/leads"
            className="flex items-center gap-1 font-industrial text-3xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Leads
          </Link>
          <span className="font-mono text-4xs text-neutral-500">ID: {id}</span>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Specifications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-orange/10 border border-orange/20 text-orange font-mono font-bold uppercase tracking-wider text-5xs px-2 py-0.5 rounded">
                    {mockLead.category.toUpperCase()}
                  </span>
                  <span className="font-mono text-5xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    MATCHING LEAD
                  </span>
                </div>
                <h2 className="font-body text-sm md:text-lg font-bold">
                  {mockLead.title}
                </h2>
                <div className="flex items-center gap-1.5 text-3xs text-neutral-400 font-body">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{mockLead.location}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <h4 className="font-industrial text-4xs font-bold tracking-widest text-neutral-500 uppercase">PROJECT REQUIREMENTS</h4>
                <p className="font-body text-3xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {mockLead.description}
                </p>
              </div>

              {/* Photo Attachments */}
              {mockLead.photos && mockLead.photos.length > 0 && (
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <h4 className="font-industrial text-4xs font-bold tracking-widest text-neutral-500 uppercase">ATTACHED blueprints & SITE PHOTOS</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {mockLead.photos.map((url: string, i: number) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-white/5 bg-dark-2 aspect-video group">
                        <Image 
                          src={url} 
                          alt={`Attachment ${i+1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZkZjhmMiIvPjwvc3ZnPg=="
                          className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Escrow & Bidding Info Card */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-6 shadow-xl">
              
              <div className="space-y-3">
                <div>
                  <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider">ESTIMATED BUDGET SCALE</span>
                  <span className="font-mono text-lg font-black text-orange block">
                    {mockLead.budgetRange}
                  </span>
                  <span className="text-5xs text-neutral-500 font-body block mt-0.5">Escrow-backed milestone payouts.</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider">TARGET TIMELINE</span>
                    <span className="font-mono text-xs font-bold text-white block mt-0.5">
                      { (mockLead as any).timeline || "4 Weeks" }
                    </span>
                  </div>
                  <div>
                    <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider">TIME REMAINING</span>
                    <span className="font-mono text-xs font-bold text-amber-400 block mt-0.5">
                      { (mockLead as any).timeRemaining || "3 Days Left" }
                    </span>
                  </div>
                </div>
              </div>

              {/* Anonymity Card */}
              <div className="p-3.5 rounded-lg border border-white/5 bg-dark-2 flex items-start gap-3">
                <Lock className="h-4.5 w-4.5 text-neutral-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-4xs font-mono font-bold text-neutral-400 uppercase tracking-wide">
                    CLIENT ANONYMOUS
                  </h4>
                  <p className="text-5xs text-neutral-500 leading-normal font-body">
                    Homeowner contact details (Phone/Email) are hidden to protect privacy until they accept your proposal.
                  </p>
                </div>
              </div>

              {/* Bids Status */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-3xs font-body text-neutral-400">
                <div className="flex items-center gap-1">
                  <Gavel className="h-4 w-4 text-neutral-500" />
                  <span>Bids Submitted:</span>
                </div>
                <span className="font-mono text-white font-bold">{mockLead.bidCount}</span>
              </div>

              {mockLead.status !== "closed" && (
                <Button
                  onClick={() => setComposerOpen(true)}
                  className="w-full bg-orange hover:bg-orange/90 text-white font-industrial font-black uppercase tracking-wider text-xs py-5 rounded-md shadow-[0_0_15px_rgba(232,93,4,0.25)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,93,4,0.45)]"
                >
                  Submit Proposal Bid
                </Button>
              )}

            </div>
          </div>

        </div>

        {/* Global BidComposer Sheet */}
        <BidComposer
          leadId={id}
          leadBudget={mockLead.budgetRange}
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
        />

      </div>
    </DashboardShell>
  );
}
