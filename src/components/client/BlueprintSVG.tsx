"use client"

import * as React from "react"
import { BlueprintResponse } from "../../lib/validators/blueprint"
import { cn } from "@/lib/utils/cn"

interface BlueprintSVGProps {
  floorPlan: BlueprintResponse["floorPlan"]
  selectedFloor?: number
  onFloorChange?: (floor: number) => void
}

const ROOM_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  bedroom: { fill: "#3B82F6", stroke: "#2563EB", text: "#1D4ED8" },
  bathroom: { fill: "#22C55E", stroke: "#16A34A", text: "#15803D" },
  kitchen: { fill: "#E85D04", stroke: "#D45203", text: "#9A3412" },
  living: { fill: "#F59E0B", stroke: "#D97706", text: "#B45309" },
  dining: { fill: "#8B5CF6", stroke: "#7C3AED", text: "#6D28D9" },
  pooja: { fill: "#EC4899", stroke: "#DB2777", text: "#BE185D" },
  utility: { fill: "#6B7280", stroke: "#4B5563", text: "#374151" },
  garage: { fill: "#78716C", stroke: "#57534E", text: "#44403C" },
  other: { fill: "#94A3B8", stroke: "#64748B", text: "#475569" },
}

export function BlueprintSVG({ floorPlan, selectedFloor = 1, onFloorChange }: BlueprintSVGProps) {
  const [internalFloor, setInternalFloor] = React.useState<number>(1)
  
  const activeFloor = onFloorChange ? selectedFloor : internalFloor
  const handleFloorClick = (fl: number) => {
    if (onFloorChange) {
      onFloorChange(fl)
    } else {
      setInternalFloor(fl)
    }
  }

  // Canvas bounds
  const canvasW = 600
  const canvasH = 500
  const padding = 60

  // Filter rooms for the active floor
  const rooms = React.useMemo(() => {
    return (floorPlan.rooms || []).filter((r) => r.floor === activeFloor)
  }, [floorPlan.rooms, activeFloor])

  // Simple grid layout calculation
  const layout = React.useMemo(() => {
    if (rooms.length === 0) return { scaledRects: [], scale: 1 }

    // 1. Calculate pixels-per-foot scale factor
    // scale = Math.sqrt((canvas_w * canvas_h) / totalArea) * 0.6
    const totalArea = floorPlan.totalArea || 1800
    const scale = Math.sqrt((canvasW * canvasH) / totalArea) * 0.6

    // 2. Sort rooms: bedrooms/living/kitchen first (largest to smallest)
    const sortedRooms = [...rooms].sort((a, b) => {
      const areaA = a.width * a.length
      const areaB = b.width * b.length
      return areaB - areaA
    })

    const scaledRects: Array<{
      room: typeof rooms[0]
      x: number
      y: number
      w: number
      h: number
    }> = []

    let currentX = padding
    let currentY = padding
    let maxRowHeight = 0

    // Grid packing: Place rooms sequentially, wrapping to next line if width exceeded
    for (const room of sortedRooms) {
      const roomW = room.width * scale
      const roomH = room.length * scale

      // Check if room fits in current row
      if (currentX + roomW > canvasW - padding) {
        // Wrap to next line
        currentX = padding
        currentY += maxRowHeight + 12
        maxRowHeight = 0
      }

      scaledRects.push({
        room,
        x: currentX,
        y: currentY,
        w: roomW,
        h: roomH,
      })

      maxRowHeight = Math.max(maxRowHeight, roomH)
      currentX += roomW + 12
    }

    return { scaledRects, scale }
  }, [rooms, floorPlan.totalArea])

  const totalFloors = floorPlan.floors || 1

  return (
    <div className="space-y-4">
      {/* Floor Selectors */}
      {totalFloors > 1 && (
        <div className="flex items-center gap-1.5 border-b pb-2">
          <span className="text-xs font-semibold text-[#6F5B4B] mr-2">Select Floor:</span>
          {Array.from({ length: totalFloors }, (_, i) => i + 1).map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => handleFloorClick(fl)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                activeFloor === fl
                  ? "bg-[#E85D04] text-white shadow-xs"
                  : "bg-white text-[#6F5B4B] hover:bg-[#FDF8F2] border border-border/80"
              )}
            >
              Floor {fl}
            </button>
          ))}
        </div>
      )}

      {/* SVG Container */}
      <div className="relative border border-[#E85D04]/10 bg-white rounded-xl shadow-xs overflow-hidden max-w-full">
        <svg
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          className="w-full h-auto aspect-[6/5]"
          style={{ maxHeight: "450px" }}
        >
          {/* Grid Blueprint Background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1E8DF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect
            x={padding - 10}
            y={padding - 10}
            width={canvasW - 2 * padding + 20}
            height={canvasH - 2 * padding + 20}
            fill="none"
            stroke="#E85D04"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            strokeOpacity="0.3"
          />

          {/* Render Rooms */}
          {layout.scaledRects.map(({ room, x, y, w, h }, idx) => {
            const color = ROOM_COLORS[room.type] || ROOM_COLORS.other
            const isOpacityLow = ["living", "dining", "utility", "garage", "other"].includes(room.type)
            const fillOpacity = isOpacityLow ? 0.15 : 0.20

            return (
              <g key={idx} className="group cursor-pointer">
                {/* Room Rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={color.fill}
                  fillOpacity={fillOpacity}
                  stroke={color.stroke}
                  strokeWidth="1.8"
                  rx="6"
                  className="transition-all duration-300 group-hover:fill-opacity-35"
                />
                
                {/* Room Name */}
                {w > 60 && h > 30 ? (
                  <>
                    <text
                      x={x + w / 2}
                      y={y + h / 2 - 4}
                      textAnchor="middle"
                      fill="#3D2B1F"
                      fontSize="11"
                      fontWeight="bold"
                      className="font-body pointer-events-none select-none"
                    >
                      {room.name}
                    </text>
                    {/* Room Dimensions */}
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 10}
                      textAnchor="middle"
                      fill="#6F5B4B"
                      fontSize="9"
                      className="font-body pointer-events-none select-none opacity-80"
                    >
                      {room.width}' × {room.length}'
                    </text>
                  </>
                ) : (
                  <title>{room.name}: {room.width}' × {room.length}'</title>
                )}
              </g>
            )
          })}

          {/* Scale Indicator (Bottom-Left) */}
          <g transform="translate(60, 450)">
            <line x1="0" y1="0" x2={10 * layout.scale} y2="0" stroke="#3D2B1F" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#3D2B1F" strokeWidth="2" />
            <line x1={10 * layout.scale} y1="-4" x2={10 * layout.scale} y2="4" stroke="#3D2B1F" strokeWidth="2" />
            <text
              x={(10 * layout.scale) / 2}
              y="-8"
              textAnchor="middle"
              fill="#3D2B1F"
              fontSize="9"
              fontWeight="bold"
              className="font-body select-none"
            >
              10 ft
            </text>
          </g>

          {/* Compass Rose (Bottom-Right) */}
          <g transform="translate(540, 440)">
            <circle r="22" fill="none" stroke="#E85D04" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.5" />
            {/* North Arrow Pointer */}
            <path d="M 0,-25 L 5,-6 L 0,-10 L -5,-6 Z" fill="#E85D04" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#6F5B4B" strokeWidth="0.8" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#6F5B4B" strokeWidth="0.8" />
            
            {/* Labels */}
            <text x="0" y="-28" textAnchor="middle" fill="#E85D04" fontSize="9" fontWeight="bold" className="font-body pointer-events-none select-none">N</text>
            <text x="0" y="27" textAnchor="middle" fill="#6F5B4B" fontSize="8" className="font-body pointer-events-none select-none">S</text>
            <text x="25" y="3" textAnchor="start" fill="#6F5B4B" fontSize="8" className="font-body pointer-events-none select-none">E</text>
            <text x="-25" y="3" textAnchor="end" fill="#6F5B4B" fontSize="8" className="font-body pointer-events-none select-none">W</text>
          </g>
        </svg>
      </div>
    </div>
  )
}
export default BlueprintSVG
