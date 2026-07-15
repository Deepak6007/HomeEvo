"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import * as Sentry from "@sentry/nextjs"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Public Portal Error:", error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 font-body p-6 text-center text-[#3D2B1F]">
      <div className="text-5xl">⚠️</div>
      <div className="space-y-3 max-w-md">
        <h3 className="font-serif text-xl font-bold text-[#3D2B1F]">Something went wrong</h3>
        <p className="text-sm text-[#6F5B4B] leading-relaxed">
          {error.message || "We encountered an error loading this page. Please try refreshing or return home."}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-sm py-2.5 px-6 rounded-lg active:scale-95 transition-all shadow-xs"
        >
          Try Again
        </Button>
        <Button
          onClick={() => window.location.href = "/"}
          variant="outline"
          className="border-[#6F5B4B] text-[#6F5B4B] hover:bg-stone-100 font-semibold text-sm py-2.5 px-6 rounded-lg active:scale-95 transition-all"
        >
          Go Home
        </Button>
      </div>
    </div>
  )
}
