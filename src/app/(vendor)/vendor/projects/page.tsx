"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Hammer, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  Camera, 
  FileText, 
  ArrowUpRight, 
  Plus, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedProjectIdForUpload, setSelectedProjectIdForUpload] = React.useState<string | null>(null);

  // Milestone release modal state
  const [releaseModalOpen, setReleaseModalOpen] = React.useState(false);
  const [releaseParams, setReleaseParams] = React.useState<{ projectId: string; milestoneId: string; title: string } | null>(null);

  // Query Hook
  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.vendorProjects.list({ status: "active" }),
    queryFn: () => vendorProjectsApi.list({ status: "active" }),
  });

  const projects = response?.data ?? [
    // Fallback Mock Projects
    { id: "proj_101", title: "Luxury Villa Painting & Finishing", clientName: "A. Reddy", location: "Visakhapatnam, AP", budget: 275000, category: "Painting", startDate: "2026-05-26T00:00:00Z", status: "active", sitePhotos: [], milestones: [
      { id: "ms_1", title: "Surface Preparation", status: "released", amount: 80000, dueDate: "2026-06-02" },
      { id: "ms_2", title: "Core Painting", status: "pending", amount: 120000, dueDate: "2026-06-10" },
      { id: "ms_3", title: "Inspection & Touchups", status: "upcoming", amount: 75000, dueDate: "2026-06-17" }
    ]}
  ];

  // Milestone Release Mutation
  const releaseMutation = useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      vendorProjectsApi.requestMilestoneRelease(projectId, milestoneId),
    onSuccess: () => {
      toast.success("Release request sent to the client.");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
      setReleaseModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to request release.");
    }
  });

  // Photo Upload Mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      vendorProjectsApi.uploadSitePhoto(projectId, file),
    onSuccess: () => {
      toast.success("Progress site photo uploaded to Cloudinary!");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProjects.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload progress photo.");
    }
  });

  const handleRequestReleaseTrigger = (projectId: string, milestoneId: string, title: string) => {
    setReleaseParams({ projectId, milestoneId, title });
    setReleaseModalOpen(true);
  };

  const handleConfirmRelease = () => {
    if (!releaseParams) return;
    releaseMutation.mutate({
      projectId: releaseParams.projectId,
      milestoneId: releaseParams.milestoneId
    });
  };

  const handleTriggerUpload = (projectId: string) => {
    setSelectedProjectIdForUpload(projectId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectIdForUpload) return;
    
    uploadPhotoMutation.mutate({
      projectId: selectedProjectIdForUpload,
      file
    });
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
              ACTIVE ESCROW CONTRACTS
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Manage active project milestones, upload progress photos, and request client fund releases.
            </p>
          </div>
        </div>

        {/* File input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Projects List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-36 bg-white/5 rounded-xl border border-white/5" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-dark-3">
            <Hammer className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No active contracts found. Win bids to get started.</p>
            <Link href="/vendor/leads" className="text-xs text-orange font-industrial font-bold uppercase tracking-wider mt-2 inline-block hover:underline">
              Browse matching leads &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project: any) => {
              const totalMilestones = project.milestones?.length ?? 0;
              const completedMilestones = project.milestones?.filter((m: any) => m.status === "released").length ?? 0;
              const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div 
                  key={project.id}
                  className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-6 shadow-md hover:border-white/10 transition-all duration-300 group"
                >
                  {/* Top Details */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-white/5 rounded select-none">🏡</span>
                        <div>
                          <h3 className="font-body text-xs md:text-sm font-bold text-white group-hover:text-orange transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-4xs text-neutral-400 font-body">
                            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                            <span>{project.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-4xs text-neutral-400 font-body">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Client: {project.clientName || "Property Owner"}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Started: {new Date(project.startDate).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center md:items-end justify-between md:justify-end gap-5 shrink-0">
                      <div className="space-y-0.5 md:text-right">
                        <span className="text-5xs font-mono text-neutral-500 block uppercase tracking-wider">CONTRACT VALUE</span>
                        <span className="font-mono text-sm md:text-base font-black text-orange block">
                          ₹{project.budget.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        href={`/vendor/projects/${project.id}`}
                        className="font-industrial text-3xs font-black uppercase tracking-wider bg-white/5 hover:bg-orange text-white border border-white/10 hover:border-transparent px-3.5 py-2 rounded-md transition-all flex items-center gap-1 h-9"
                      >
                        Project details <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Milestones Horizontal Row */}
                  <div className="space-y-3">
                    <h4 className="font-industrial text-4xs font-bold tracking-widest text-neutral-500 uppercase">CONTRACT MILESTONES</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {project.milestones?.map((m: any, idx: number) => {
                        const statusColors: Record<string, string> = {
                          released: "bg-green-500/10 text-green-400 border-green-500/20",
                          pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
                          upcoming: "bg-white/5 text-neutral-400 border-white/5"
                        };

                        return (
                          <div key={m.id} className="p-3 bg-dark-2 border border-white/4 rounded-lg flex flex-col justify-between min-h-[110px] space-y-3 hover:border-orange/20 transition-all duration-300">
                            <div className="space-y-1">
                              <span className="text-5xs font-mono text-neutral-500 block">PHASE {idx+1}</span>
                              <span className="text-4xs font-semibold text-white block">{m.title}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-4xs font-bold text-orange">₹{m.amount.toLocaleString()}</span>
                              
                              {m.status === "pending" ? (
                                <Button
                                  size="xs"
                                  onClick={() => handleRequestReleaseTrigger(project.id, m.id, m.title)}
                                  className="bg-orange/10 hover:bg-orange hover:text-white border border-orange/20 text-orange font-industrial font-bold uppercase tracking-wider text-[8px] px-2 py-1 h-auto"
                                >
                                  Request Release
                                </Button>
                              ) : (
                                <span className={cn("px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold tracking-wider", statusColors[m.status])}>
                                  {m.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom: Progress and Upload Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <div className="flex-1 max-w-xs space-y-1">
                      <div className="flex justify-between items-center text-5xs font-mono text-neutral-500">
                        <span>CONTRACT PROGRESS</span>
                        <span className="text-white font-bold">{progressPct}%</span>
                      </div>
                      {/* Standard div progress bar */}
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange transition-all duration-300" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleTriggerUpload(project.id)}
                      disabled={uploadPhotoMutation.isPending}
                      className="border border-white/5 hover:border-orange/30 text-white hover:bg-white/5 font-industrial font-bold uppercase tracking-wider text-3xs flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <Camera className="h-4 w-4 text-orange" />
                      {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Site Progress Photo"}
                    </Button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Global Milestone Release Confirmation Dialog */}
        <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
          <DialogContent className="bg-dark-2 border border-white/10 text-white max-w-sm">
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-industrial text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                <HelpCircle className="h-5 w-5 text-orange" /> Confirm Release Request
              </DialogTitle>
              <div className="text-3xs text-neutral-400 font-body leading-relaxed">
                You are requesting release of milestone funds for <span className="text-white font-semibold">"{releaseParams?.title}"</span>. 
                The client will be notified to review the site photos and release the escrow balance.
              </div>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                variant="ghost"
                onClick={() => setReleaseModalOpen(false)}
                className="border border-white/5 text-neutral-400 hover:text-white font-industrial uppercase text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRelease}
                disabled={releaseMutation.isPending}
                className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-5"
              >
                {releaseMutation.isPending ? "Submitting..." : "Send Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardShell>
  );
}
