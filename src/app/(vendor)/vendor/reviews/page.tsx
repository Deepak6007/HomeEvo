"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { vendorProfileApi } from "@/lib/api/vendorProfile";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Star, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp,
  CornerDownRight,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ReviewsPage() {
  const { user } = useAuth();

  // Filters State
  const [selectedSort, setSelectedSort] = React.useState<string>("newest");
  const [page, setPage] = React.useState(1);
  const [replies, setReplies] = React.useState<Record<string, string>>({});
  const [replyInputText, setReplyInputText] = React.useState<Record<string, string>>({});
  const [expandedTextIds, setExpandedTextIds] = React.useState<Record<string, boolean>>({});

  // Query Hook
  const { data: response, isLoading } = useQuery({
    queryKey: [...queryKeys.vendorProfile.all, "reviews", page],
    queryFn: () => vendorProfileApi.getReviews({ page }),
  });

  const reviewsList = response?.data ?? [
    // Fallback Mock Reviews
    { id: "rev_1", clientName: "Amit Kumar", rating: 5, comment: "Exceptional quality and timely delivery! Raju custom-built modular kitchen cabinets for us and they look amazing. Kept the workspace completely clean and finalized everything in Guntur on schedule.", createdAt: "2026-05-20T12:00:00Z", projectName: "Luxury Modular Kitchen Design", responseText: "Thank you Amit! It was a pleasure working with you on this project." },
    { id: "rev_2", clientName: "B. Lakshmi", rating: 4, comment: "Very good carpentry work. The acrylic panels look premium. Small delay of 2 days on material deliveries due to logistics in AP, but Raju handled the core layout assembly with excellent skills.", createdAt: "2026-05-18T09:00:00Z", projectName: "Living Room Partition & Panels", responseText: "" },
    { id: "rev_3", clientName: "V. Srinivas", rating: 5, comment: "Solid workmanship. Understood our structural wood requirements immediately. Best quote and clean execution. Highly recommended professional.", createdAt: "2026-05-12T16:30:00Z", projectName: "Office Dividing Screens Setup", responseText: "" }
  ];

  const breakdown = [
    { stars: 5, pct: 75 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 0 }
  ];

  // Client-Side Sort Process
  const processedReviews = React.useMemo(() => {
    const list = [...reviewsList];
    list.sort((a, b) => {
      if (selectedSort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (selectedSort === "highest") {
        return b.rating - a.rating;
      }
      if (selectedSort === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });
    return list;
  }, [reviewsList, selectedSort]);

  const handleToggleExpandText = (id: string) => {
    setExpandedTextIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePostReply = (reviewId: string) => {
    const text = replyInputText[reviewId];
    if (!text?.trim()) return;

    setReplies(prev => ({ ...prev, [reviewId]: text.trim() }));
    setReplyInputText(prev => ({ ...prev, [reviewId]: "" }));
    toast.success("Response reply logged successfully!");
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
              CLIENT REVIEWS & RATINGS
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Browse reviews, analyze star statistics, and reply to client testimonials.
            </p>
          </div>
        </div>

        {/* Ratings Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-white/6 bg-dark-3 p-6 shadow-md">
          
          {/* Large Average Display */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-white/5 space-y-2">
            <span className="font-mono text-5xl font-black text-white select-none">4.8</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 text-orange fill-orange" />
              ))}
            </div>
            <span className="font-body text-4xs text-neutral-500 uppercase font-bold tracking-wider">
              24 CLIENT TESTIMONIALS
            </span>
          </div>

          {/* Breakdown bars */}
          <div className="md:col-span-2 flex flex-col justify-center gap-2 p-2">
            {breakdown.map((bar) => (
              <div key={bar.stars} className="flex items-center gap-3 text-4xs font-mono">
                <span className="text-neutral-500 w-6 text-right font-bold">{bar.stars} ★</span>
                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange transition-all duration-500" style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="text-neutral-400 w-8 text-left font-bold">{bar.pct}%</span>
              </div>
            ))}
          </div>

        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-orange" /> DETAILED CLIENT REVIEWS
            </h3>
            
            <div className="flex items-center gap-1.5">
              <span className="text-5xs font-industrial text-neutral-500 font-bold uppercase tracking-wider">SORT:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-dark-3 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange font-mono font-bold text-orange"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {processedReviews.map((rev: any) => {
                const initials = rev.clientName.split(" ").map((n: string) => n[0]).join("").toUpperCase();
                const isExpanded = expandedTextIds[rev.id] ?? false;
                const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });
                
                const replyText = replies[rev.id] || rev.responseText;

                return (
                  <div key={rev.id} className="rounded-xl border border-white/6 bg-dark-3 p-5 space-y-4 hover:border-white/10 transition-all duration-300">
                    
                    {/* Header: User, Star, Date */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/5 select-none shrink-0">
                          <AvatarFallback className="bg-orange/10 font-mono font-bold text-orange text-3xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <h4 className="font-body text-xs font-bold text-white leading-tight">{rev.clientName}</h4>
                          <span className="font-mono text-5xs text-neutral-500 block uppercase tracking-wider">
                            Project: {rev.projectName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="flex items-center gap-0.5 justify-end">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3 shrink-0", 
                                i < rev.rating ? "text-orange fill-orange" : "text-neutral-700"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="font-mono text-5xs text-neutral-500 block">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Review text comment */}
                    <div className="space-y-1.5 font-body text-3xs text-neutral-300 leading-relaxed">
                      <p className={cn(!isExpanded && "line-clamp-2")}>
                        {rev.comment}
                      </p>
                      {rev.comment.length > 150 && (
                        <button
                          onClick={() => handleToggleExpandText(rev.id)}
                          className="text-orange font-mono font-bold text-4xs hover:underline flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Read more <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {replyText ? (
                      <div className="pl-4 border-l border-orange/30 bg-orange/2 p-3 rounded-r-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-neutral-400 font-industrial text-4xs font-bold uppercase tracking-wider select-none">
                          <CornerDownRight className="h-3.5 w-3.5 text-orange" />
                          <span>YOUR RESPONSE</span>
                        </div>
                        <p className="font-body text-3xs text-neutral-300 leading-relaxed">{replyText}</p>
                      </div>
                    ) : (
                      /* Response form input toggle */
                      <div className="pl-4 border-l border-white/5 space-y-2 pt-2">
                        <div className="flex gap-2">
                          <input 
                            placeholder="Reply to this client testimonial..."
                            value={replyInputText[rev.id] || ""}
                            onChange={(e) => setReplyInputText({ ...replyInputText, [rev.id]: e.target.value })}
                            className="bg-dark-2 border border-white/10 rounded px-2.5 py-1.5 text-3xs text-white outline-none focus:border-orange flex-1"
                          />
                          <Button
                            size="xs"
                            onClick={() => handlePostReply(rev.id)}
                            className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-4xs rounded px-3 h-8"
                          >
                            <Send className="h-3 w-3 mr-1" /> Reply
                          </Button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Table pagination UI */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-4xs font-mono text-neutral-400">
            <span>Page {page} of 1</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border border-white/5 hover:bg-white/5 h-8 w-8 text-neutral-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={true}
                onClick={() => setPage(page + 1)}
                className="border border-white/5 hover:bg-white/5 h-8 w-8 text-neutral-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
