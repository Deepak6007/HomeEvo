"use client";

import * as React from "react";
import Link from "next/link";
import { useVendorProjects } from "@/hooks/vendor/projects";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const ActiveProjectsPanel: React.FC = () => {
  const { data: response, isLoading } = useVendorProjects({ status: "active" });

  const projects = response?.data ?? [];

  // Emojis mapping by category
  const getCategoryEmoji = (category?: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("modular") || cat.includes("kitchen")) return "🍳";
    if (cat.includes("paint")) return "🎨";
    if (cat.includes("electric")) return "⚡";
    if (cat.includes("plumb")) return "🚰";
    if (cat.includes("mason") || cat.includes("cement") || cat.includes("construct")) return "🧱";
    if (cat.includes("carpentry") || cat.includes("wood")) return "🪵";
    return "🏗️";
  };

  if (isLoading) {
    return <ProjectsPanelSkeleton />;
  }

  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="font-industrial text-base font-bold tracking-widest text-white uppercase">
          ACTIVE PROJECTS
        </h3>
        <Link 
          href="/vendor/projects" 
          className="font-industrial text-2xs font-bold text-orange hover:text-orange/80 uppercase tracking-widest flex items-center gap-1.5 transition-all"
        >
          View All <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-dark-2">
          <p className="text-sm text-neutral-400">No active projects at the moment.</p>
          <Link href="/vendor/leads" className="text-xs text-orange font-industrial font-bold uppercase tracking-wider mt-2 inline-block hover:underline">
            Browse leads to bid →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {projects.map((project) => {
            const totalMilestones = project.milestones?.length ?? 4;
            const completedMilestones = project.milestones?.filter(
              (m) => m.status === "released"
            ).length ?? 1;
            const progressPercentage = totalMilestones > 0 
              ? Math.round((completedMilestones / totalMilestones) * 100) 
              : 0;

            // Mock status mapping for dashboard demo
            const statusMap: Record<string, { label: string; variant: string; textClass: string; bgClass: string }> = {
              active: { label: "ON TRACK", variant: "outline", textClass: "text-green-400 border-green-500/30", bgClass: "bg-green-500/5" },
              delayed: { label: "DELAYED", variant: "outline", textClass: "text-amber-500 border-amber-500/30", bgClass: "bg-amber-500/5" },
              completed: { label: "COMPLETED", variant: "outline", textClass: "text-blue-400 border-blue-500/30", bgClass: "bg-blue-500/5" }
            };
            
            const projectStatus = (project.status === "delayed" || project.status === "completed" || project.status === "active") 
              ? project.status 
              : "active";
            const displayStatus = statusMap[projectStatus];

            return (
              <div 
                key={project.id} 
                className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Left: Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                      {getCategoryEmoji(project.category)}
                    </span>
                    <div>
                      <h4 className="font-body text-xs md:text-sm font-semibold text-white group-hover:text-orange transition-colors">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-3xs text-neutral-400 font-body">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{project.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-3xs text-neutral-400 font-body">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span>Client: {project.clientId.replace("client_", "User ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Started: {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : "01/06/2026"}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Progress */}
                <div className="flex-1 max-w-xs space-y-1.5">
                  <div className="flex justify-between items-center text-3xs font-mono text-neutral-400">
                    <span>PROGRESS ({completedMilestones}/{totalMilestones} MILESTONES)</span>
                    <span className="text-white font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>

                {/* Right: Price & Status */}
                <div className="flex md:flex-col justify-between md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2.5 py-1 rounded border text-3xs font-mono font-bold tracking-wider",
                      displayStatus.bgClass,
                      displayStatus.textClass
                    )}>
                      {displayStatus.label}
                    </div>
                    <span className="font-mono text-xs md:text-sm font-bold text-orange">
                      ₹{project.budget.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Link 
                    href={`/vendor/projects/${project.id}`}
                    className="font-industrial text-3xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-all"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProjectsPanelSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-3.5 w-16 bg-white/10 rounded" />
      </div>
      <div className="space-y-6 pt-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-3 w-32 bg-white/10 rounded" />
            </div>
            <div className="h-6 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveProjectsPanel;
