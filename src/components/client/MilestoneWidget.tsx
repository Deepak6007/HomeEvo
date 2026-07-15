"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { projectsApi } from "@/lib/api/projects"
import { MilestoneTimeline } from "@/components/shared/MilestoneTimeline"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calendar } from "lucide-react"

export const MilestoneWidget: React.FC = () => {
  const { data: projectsRes } = useSuspenseQuery({
    queryKey: queryKeys.projects.list({ status: "active" }),
    queryFn: () => projectsApi.list({ status: "active" }),
  })

  const projects = projectsRes.data || []

  // Extract, filter, and sort milestones
  const upcomingMilestones = React.useMemo(() => {
    const list: any[] = []

    projects.forEach((project) => {
      if (!project.milestones) return

      project.milestones.forEach((milestone) => {
        // Exclude already completed/released milestones
        if (milestone.status === "released") return

        list.push({
          id: `${project.id}-${milestone.id}`,
          title: `${project.title} &middot; ${milestone.title}`,
          status: milestone.status,
          amount: milestone.amount,
          date: milestone.dueDate,
        })
      })
    })

    // Sort by due date ascending
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3)
  }, [projects])

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs h-full">
      <h3 className="font-serif text-lg font-bold text-[#3D2B1F] mb-6">Upcoming Milestones</h3>

      {upcomingMilestones.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-[#E85D04]" />}
          title="No Upcoming Milestones"
          description="There are no pending or upcoming milestones across your active projects."
        />
      ) : (
        <div className="pr-2">
          <MilestoneTimeline milestones={upcomingMilestones} />
        </div>
      )}
    </div>
  )
}

export default MilestoneWidget
