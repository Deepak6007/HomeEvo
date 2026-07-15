"use client";

import * as React from "react";
import { useLeads } from "@/hooks/vendor/leads";
import { useCreateBid } from "@/hooks/vendor/bids";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, UserPlus, FileText, Landmark, Hammer, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const NewLeadsPanel: React.FC = () => {
  // Query status: 'new' and pageSize: 5 to match server prefetch query key
  const { data: response, isLoading } = useLeads({ status: "new", pageSize: 5 });
  const leads = response?.data?.slice(0, 4) ?? [];

  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);

  const getLeadCategoryEmoji = (cat?: string) => {
    const name = cat?.toLowerCase() || "";
    if (name.includes("modular") || name.includes("kitchen")) return "🍳";
    if (name.includes("paint")) return "🎨";
    if (name.includes("electric")) return "⚡";
    if (name.includes("plumb")) return "🚰";
    if (name.includes("carpentry") || name.includes("wood")) return "🪵";
    return "🏗️";
  };

  const getRelativeTime = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return "Just now";
    if (diffHrs === 1) return "1 hr ago";
    if (diffHrs < 24) return `${diffHrs} hrs ago`;
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <h3 className="font-industrial text-base font-bold tracking-widest text-white uppercase flex items-center gap-2">
          <UserPlus className="h-4.5 w-4.5 text-orange" />
          <span>NEW MATCHING LEADS</span>
        </h3>
        <span className="font-mono text-3xs bg-orange/10 text-orange border border-orange/20 px-2 py-0.5 rounded-full font-bold">
          LIVE MATCHES
        </span>
      </div>

      {isLoading ? (
        <LeadsPanelSkeleton />
      ) : leads.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-dark-2">
          <p className="text-sm text-neutral-400">No new leads available in your categories.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              className="p-4 rounded-xl border border-white/4 bg-dark-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange/20 transition-all duration-300 group"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg p-1 bg-white/5 rounded shrink-0">
                    {getLeadCategoryEmoji(lead.category)}
                  </span>
                  <div>
                    <h4 className="font-body text-xs md:text-sm font-semibold text-white group-hover:text-orange transition-colors">
                      {lead.title}
                    </h4>
                    <span className="font-mono text-4xs text-neutral-500 tracking-wider">
                      {lead.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-3xs text-neutral-400 font-body">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                    <span>{getRelativeTime(lead.postedAt)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Bids:</span>{" "}
                    <span className="text-white font-mono font-semibold">{lead.bidCount} submitted</span>
                  </div>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-4xs font-mono font-bold tracking-wider",
                    lead.status === "new" 
                      ? "bg-orange/10 text-orange border border-orange/20" 
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  )}>
                    {lead.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Right Budget and Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="font-mono text-xs md:text-sm font-bold text-orange">
                  {lead.budgetRange}
                </div>
                
                <Dialog open={composerOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
                  setComposerOpen(open);
                  if (open) setSelectedLeadId(lead.id);
                }}>
                  <DialogTrigger render={
                    <Button 
                      className="font-industrial text-3xs font-black uppercase tracking-wider bg-white/5 hover:bg-orange hover:text-white text-white border border-white/10 hover:border-transparent px-3 py-1.5 rounded-md transition-all duration-300"
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setComposerOpen(true);
                      }}
                    >
                      BID &rarr;
                    </Button>
                  } />
                  <DialogContent className="bg-dark-2 border border-white/10 text-white max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-industrial text-lg font-bold tracking-wider uppercase text-white">
                        SUBMIT PROJECT PROPOSAL
                      </DialogTitle>
                    </DialogHeader>
                    {selectedLeadId === lead.id && (
                      <BidComposer 
                        leadId={lead.id} 
                        leadBudget={lead.budgetRange} 
                        onClose={() => setComposerOpen(false)} 
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component: BidComposer
interface BidComposerProps {
  leadId: string;
  leadBudget: string;
  onClose: () => void;
}

const BidComposer: React.FC<BidComposerProps> = ({ leadId, leadBudget, onClose }) => {
  const createBid = useCreateBid();
  const [amount, setAmount] = React.useState("");
  const [timeline, setTimeline] = React.useState("30 Days");
  const [description, setDescription] = React.useState("");
  const [milestones, setMilestones] = React.useState<Array<{ title: string; amount: number; deliverable: string; timeline: string }>>([
    { title: "Initial Advance", amount: 15000, deliverable: "Material Procurement & Layout Setup", timeline: "5 Days" },
    { title: "Core Execution", amount: 25000, deliverable: "Structural Work & Quality Inspection", timeline: "15 Days" },
    { title: "Final Handover", amount: 10000, deliverable: "Finishing, Clean up & Delivery", timeline: "10 Days" }
  ]);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "New Milestone", amount: 5000, deliverable: "Provide completion report", timeline: "5 Days" }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (index: number, key: string, val: string | number) => {
    setMilestones(milestones.map((m, i) => i === index ? { ...m, [key]: val } : m));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalBidAmount = parseFloat(amount);
    if (isNaN(totalBidAmount) || totalBidAmount <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }

    const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
    if (milestoneSum !== totalBidAmount) {
      toast.error(`Milestone total (₹${milestoneSum.toLocaleString()}) must match the total bid amount (₹${totalBidAmount.toLocaleString()}).`);
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a short proposal description.");
      return;
    }

    createBid.mutate(
      {
        leadId,
        payload: {
          amount: totalBidAmount,
          timeline,
          description,
          milestones
        }
      },
      {
        onSuccess: () => {
          toast.success("Proposal submitted successfully!");
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to submit proposal.");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-4xs font-mono text-neutral-400">
        Estimated Client Budget: <span className="text-orange font-bold">{leadBudget}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
            BID AMOUNT (₹)
          </label>
          <Input 
            type="number"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="bg-dark-3 border-white/10 text-white font-mono text-xs focus-visible:ring-orange focus-visible:border-orange"
          />
        </div>
        <div className="space-y-1">
          <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
            EST. TIMELINE
          </label>
          <Input 
            placeholder="e.g. 30 Days"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            required
            className="bg-dark-3 border-white/10 text-white font-mono text-xs focus-visible:ring-orange focus-visible:border-orange"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
          PROPOSAL / DESCRIPTION
        </label>
        <textarea 
          placeholder="Describe your design plan, qualifications, and implementation steps..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full rounded-md bg-dark-3 border border-white/10 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange"
        />
      </div>

      {/* Milestones Setup */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
            ESCROW MILESTONES
          </label>
          <button 
            type="button"
            onClick={handleAddMilestone}
            className="text-4xs text-orange font-bold font-industrial uppercase tracking-widest flex items-center gap-0.5 hover:underline"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-2.5 rounded bg-dark-3 border border-white/5 flex gap-2 items-center">
              <div className="flex-1 space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Milestone Title"
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                    required
                    className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                  />
                  <Input 
                    type="number"
                    placeholder="Amount (₹)"
                    value={m.amount || ""}
                    onChange={(e) => handleUpdateMilestone(idx, "amount", parseFloat(e.target.value) || 0)}
                    required
                    className="bg-dark-2 border-white/5 text-4xs h-7 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Deliverable description"
                    value={m.deliverable}
                    onChange={(e) => handleUpdateMilestone(idx, "deliverable", e.target.value)}
                    required
                    className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                  />
                  <Input 
                    placeholder="Timeline"
                    value={m.timeline}
                    onChange={(e) => handleUpdateMilestone(idx, "timeline", e.target.value)}
                    required
                    className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => handleRemoveMilestone(idx)}
                className="text-neutral-500 hover:text-red-500 p-1 shrink-0"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 font-industrial uppercase text-xs"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createBid.isPending}
          className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-6"
        >
          {createBid.isPending ? "Submitting..." : "Submit Bid"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const LeadsPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/5" />
      ))}
    </div>
  );
};

export default NewLeadsPanel;
