"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorPaymentsApi } from "@/lib/api/vendorPayments";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { queryKeys } from "@/hooks/queryKeys";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const MilestonePaymentsCard: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.escrow.history(),
    queryFn: () => vendorPaymentsApi.getHistory(),
  });

  const payments = response?.data ?? [
    // Mock fallbacks if api cart is empty
    { id: "pay_1", amount: 15000, type: "milestone", status: "released", projectId: "proj_101", milestoneId: "ms_1", milestoneName: "Initial Mobilization", projectName: "Luxury Modular Kitchen", createdAt: "2026-05-10T12:00:00Z" },
    { id: "pay_2", amount: 25000, type: "milestone", status: "pending", projectId: "proj_101", milestoneId: "ms_2", milestoneName: "Core Carpentry Assembly", projectName: "Luxury Modular Kitchen", createdAt: "2026-05-28T09:00:00Z" },
    { id: "pay_3", amount: 10000, type: "milestone", status: "upcoming", projectId: "proj_101", milestoneId: "ms_3", milestoneName: "Countertop Integration", projectName: "Luxury Modular Kitchen", createdAt: "2026-06-15T00:00:00Z" },
    { id: "pay_4", amount: 45000, type: "milestone", status: "pending", projectId: "proj_102", milestoneId: "ms_4", milestoneName: "Wall Plastering Stage 1", projectName: "Guntur Residential Construction", createdAt: "2026-05-30T16:30:00Z" }
  ];

  const releaseMutation = useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      vendorProjectsApi.requestMilestoneRelease(projectId, milestoneId),
    onSuccess: () => {
      toast.success("Milestone release request submitted to client.");
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProjects.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit release request.");
    }
  });

  const handleRequestRelease = (projectId: string, milestoneId: string) => {
    if (!milestoneId) return;
    releaseMutation.mutate({ projectId, milestoneId });
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toLowerCase();
    if (s === "released" || s === "paid" || s === "success") {
      return {
        label: "Released",
        dotClass: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]",
        textClass: "text-green-400"
      };
    }
    if (s === "pending" || s === "requested" || s === "processing") {
      return {
        label: "Awaiting Release",
        dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse",
        textClass: "text-amber-400"
      };
    }
    return {
      label: "Upcoming",
      dotClass: "bg-neutral-500",
      textClass: "text-neutral-500"
    };
  };

  if (isLoading) {
    return <PaymentsCardSkeleton />;
  }

  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <h3 className="font-industrial text-base font-bold tracking-widest text-white uppercase flex items-center gap-2">
          <CreditCard className="h-4.5 w-4.5 text-orange" />
          <span>MILESTONE ESCROW PAYMENTS</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5 font-industrial text-4xs tracking-widest text-neutral-500 font-bold uppercase">
              <th className="pb-3 pl-2">Milestone Name</th>
              <th className="pb-3">Project</th>
              <th className="pb-3">Due Date</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-3xs font-body text-neutral-300">
            {payments.map((payment: any, index: number) => {
              const statusDisplay = getStatusDisplay(payment.status);
              const formattedDate = new Date(payment.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <tr key={payment.id || index} className="hover:bg-white/2 transition-colors">
                  {/* Milestone Name with Status Dot */}
                  <td className="py-4 pl-2 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDisplay.dotClass)} />
                      <span>{payment.milestoneName || `Milestone ${index + 1}`}</span>
                    </div>
                  </td>
                  {/* Project */}
                  <td className="py-4 font-medium text-neutral-400">
                    {payment.projectName || "Contract Work"}
                  </td>
                  {/* Date */}
                  <td className="py-4 text-neutral-400">
                    {formattedDate}
                  </td>
                  {/* Amount */}
                  <td className="py-4 text-right font-mono font-bold text-orange text-2xs">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                  {/* Action */}
                  <td className="py-4 text-right pr-2">
                    {payment.status === "pending" ? (
                      <Button
                        size="xs"
                        onClick={() => handleRequestRelease(payment.projectId, payment.milestoneId)}
                        disabled={releaseMutation.isPending}
                        className="bg-orange/10 hover:bg-orange hover:text-white border border-orange/20 text-orange font-industrial font-bold uppercase tracking-wider text-4xs rounded px-2.5 py-1.5 h-auto transition-all duration-300"
                      >
                        <Send className="h-2.5 w-2.5 shrink-0 mr-1" />
                        Request Release
                      </Button>
                    ) : (
                      <span className={cn("text-4xs font-mono font-bold tracking-wider uppercase", statusDisplay.textClass)}>
                        {statusDisplay.label}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PaymentsCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 animate-pulse">
      <div className="h-4 w-40 bg-white/10 rounded pb-4" />
      <div className="space-y-4 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded border border-white/5" />
        ))}
      </div>
    </div>
  );
};

export default MilestonePaymentsCard;
