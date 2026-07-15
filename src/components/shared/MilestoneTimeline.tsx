import * as React from "react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import { CheckCircle2, AlertCircle, HelpCircle, RefreshCw } from "lucide-react"

export interface Milestone {
  id: string | number
  title: string
  status: "released" | "pending" | "upcoming" | "in_progress"
  amount: number
  date: string | Date
}

export interface MilestoneTimelineProps {
  /** List of project milestones to display on the timeline */
  milestones: Milestone[]
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * MilestoneTimeline renders a vertical progress timeline.
 * It visualizes completion progress, highlighting released, pending,
 * upcoming, and active/in_progress project milestones.
 */
export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  className,
}) => {
  if (!milestones || milestones.length === 0) {
    return null
  }

  return (
    <div className={cn("relative pl-6 border-l border-border space-y-8 py-2 ml-3", className)}>
      {milestones.map((milestone, idx) => {
        const isLast = idx === milestones.length - 1
        
        // Status configuration: dot colors, icons, and titles
        let dotClass = ""
        let textClass = ""
        let statusLabel = ""
        let StatusIcon = HelpCircle

        switch (milestone.status) {
          case "released":
            dotClass = "bg-green-500 ring-4 ring-green-500/10 text-white"
            textClass = "text-green-700 dark:text-green-400"
            statusLabel = "Released"
            StatusIcon = CheckCircle2
            break
          case "pending":
            dotClass = "bg-amber-500 ring-4 ring-amber-500/10 text-white"
            textClass = "text-amber-700 dark:text-amber-400"
            statusLabel = "Pending Approval"
            StatusIcon = AlertCircle
            break
          case "in_progress":
            dotClass = "bg-orange ring-4 ring-orange/20 text-white animate-pulse"
            textClass = "text-orange font-semibold"
            statusLabel = "In Progress"
            StatusIcon = RefreshCw
            break
          case "upcoming":
          default:
            dotClass = "bg-muted-foreground/30 ring-4 ring-muted-foreground/5 text-muted-foreground"
            textClass = "text-muted-foreground"
            statusLabel = "Upcoming"
            StatusIcon = HelpCircle
            break
        }

        return (
          <div key={milestone.id} className="relative group">
            {/* Timeline indicator node */}
            <span
              className={cn(
                "absolute -left-9 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shadow-xs transition-transform duration-300 group-hover:scale-110",
                dotClass
              )}
            >
              {milestone.status === "in_progress" ? (
                <StatusIcon className="h-3 w-3 animate-spin" />
              ) : (
                <StatusIcon className="h-3.5 w-3.5" />
              )}
            </span>

            {/* Content card */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-card border border-border/60 rounded-lg p-4 transition-all hover:border-border/100 hover:shadow-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground tracking-tight">
                  {milestone.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-muted/40", textClass)}>
                    {statusLabel}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Target: {formatDate(milestone.date)}
                  </span>
                </div>
              </div>
              
              <div className="text-left sm:text-right shrink-0">
                <span className="text-sm font-semibold text-foreground block">
                  {formatCurrency(milestone.amount)}
                </span>
                <span className="text-2xs text-muted-foreground font-normal block">
                  Milestone Escrow Value
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
