"use client"

import * as React from "react"
import { BlueprintResponse } from "../../lib/validators/blueprint"

interface BlueprintGanttProps {
  timeline: BlueprintResponse["timeline"]
}

const BAR_COLORS = [
  "bg-[#E85D04]/90 hover:bg-[#E85D04] border-[#E85D04]", // orange
  "bg-blue-600/90 hover:bg-blue-600 border-blue-600",     // blue
  "bg-green-600/90 hover:bg-green-600 border-green-600",   // green
  "bg-amber-500/90 hover:bg-amber-500 border-amber-500",   // amber
  "bg-purple-600/90 hover:bg-purple-600 border-purple-600"  // purple
]

export function BlueprintGantt({ timeline }: BlueprintGanttProps) {
  const totalWeeks = timeline.totalWeeks || 1
  const months = Math.round(totalWeeks / 4.3)

  // Calculate cumulative offsets for each phase to draw true sequential Gantt bars
  let accumulatedWeeks = 0
  const phases = React.useMemo(() => {
    return (timeline.phases || []).map((phase, index) => {
      const startWeek = accumulatedWeeks
      accumulatedWeeks += phase.weeks
      const offsetPct = (startWeek / totalWeeks) * 100
      const widthPct = (phase.weeks / totalWeeks) * 100
      const colorClass = BAR_COLORS[index % BAR_COLORS.length]

      return {
        ...phase,
        offsetPct,
        widthPct,
        colorClass,
        startWeek,
      }
    })
  }, [timeline.phases, totalWeeks])

  // Position "Today" line at week 2 (as a visual draft marker)
  const todayWeek = Math.min(2, totalWeeks)
  const todayPct = (todayWeek / totalWeeks) * 100

  const truncate = (text: string, len: number) => {
    return text.length > len ? text.substring(0, len) + "..." : text
  }

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-5 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h4 className="font-serif text-sm font-bold text-[#3D2B1F]">Construction Schedule</h4>
        <span className="text-xs font-semibold text-[#E85D04] bg-[#FDF8F2] px-2.5 py-1 rounded-full">
          Total: {totalWeeks} Weeks ({months} Months)
        </span>
      </div>

      {/* Gantt Area */}
      <div className="space-y-4 relative select-none">
        
        {/* Timeline headers: week intervals */}
        <div className="flex w-full text-[9px] font-bold text-[#6F5B4B]/80 pl-[25%] pr-1">
          {Array.from({ length: 5 }).map((_, idx) => {
            const weekVal = Math.round((idx / 4) * totalWeeks)
            const pct = (idx / 4) * 100
            return (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${25 + (pct * 0.74)}%` }} // offset left for column width
              >
                Wk {weekVal}
              </div>
            )
          })}
        </div>

        {/* Vertical Grid Lines and Today Line */}
        <div className="absolute top-6 bottom-0 left-[25%] right-1 pointer-events-none">
          {/* Week interval markers */}
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-dashed border-border/40"
              style={{ left: `${(idx / 4) * 100}%` }}
            />
          ))}

          {/* Today Indicator Line */}
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 z-10"
            style={{ left: `${todayPct}%` }}
          >
            <div className="absolute -top-6 transform -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-xs whitespace-nowrap">
              Today (Wk {todayWeek})
            </div>
          </div>
        </div>

        {/* Phase Gantt Rows */}
        <div className="space-y-3 pt-4">
          {phases.map((phase, idx) => (
            <div key={idx} className="flex items-center min-h-[36px]">
              
              {/* Left column (25%): phase name */}
              <div className="w-[25%] pr-3 text-xs font-semibold text-[#3D2B1F] leading-tight">
                <span title={phase.name}>{truncate(phase.name, 20)}</span>
                <span className="block text-[10px] text-[#6F5B4B]/70 font-medium">{phase.weeks} wks</span>
              </div>

              {/* Right area (75%): horizontal Gantt bars */}
              <div className="w-[75%] relative h-7 bg-[#FDF8F2]/40 rounded-md overflow-visible border border-border/20">
                <div
                  className={`absolute top-1 bottom-1 rounded-md border shadow-2xs transition-all duration-300 flex items-center px-2 text-[9px] font-bold ${phase.colorClass}`}
                  style={{
                    left: `${phase.offsetPct}%`,
                    width: `${phase.widthPct}%`,
                    minWidth: "40px"
                  }}
                  title={`${phase.name} (${phase.weeks} weeks: Wk ${phase.startWeek} - Wk ${phase.startWeek + phase.weeks})`}
                >
                  <span className="truncate whitespace-nowrap">
                    {phase.widthPct > 20 ? `${phase.weeks} weeks` : `${phase.weeks}w`}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
export default BlueprintGantt
