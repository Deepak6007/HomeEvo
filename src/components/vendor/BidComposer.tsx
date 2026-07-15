"use client";

import * as React from "react";
import { z } from "zod";
import { useCreateBid } from "@/hooks/vendor/bids";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Zod schemas for validation
const step1Schema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  timeline: z.string().min(1, "Timeline is required"),
  description: z.string().min(10, "Proposal message must be at least 10 characters long")
});

const milestoneSchema = z.object({
  title: z.string().min(1, "Milestone name is required"),
  deliverable: z.string().min(1, "Deliverable is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  timeline: z.string().min(1, "Timeline is required")
});

interface BidComposerProps {
  leadId: string;
  leadBudget: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BidComposer: React.FC<BidComposerProps> = ({
  leadId,
  leadBudget,
  isOpen,
  onClose
}) => {
  const createBid = useCreateBid();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Step 1 states
  const [amount, setAmount] = React.useState<number | "">("");
  const [timeline, setTimeline] = React.useState("4 Weeks");
  const [description, setDescription] = React.useState("");

  // Step 2 states
  const [milestones, setMilestones] = React.useState<Array<{ title: string; amount: number; deliverable: string; timeline: string }>>([
    { title: "Initial Advance", amount: 15000, deliverable: "Material Procurement & Layout Setup", timeline: "1 Week" },
    { title: "Core Execution", amount: 25000, deliverable: "Structural Work & Quality Inspection", timeline: "2 Weeks" },
    { title: "Final Handover", amount: 10000, deliverable: "Finishing, Clean up & Delivery", timeline: "1 Week" }
  ]);

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleNextStep1 = () => {
    const val = step1Schema.safeParse({ amount: Number(amount), timeline, description });
    if (!val.success) {
      const errMap: Record<string, string> = {};
      val.error.issues.forEach((err: any) => {
        if (err.path[0]) errMap[err.path[0] as string] = err.message;
      });
      setErrors(errMap);
      toast.error("Please resolve the errors in Step 1.");
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleNextStep2 = () => {
    // Validate Milestones
    for (let i = 0; i < milestones.length; i++) {
      const val = milestoneSchema.safeParse(milestones[i]);
      if (!val.success) {
        toast.error(`Milestone ${i + 1} has invalid or incomplete fields.`);
        return;
      }
    }

    const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
    const targetAmount = Number(amount);

    if (milestoneSum !== targetAmount) {
      toast.error(`Total milestone amounts (₹${milestoneSum.toLocaleString()}) must sum exactly to the bid amount (₹${targetAmount.toLocaleString()}). Diff: ₹${Math.abs(targetAmount - milestoneSum).toLocaleString()}`);
      return;
    }

    setStep(3);
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", amount: 0, deliverable: "", timeline: "1 Week" }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (index: number, key: string, val: string | number) => {
    setMilestones(milestones.map((m, i) => i === index ? { ...m, [key]: val } : m));
  };

  const handleSubmit = () => {
    const totalAmount = Number(amount);
    createBid.mutate(
      {
        leadId,
        payload: {
          amount: totalAmount,
          timeline,
          description,
          milestones
        }
      },
      {
        onSuccess: () => {
          toast.success("Proposal submitted successfully!");
          onClose();
          // Reset state
          setStep(1);
          setAmount("");
          setTimeline("4 Weeks");
          setDescription("");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to submit proposal.");
        }
      }
    );
  };

  const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
  const isDiff = Number(amount) !== milestoneSum;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="bg-dark-2 border-l border-white/6 text-white w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b border-white/5 bg-dark-3">
          <SheetTitle className="font-industrial text-base font-bold tracking-widest text-white uppercase">
            SUBMIT BID PROPOSAL
          </SheetTitle>
          <SheetDescription className="text-4xs text-neutral-400">
            Bid on Client Lead to secure project milestones.
          </SheetDescription>

          {/* Step Stepper */}
          <div className="flex items-center justify-between pt-4 pb-2 text-4xs font-mono font-bold tracking-wider">
            <div className={cn("flex items-center gap-1.5", step >= 1 ? "text-orange" : "text-neutral-500")}>
              <span className={cn("h-4 w-4 rounded-full flex items-center justify-center border text-[8px]", step > 1 ? "bg-orange text-white border-transparent" : "border-current")}>
                {step > 1 ? <Check className="h-2 w-2" /> : "1"}
              </span>
              <span>SUMMARY</span>
            </div>
            <div className="h-[1px] flex-1 mx-2 bg-neutral-800" />
            <div className={cn("flex items-center gap-1.5", step >= 2 ? "text-orange" : "text-neutral-500")}>
              <span className={cn("h-4 w-4 rounded-full flex items-center justify-center border text-[8px]", step > 2 ? "bg-orange text-white border-transparent" : "border-current")}>
                {step > 2 ? <Check className="h-2 w-2" /> : "2"}
              </span>
              <span>MILESTONES</span>
            </div>
            <div className="h-[1px] flex-1 mx-2 bg-neutral-800" />
            <div className={cn("flex items-center gap-1.5", step >= 3 ? "text-orange" : "text-neutral-500")}>
              <span className="h-4 w-4 rounded-full flex items-center justify-center border border-current text-[8px]">
                3
              </span>
              <span>REVIEW</span>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-4xs font-mono text-neutral-400">
            Estimated Budget: <span className="text-orange font-bold">{leadBudget}</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
                  PROPOSAL BID AMOUNT (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="bg-dark-3 border-white/10 text-white font-mono text-xs focus-visible:ring-orange"
                />
                {errors.amount && <p className="text-red-500 text-5xs font-mono">{errors.amount}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
                  ESTIMATED DURATION
                </label>
                <Input
                  placeholder="e.g. 4 Weeks"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  required
                  className="bg-dark-3 border-white/10 text-white font-mono text-xs focus-visible:ring-orange"
                />
                {errors.timeline && <p className="text-red-500 text-5xs font-mono">{errors.timeline}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-4xs font-industrial font-bold tracking-widest text-neutral-500 uppercase">
                  PROPOSAL MESSAGE
                </label>
                <textarea
                  placeholder="Introduce your team, describe your experience with modular layouts, and explain your timeline constraints..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full rounded-md bg-dark-3 border border-white/10 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange"
                />
                {errors.description && <p className="text-red-500 text-5xs font-mono">{errors.description}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-4xs font-mono text-neutral-400">
                <span>Milestone sum: ₹{milestoneSum.toLocaleString()} / Target: ₹{Number(amount).toLocaleString()}</span>
                {isDiff ? (
                  <span className="text-amber-500 flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> Diff</span>
                ) : (
                  <span className="text-green-400 flex items-center gap-0.5"><Check className="h-3 w-3" /> Ready</span>
                )}
              </div>

              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-dark-3 border border-white/5 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-4xs font-industrial text-neutral-400 uppercase tracking-wider">MILESTONE #{idx+1}</span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-neutral-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Milestone Title"
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                        required
                        className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Amount (₹)"
                          value={m.amount || ""}
                          onChange={(e) => handleUpdateMilestone(idx, "amount", parseFloat(e.target.value) || 0)}
                          required
                          className="bg-dark-2 border-white/5 text-4xs h-7 text-white font-mono"
                        />
                        <Input
                          placeholder="Timeline"
                          value={m.timeline}
                          onChange={(e) => handleUpdateMilestone(idx, "timeline", e.target.value)}
                          required
                          className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                        />
                      </div>
                      <Input
                        placeholder="Deliverable Description"
                        value={m.deliverable}
                        onChange={(e) => handleUpdateMilestone(idx, "deliverable", e.target.value)}
                        required
                        className="bg-dark-2 border-white/5 text-4xs h-7 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleAddMilestone}
                variant="ghost"
                className="w-full border border-dashed border-white/10 hover:border-orange/30 text-white font-industrial font-bold uppercase tracking-wider text-xs py-5"
              >
                <Plus className="h-4 w-4 mr-1 text-orange" /> Add Escrow Milestone
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-3xs font-body text-neutral-300">
              <div className="p-4 rounded-lg bg-dark-3 border border-white/5 space-y-3">
                <h4 className="font-industrial text-4xs font-bold tracking-widest text-neutral-500 uppercase">PROPOSAL SUMMARY</h4>
                <div className="grid grid-cols-2 gap-2 text-4xs font-mono">
                  <div>
                    <span className="text-neutral-500 block">TOTAL BID AMOUNT</span>
                    <span className="text-orange text-xs font-bold">₹{Number(amount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">PROPOSED TIMELINE</span>
                    <span className="text-white text-xs font-bold">{timeline}</span>
                  </div>
                </div>
                <div className="space-y-1 border-t border-white/5 pt-2">
                  <span className="text-neutral-500 font-mono text-4xs">PROPOSAL COVER LETTER</span>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-industrial text-4xs font-bold tracking-widest text-neutral-500 uppercase border-b border-white/5 pb-1">ESCROW MILESTONES</h4>
                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-3 bg-dark-3 rounded border border-white/5 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-white font-semibold block text-4xs">{m.title}</span>
                        <span className="text-neutral-500 block leading-normal text-5xs">{m.deliverable} ({m.timeline})</span>
                      </div>
                      <span className="font-mono text-orange font-bold text-4xs">₹{m.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-6 border-t border-white/5 bg-dark-3 flex flex-row justify-between items-center gap-3 mt-auto">
          {step === 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 font-industrial uppercase text-xs"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step === 3 ? 2 : 1)}
              className="border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 font-industrial uppercase text-xs flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={step === 1 ? handleNextStep1 : handleNextStep2}
              className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-6 flex items-center gap-1 ml-auto"
            >
              Next <ArrowRight className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createBid.isPending}
              className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-6 ml-auto"
            >
              {createBid.isPending ? "Submitting..." : "Submit Proposal"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BidComposer;
