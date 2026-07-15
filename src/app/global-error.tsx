"use client"

import * as React from "react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center space-y-5 bg-slate-950 text-white font-sans p-6 text-center">
        <div className="text-red-500 text-4xl">⚠️</div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold uppercase tracking-wider text-red-500">Critical System Error</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {error.message || "A fatal application rendering error occurred."}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="bg-[#E85D04] hover:bg-[#D45203] text-white font-bold uppercase tracking-wider text-xs py-2 px-6 rounded transition-all active:scale-95 cursor-pointer"
        >
          Recover System
        </button>
      </body>
    </html>
  )
}
