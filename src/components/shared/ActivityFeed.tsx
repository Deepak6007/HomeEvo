import * as React from "react"
import { formatRelativeTime } from "@/lib/utils/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"

export interface Activity {
  id: string | number
  /** The categorization of the activity (e.g. "payment", "milestone", "bid") */
  type: string
  /** Text description of what occurred */
  description: string
  /** Timestamp when the event happened */
  timestamp: string | Date
  /** Optional custom CSS dot/border color (e.g., "bg-green-500", "bg-orange") */
  color?: string
}

export interface ActivityFeedProps {
  /** The array of activity items to list */
  activities: Activity[]
  /** Toggles the loading skeleton view */
  isLoading?: boolean
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * ActivityFeed lists recent actions or notifications in chronological order.
 * Items are bulleted with left-border dots mapping to status tags or custom colors.
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-6 relative pl-5 border-l border-border/60 ml-2 py-1", className)}>
        {[1, 2, 3].map((key) => (
          <div key={key} className="space-y-2 relative">
            <span className="absolute -left-7 top-1.5 h-3.5 w-3.5 rounded-full bg-border border-2 border-background animate-pulse" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No recent activity to show.
      </div>
    )
  }

  return (
    <div className={cn("relative pl-5 border-l border-border/80 ml-2 py-1 space-y-6", className)}>
      {activities.map((activity) => {
        // Fallback color mapping based on activity type if no explicit color is set
        let dotColor = "bg-muted-foreground/30"
        if (activity.color) {
          dotColor = activity.color
        } else {
          switch (activity.type.toLowerCase()) {
            case "payment":
            case "escrow":
              dotColor = "bg-green-500"
              break
            case "milestone":
            case "project":
              dotColor = "bg-orange"
              break
            case "bid":
            case "lead":
              dotColor = "bg-blue-500"
              break
            case "alert":
            case "warning":
              dotColor = "bg-amber-500"
              break
          }
        }

        return (
          <div key={activity.id} className="relative group space-y-1">
            {/* Interactive side dot indicator */}
            <span
              className={cn(
                "absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background shadow-2xs transition-transform duration-300 group-hover:scale-125",
                dotColor
              )}
            />
            
            <p className="text-sm font-normal leading-relaxed text-foreground tracking-wide">
              {activity.description}
            </p>
            <span className="text-xs text-muted-foreground tracking-wide font-normal block">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
