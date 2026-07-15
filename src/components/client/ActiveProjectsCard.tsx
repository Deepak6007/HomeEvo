"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { projectsApi } from "@/lib/api/projects"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, ChevronRight, MapPin, User } from "lucide-react"
import Link from "next/link"

export const ActiveProjectsCard: React.FC = () => {
  const { data: projectsRes } = useSuspenseQuery({
    queryKey: queryKeys.projects.list({ status: "active" }),
    queryFn: () => projectsApi.list({ status: "active" }),
  })

  const projects = projectsRes.data || []

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#3D2B1F] mb-4">Active Projects</h3>
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-[#E85D04]" />}
          title="No Active Projects"
          description="Start a new home construction or renovation project and connect with local pros."
          action={{
            label: "Create a Project",
            onClick: () => {
              window.location.href = "/client/projects?new=true"
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">Active Projects</h3>
        <span className="text-xs font-semibold text-[#E85D04] bg-[#E85D04]/10 px-2.5 py-1 rounded-full">
          {projects.length} Running
        </span>
      </div>

      <div className="space-y-6">
        {projects.map((project) => {
          // Calculate progress percentage
          const totalMilestones = project.milestones?.length || 0
          const completedMilestones =
            project.milestones?.filter((m) => m.status === "released").length || 0
          const progressPercent =
            totalMilestones > 0
              ? Math.round((completedMilestones / totalMilestones) * 100)
              : 0

          // Resolve mock contractor name or fallback
          const contractorName = project.vendorId ? "Sri Sai Builders" : "Awaiting Contractor"

          return (
            <div
              key={project.id}
              className="group border border-border/50 rounded-xl p-4 hover:border-[#E85D04]/30 hover:shadow-2xs transition-all duration-300 bg-[#FDF8F2]/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-semibold text-[#3D2B1F] tracking-tight group-hover:text-[#E85D04] transition-colors">
                      {project.title}
                    </h4>
                    <Badge variant="secondary" className="bg-[#E85D04]/10 text-[#E85D04] border-0 text-3xs font-semibold px-2 py-0">
                      {project.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#6F5B4B] flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {contractorName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <Link href={`/client/projects/${project.id}`} passHref legacyBehavior>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#E85D04] hover:text-[#D45203] hover:bg-[#E85D04]/5 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-2xs text-[#6F5B4B] font-medium">
                  <span>Milestone Progress</span>
                  <span>
                    {completedMilestones}/{totalMilestones} Completed ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-border/60 overflow-hidden flex">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="bg-[#E85D04] h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ActiveProjectsCard
