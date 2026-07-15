import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export interface ErrorBoundaryProps {
  /** The child components wrapped by this error boundary */
  children: React.ReactNode
  /** Optional custom UI to render when an error occurs */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary catches React rendering errors in its child tree.
 * It logs the error and displays a recovery fallback interface instead of crashing the site.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error details to console (or log service)
    console.error("ErrorBoundary caught an exception:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error || new Error("Unknown rendering error")
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return (this.props.fallback as Function)(error, this.handleReset)
        }
        return this.props.fallback as React.ReactNode
      }

      // Default premium fallback layout
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-red-500/10 bg-red-500/5 my-4 text-center max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          
          <h3 className="text-base font-semibold text-foreground tracking-tight mb-2">
            Something went wrong
          </h3>
          
          <p className="text-sm text-muted-foreground tracking-wide font-normal mb-5 leading-relaxed">
            An unexpected error occurred while rendering this component.
          </p>

          <Button
            onClick={this.handleReset}
            variant="outline"
            size="sm"
            className="border-red-500/20 text-red-600 hover:bg-red-500/5 transition-transform active:scale-95 hover:text-red-700"
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
