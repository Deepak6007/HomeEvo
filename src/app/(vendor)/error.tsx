"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import * as Sentry from "@sentry/nextjs"

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Vendor Workspace Error:", error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5 font-mono p-6 text-center text-white bg-slate-950">
      <div className="text-red-500 text-3xl">⚠️</div>
      <div className="space-y-2 max-w-md font-industrial">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">WORKSPACE OPERATIONAL FAILURE</h3>
        <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
          {error.message || "The contractor telemetry interface experienced a connection issue."}
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs py-2 px-6 rounded"
      >
        RESTART MODULE
      </Button>
    </div>
  )
}
