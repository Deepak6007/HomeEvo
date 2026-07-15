"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { projectsApi } from "@/lib/api/projects"
import { ActivityFeed, Activity } from "@/components/shared/ActivityFeed"

export const ActivityFeedSection: React.FC = () => {
  const { data: projectsRes } = useSuspenseQuery({
    queryKey: queryKeys.projects.list({ status: "active" }),
    queryFn: () => projectsApi.list({ status: "active" }),
  })

  const projects = projectsRes.data || []

  // Combine actual milestones into activity events
  const activities = React.useMemo(() => {
    const list: Activity[] = []

    projects.forEach((project) => {
      if (!project.milestones) return

      project.milestones.forEach((milestone) => {
        if (milestone.status === "released") {
          list.push({
            id: `release-${project.id}-${milestone.id}`,
            type: "payment",
            description: `Escrow released: ₹${(milestone.amount / 100000).toFixed(2)}L for milestone "${milestone.title}" on project "${project.title}".`,
            timestamp: milestone.approvedAt || project.startDate || new Date().toISOString(),
            color: "bg-green-500",
          })
          list.push({
            id: `approve-${project.id}-${milestone.id}`,
            type: "milestone",
            description: `Milestone "${milestone.title}" was approved by you on project "${project.title}".`,
            timestamp: milestone.approvedAt || project.startDate || new Date().toISOString(),
            color: "bg-blue-500",
          })
        } else if (milestone.status === "pending") {
          list.push({
            id: `pending-${project.id}-${milestone.id}`,
            type: "milestone",
            description: `Milestone "${milestone.title}" on project "${project.title}" was submitted for your approval.`,
            timestamp: project.startDate || new Date().toISOString(),
            color: "bg-amber-500",
          })
        } else if (milestone.status === "in_progress") {
          list.push({
            id: `start-${project.id}-${milestone.id}`,
            type: "project",
            description: `Work started on milestone "${milestone.title}" for project "${project.title}".`,
            timestamp: project.startDate || new Date().toISOString(),
            color: "bg-orange",
          })
        }
      })
    })

    // Standard static system activities if list is short
    if (list.length < 5) {
      list.push({
        id: "sys-welcome",
        type: "project",
        description: "Welcome to HomeEvo! Your profile setup is complete and secure escrow is active 🌿.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        color: "bg-orange",
      })
      list.push({
        id: "sys-kyc",
        type: "alert",
        description: "KYC profile validation verified successfully by HomeEvo compliance team.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
        color: "bg-green-500",
      })
    }

    // Sort descending by timestamp, take up to 8
    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
  }, [projects])

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs h-full">
      <h3 className="font-serif text-lg font-bold text-[#3D2B1F] mb-6">Recent Activity</h3>
      <div className="max-h-[380px] overflow-y-auto pr-2">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}

export default ActivityFeedSection
