"use client";

import * as React from "react";
import Link from "next/link";
import { useLeads } from "@/hooks/vendor/leads";
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
  RefreshCw, 
  Search, 
  MessageSquare,
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queryKeys";

export default function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters State
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = React.useState<string>("");
  const [selectedPosted, setSelectedPosted] = React.useState<string>("");
  const [selectedSort, setSelectedSort] = React.useState<string>("newest");

  // BidComposer State
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null);
  const [activeLeadBudget, setActiveLeadBudget] = React.useState<string>("");

  // Query Hook
  const { data: response, refetch, isFetching, isLoading } = useLeads({
    category: selectedCategory,
    location: selectedLocation || undefined,
    status: "new"
  });

  const rawLeads = response?.data ?? [
    // Fallback Mock Leads
    { id: "lead_1", title: "Luxury Villa Painting & Finishing", clientName: "A. Reddy", category: "Painting", location: "Visakhapatnam", budgetRange: "₹2,50,000 - ₹3,00,000", description: "Looking for premium exterior texture painting for a 3-floor villa. Brand must be Asian Paints Ultima.", postedAt: new Date(Date.now() - 4 * 3600000).toISOString(), bidCount: 2, status: "new" },
    { id: "lead_2", title: "Modular Kitchen Cabinet Woodworking", clientName: "R. Naidu", category: "Carpentry", location: "Vijayawada", budgetRange: "₹1,20,000 - ₹1,50,000", description: "Need custom marine plywood kitchen cabinets with acrylic laminates. Hardware must be Hettich.", postedAt: new Date(Date.now() - 24 * 3600000).toISOString(), bidCount: 5, status: "bidding" },
    { id: "lead_3", title: "Complete Residential Wiring Hookup", clientName: "K. Prasad", category: "Electrical", location: "Guntur", budgetRange: "₹80,000 - ₹95,000", description: "wiring hookups for a 1500 sq ft individual house in Guntur. Finolex cables and Legrand switches required.", postedAt: new Date(Date.now() - 72 * 3600000).toISOString(), bidCount: 1, status: "new" },
    { id: "lead_4", title: "Commercial Office Cabin Partitioning", clientName: "Ch. Rao", category: "Carpentry", location: "Nellore", budgetRange: "₹3,50,000 - ₹4,20,000", description: "Office partitioning using gypsum board and glass frames. Estimated timeline is 3 weeks.", postedAt: new Date(Date.now() - 100 * 3600000).toISOString(), bidCount: 0, status: "new" },
    { id: "lead_5", title: "Kitchen Sink & Bathroom Plumbing Setup", clientName: "S. Murthy", category: "Plumbing", location: "Vijayawada", budgetRange: "₹35,000 - ₹45,000", description: "Setup kitchen sink pipeline and install bathroom sanitary fittings. Jaguar fittings already bought.", postedAt: new Date(Date.now() - 2 * 3600000).toISOString(), bidCount: 3, status: "closed" }
  ];

  const categories = ["Carpentry", "Painting", "Electrical", "Plumbing", "Masonry"];
  const locations = ["Vijayawada", "Guntur", "Visakhapatnam", "Nellore"];

  // Manual Cache Refetch
  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    refetch();
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

  // Client-Side Filter & Sort Processing
  const processedLeads = React.useMemo(() => {
    let list = [...rawLeads];

    // Filter by Category
    if (selectedCategory) {
      list = list.filter(l => l.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Location
    if (selectedLocation) {
      list = list.filter(l => l.location.toLowerCase() === selectedLocation.toLowerCase());
    }

    // Filter by Posted Time
    if (selectedPosted) {
      const now = Date.now();
      list = list.filter(l => {
        const ageHrs = (now - new Date(l.postedAt).getTime()) / 3600000;
        if (selectedPosted === "today") return ageHrs <= 24;
        if (selectedPosted === "week") return ageHrs <= 24 * 7;
        if (selectedPosted === "month") return ageHrs <= 24 * 30;
        return true;
      });
    }

    // Apply Sorting
    list.sort((a, b) => {
      if (selectedSort === "newest") {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
      if (selectedSort === "budget") {
        // Parse budget ranges, e.g. "₹2,50,000 - ₹3,00,000" -> extract max or min
        const getBudgetVal = (bRange: string) => {
          const num = bRange.replace(/[^0-9]/g, "");
          return parseInt(num) || 0;
        };
        return getBudgetVal(b.budgetRange) - getBudgetVal(a.budgetRange);
      }
      if (selectedSort === "bids") {
        return a.bidCount - b.bidCount;
      }
      return 0;
    });

    return list;
  }, [rawLeads, selectedCategory, selectedLocation, selectedPosted, selectedSort]);

  const getLeadEmoji = (cat?: string) => {
    const name = cat?.toLowerCase() || "";
    if (name.includes("modular") || name.includes("kitchen") || name.includes("carpentry") || name.includes("wood")) return "🪵";
    if (name.includes("paint")) return "🎨";
    if (name.includes("electric")) return "⚡";
    if (name.includes("plumb")) return "🚰";
    if (name.includes("mason") || name.includes("cement") || name.includes("construct")) return "🧱";
    return "🏗️";
  };

  const getRelativeTimeText = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return "Just now";
    if (diffHrs === 1) return "1 hour ago";
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10">
        
        {/* Banner Title Section */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="font-industrial text-2xl font-bold tracking-wider uppercase text-white">
              LEAD DISCOVERY CORE
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Browse and bid on real-time client construction and interior design requirements.
            </p>
          </div>
          <button
            onClick={handleRefetch}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-md font-industrial text-4xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={cn("h-3 w-3", (isLoading || isFetching) && "animate-spin")} />
            <span>Refetch</span>
          </button>
        </div>

        {/* Inline Filter Bar */}
        <div className="p-4 rounded-xl border border-white/6 bg-dark-3 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={cn(
                  "px-3 py-1 rounded-full text-4xs font-mono font-bold tracking-wider border transition-all",
                  selectedCategory === undefined
                    ? "bg-orange/10 border-orange/30 text-orange"
                    : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                )}
              >
                ALL LEADS
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-4xs font-mono font-bold tracking-wider border transition-all",
                    selectedCategory === cat
                      ? "bg-orange/10 border-orange/30 text-orange"
                      : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                  )}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Select Dropdowns and Sorts */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Location Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-5xs font-industrial text-neutral-500 font-bold uppercase tracking-wider">CITY:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-dark-2 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange font-mono"
                >
                  <option value="">All Areas</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Posted date select */}
              <div className="flex items-center gap-1.5">
                <span className="text-5xs font-industrial text-neutral-500 font-bold uppercase tracking-wider">POSTED:</span>
                <select
                  value={selectedPosted}
                  onChange={(e) => setSelectedPosted(e.target.value)}
                  className="bg-dark-2 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange font-mono"
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-5xs font-industrial text-neutral-500 font-bold uppercase tracking-wider">SORT:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-dark-2 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange font-mono font-bold text-orange"
                >
                  <option value="newest">Newest First</option>
                  <option value="budget">Highest Budget</option>
                  <option value="bids">Fewest Bids</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Leads Cards Grid/List Layout */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-white/5 rounded-xl border border-white/6" />
            ))}
          </div>
        ) : processedLeads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-dark-3">
            <Filter className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No leads match your active filters.</p>
            <button 
              onClick={() => { setSelectedCategory(undefined); setSelectedLocation(""); setSelectedPosted(""); }}
              className="text-xs text-orange font-industrial font-bold uppercase tracking-wider mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {processedLeads.map((lead) => {
              // Status Styling
              const statusStyles: Record<string, { label: string; textClass: string; bgClass: string }> = {
                new: { label: "NEW", textClass: "text-orange border-orange/20", bgClass: "bg-orange/5" },
                bidding: { label: "ACTIVE BIDDING", textClass: "text-blue-400 border-blue-500/20", bgClass: "bg-blue-500/5" },
                closed: { label: "CLOSED", textClass: "text-neutral-500 border-white/5", bgClass: "bg-white/2" }
              };
              const leadStatus = lead.status === "closed" ? "closed" : lead.status === "bidding" ? "bidding" : "new";
              const statusDisplay = statusStyles[leadStatus];

              return (
                <div
                  key={lead.id}
                  className="p-5 rounded-xl border border-white/6 bg-dark-3 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-orange/20 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Lead Info */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 select-none">
                        {getLeadEmoji(lead.category)}
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-body text-xs md:text-sm font-bold text-white group-hover:text-orange transition-colors">
                            {lead.title}
                          </h3>
                          <div className={cn(
                            "px-2 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider",
                            statusDisplay.bgClass,
                            statusDisplay.textClass
                          )}>
                            {statusDisplay.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-4xs text-neutral-400 font-body">
                          <MapPin className="h-3 w-3 text-neutral-500 shrink-0" />
                          <span>{lead.location}</span>
                          <span className="text-neutral-600 font-mono font-normal mx-1">|</span>
                          <span className="font-mono text-orange font-bold uppercase tracking-wider text-[9px]">
                            {lead.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="font-body text-3xs text-neutral-400 leading-relaxed line-clamp-2 max-w-2xl">
                      {lead.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-4xs text-neutral-500 font-body">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                        <span>Posted {getRelativeTimeText(lead.postedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                        <span className="text-white font-mono font-semibold">{lead.bidCount} Bids Submitted</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="space-y-0.5">
                      <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider md:text-right">EST. BUDGET</span>
                      <span className="font-mono text-sm md:text-base font-black text-orange block">
                        {lead.budgetRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/vendor/leads/${lead.id}`}
                        className="font-industrial text-3xs font-black uppercase tracking-wider border border-white/10 hover:border-orange/20 text-neutral-400 hover:text-white hover:bg-white/5 px-3.5 py-2 rounded-md transition-all flex items-center gap-1 h-9"
                      >
                        Details <ChevronRight className="h-3 w-3" />
                      </Link>
                      
                      {lead.status !== "closed" && (
                        <Button
                          onClick={() => {
                            setActiveLeadId(lead.id);
                            setActiveLeadBudget(lead.budgetRange);
                            setComposerOpen(true);
                          }}
                          className="bg-orange hover:bg-orange/90 text-white font-industrial font-black uppercase tracking-wider text-3xs px-4 py-2 rounded-md shadow-md h-9"
                        >
                          Submit Bid
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Global BidComposer Sheet */}
        {activeLeadId && (
          <BidComposer
            leadId={activeLeadId}
            leadBudget={activeLeadBudget}
            isOpen={composerOpen}
            onClose={() => {
              setComposerOpen(false);
              setActiveLeadId(null);
            }}
          />
        )}

      </div>
    </DashboardShell>
  );
}
