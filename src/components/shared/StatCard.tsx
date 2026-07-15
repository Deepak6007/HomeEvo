import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface StatCardProps {
  /** The descriptive label/title of the statistic (e.g. "Total Revenue") */
  label: string
  /** The main stat value (e.g. "₹4,20,000" or 24) */
  value: string | number
  /** Optional change indicators, showing progress over a period */
  change?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  /** An optional icon element to display inside the card */
  icon?: React.ReactNode
  /** Color theme variant for highlighting the card styling */
  variant?: "orange" | "green" | "amber" | "blue"
  /** Renders a pulse skeleton when set to true */
  isLoading?: boolean
  /** Additional wrapper CSS classes */
  className?: string
}

const variantStyles = {
  orange: {
    border: "border-orange/20 hover:border-orange/40",
    iconContainer: "bg-orange/10 text-orange",
    glow: "hover:shadow-orange/5",
  },
  green: {
    border: "border-green-500/20 hover:border-green-500/40",
    iconContainer: "bg-green-500/10 text-green-600 dark:text-green-400",
    glow: "hover:shadow-green-500/5",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/40",
    iconContainer: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-amber-500/5",
  },
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconContainer: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    glow: "hover:shadow-blue-500/5",
  },
}

/**
 * StatCard displays key performance metrics or counts.
 * It includes an icon container, custom theme colors, animated hover transitions,
 * and a change trajectory indicator.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  variant = "orange",
  isLoading = false,
  className,
}) => {
  const styles = variantStyles[variant]

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden border border-border shadow-xs", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 w-2/3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border bg-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.border,
        styles.glow,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground tracking-wide block">
              {label}
            </span>
            <span className="text-2xl font-semibold tracking-tight text-foreground block">
              {value}
            </span>
          </div>
          {icon && (
            <div className={cn("p-2.5 rounded-lg flex items-center justify-center shadow-2xs", styles.iconContainer)}>
              {icon}
            </div>
          )}
        </div>

        {change && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
            {change.direction === "up" && (
              <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-sm">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {change.value}
              </span>
            )}
            {change.direction === "down" && (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-sm">
                <ArrowDownRight className="h-3.5 w-3.5" />
                {change.value}
              </span>
            )}
            {change.direction === "neutral" && (
              <span className="flex items-center gap-0.5 text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                <Minus className="h-3.5 w-3.5" />
                {change.value}
              </span>
            )}
            <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
