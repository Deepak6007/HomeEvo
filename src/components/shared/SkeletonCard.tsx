import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"

export interface SkeletonCardProps {
  /** The number of description lines to render (default is 3) */
  lines?: number
  /** Optional custom height for the main content skeleton block */
  height?: string
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * SkeletonCard renders a placeholder layout representing content cards.
 * It animates with a pulse effect to show that data fetching is active.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  height,
  className,
}) => {
  const textLines = Array.from({ length: lines })

  return (
    <Card className={cn("overflow-hidden border border-border shadow-xs", className)}>
      <CardContent className="p-6 space-y-4">
        {/* Header Skeleton Block */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>

        {/* Optional Main Block */}
        {height && (
          <Skeleton
            className="w-full rounded-md"
            style={{ height }}
          />
        )}

        {/* Detail Lines Skeletons */}
        <div className="space-y-2.5 pt-2">
          {textLines.map((_, idx) => {
            // Vary widths for realistic text line behavior
            let width = "w-full"
            if (idx === textLines.length - 1) {
              width = "w-2/3"
            } else if (idx === 1) {
              width = "w-5/6"
            }

            return (
              <Skeleton
                key={idx}
                className={cn("h-3", width)}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
