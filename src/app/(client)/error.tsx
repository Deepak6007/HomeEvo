"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import * as Sentry from "@sentry/nextjs"

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Client Workspace Error:", error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5 font-body p-6 text-center text-[#3D2B1F]">
      <div className="text-4xl">⚠️</div>
      <div className="space-y-2 max-w-md">
        <h3 className="font-serif text-lg font-bold text-[#3D2B1F]">Workspace Connection Interrupted</h3>
        <p className="text-xs text-[#6F5B4B] leading-relaxed">
          {error.message || "An unexpected error occurred while loading your project space."}
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 px-6 rounded-lg active:scale-95 transition-all shadow-xs"
      >
        Retry Connection
      </Button>
    </div>
  )
}
