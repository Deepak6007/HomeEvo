"use client"

import * as React from "react"

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-body p-6 text-[#3D2B1F]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#E85D04]/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#E85D04] animate-spin" />
      </div>
      <div className="space-y-1 text-center">
        <h3 className="font-serif text-base font-bold text-[#3D2B1F]">Loading HomeEvo</h3>
        <p className="text-2xs text-[#6F5B4B] font-medium tracking-wide uppercase">Connecting to services...</p>
      </div>
    </div>
  )
}
