"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import * as Sentry from "@sentry/nextjs"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Admin System Error:", error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5 font-mono p-6 text-center text-slate-100 bg-slate-950">
      <div className="text-blue-500 text-3xl">⚙️</div>
      <div className="space-y-2 max-w-md font-sans">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">ADMIN SERVICES EXCEPTION</h3>
        <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
          {error.message || "An administrative process thread crashed or timed out."}
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase tracking-wider text-xs py-2 px-6 rounded"
      >
        RE-EXECUTE SYSTEM
      </Button>
    </div>
  )
}
