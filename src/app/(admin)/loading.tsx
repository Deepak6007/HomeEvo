"use client"

import * as React from "react"

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-mono p-6 text-slate-100 bg-slate-950">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
      <div className="space-y-1 text-center font-sans">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Telemetry Loading</h3>
        <p className="text-[9px] text-slate-500 font-mono">Status: Fetching administrative nodes...</p>
      </div>
    </div>
  )
}
