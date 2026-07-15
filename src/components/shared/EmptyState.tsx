import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export interface EmptyStateProps {
  /** The icon representation (e.g. search, file, folder, alert) */
  icon: React.ReactNode
  /** Main message text (e.g. "No Projects Found") */
  title: string
  /** Detail paragraph explaining why the list is empty */
  description: string
  /** Optional call-to-action button properties */
  action?: {
    label: string
    onClick: () => void
  }
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * EmptyState renders a visual indicator for blank states or empty searches.
 * It centers the contents and displays a themed icon area, header,
 * description, and an optional action trigger.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-border/80 bg-muted/10 max-w-md mx-auto my-4",
        className
      )}
    >
      {/* Subtle Illustration Icon Container */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-warm dark:bg-dark-3 text-orange mb-4 shadow-sm border border-border/30">
        <div className="h-8 w-8 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground tracking-wide font-normal mb-6 max-w-xs leading-relaxed">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant="default"
          size="sm"
          className="shadow-sm font-medium transition-transform active:scale-95 bg-orange text-white hover:bg-orange/90"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
