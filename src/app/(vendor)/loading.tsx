"use client"

import * as React from "react"

export default function VendorLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-mono p-6 text-white bg-slate-950">
      <div className="h-6 w-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      <div className="space-y-1 text-center font-industrial">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white">INITIALIZING OPS WORKSPACE</h3>
        <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Loading project modules & telemetry...</p>
      </div>
    </div>
  )
}
