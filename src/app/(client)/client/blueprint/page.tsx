"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Sparkles,
  Download,
  Share2,
  Loader2,
  FileText,
  Clock,
  Layers,
  Home,
  ChevronRight,
  Compass,
  Building,
  RefreshCw,
  HelpCircle,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BlueprintRequestSchema, BlueprintRequest } from "@/lib/validators/blueprint"
import { useBlueprint } from "@/hooks/useBlueprint"
import { BlueprintGantt } from "@/components/client/BlueprintGantt"
import dynamic from "next/dynamic"

const BlueprintSVG = dynamic(() => import("@/components/client/BlueprintSVG"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange/20 border-t-orange"></div>
    </div>
  ),
})
import { downloadBlueprintPDF } from "@/lib/blueprint-pdf"
import { cn } from "@/lib/utils/cn"

// Helper for Indian numbering format
function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num)
}

function SkeletonCard() {
  return (
    <div className="border border-[#E85D04]/10 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
      <Skeleton className="h-5 w-1/3 bg-slate-200" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-slate-100" />
        <Skeleton className="h-4 w-5/6 bg-slate-100" />
        <Skeleton className="h-4 w-4/5 bg-slate-100" />
      </div>
    </div>
  )
}

export default function AIBlueprintPage() {
  const { user } = useAuth()
  const { generate, isLoading, isStreaming, progress, data, error, reset } = useBlueprint()
  const [activeTab, setActiveTab] = React.useState<"floorPlan" | "cost" | "materials" | "timeline" | "recommendations">("floorPlan")
  const [selectedFloor, setSelectedFloor] = React.useState<number>(1)
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [savedShareId, setSavedShareId] = React.useState<string | null>(null)

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Client User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [user])

  // Form setup using react-hook-form + zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlueprintRequest>({
    resolver: zodResolver(BlueprintRequestSchema),
    defaultValues: {
      description: "",
      landSize: 1800,
      floors: 2,
      style: "Modern",
      budgetMin: 2000000,
      budgetMax: 5000000,
    },
  })

  // Watch fields for custom interactive elements
  const currentFloors = watch("floors")
  const currentStyle = watch("style")
  const currentDescription = watch("description")
  const currentBudgetMin = watch("budgetMin")
  const currentBudgetMax = watch("budgetMax")

  const onSubmit = async (formData: BlueprintRequest) => {
    setSavedShareId(null)
    await generate(formData)
  }

  // Determine progress text based on current percentage
  const getProgressLabel = (pct: number) => {
    if (pct < 30) return "Analyzing your requirements..."
    if (pct < 60) return "Designing room layout..."
    if (pct < 85) return "Calculating material costs..."
    if (pct < 100) return "Finalizing blueprint design..."
    return "Complete!"
  }

  // Handle Share functionality
  const handleShare = async () => {
    if (!data) return
    
    setIsSaving(true)
    try {
      const response = await fetch("/api/blueprint/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprintData: data,
          formData: {
            description: currentDescription,
            landSize: Number(watch("landSize")),
            floors: Number(currentFloors),
            style: currentStyle,
            budgetMin: Number(currentBudgetMin),
            budgetMax: Number(currentBudgetMax),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save blueprint for sharing")
      }

      const result = await response.json()
      if (result.success && result.shareId) {
        setSavedShareId(result.shareId)
        const shareUrl = `${window.location.origin}/client/blueprint/share/${result.shareId}`
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      } else {
        throw new Error(result.error || "Save operation failed")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Could not generate shareable link.")
    } finally {
      setIsSaving(false)
    }
  }

  // Automatically reset selected floor when floorplan data updates
  React.useEffect(() => {
    if (data?.floorPlan) {
      setSelectedFloor(1)
      setActiveTab("floorPlan")
    }
  }, [data])

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6 font-body text-[#3D2B1F]">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E85D04]/10 pb-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] flex items-center gap-2">
              <Sparkles className="text-[#E85D04] h-7 w-7 animate-pulse" />
              AI Blueprint Generator
            </h2>
            <p className="text-xs md:text-sm text-[#6F5B4B] font-medium tracking-wide">
              Describe your requirements and generate an immediate SVG layout, material needs, and cost breakdown.
            </p>
          </div>

          {/* Model info pill */}
          <div className="flex items-center gap-1.5 self-start md:self-center">
            <span className="text-[10px] uppercase font-bold text-[#6F5B4B]/80 tracking-wider">Your HF Model:</span>
            <span className="text-[10px] bg-[#E85D04] text-white font-bold px-2.5 py-1 rounded-full shadow-2xs">
              Qwen2.5-72B
            </span>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          
          {/* Left Column — Form parameters (40% / 4 columns) */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-4 bg-white border border-[#E85D04]/10 rounded-xl p-5 md:p-6 shadow-xs space-y-5"
          >
            <h3 className="font-serif text-base font-bold text-[#3D2B1F] border-b pb-2">
              Design Specifications
            </h3>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[#3D2B1F]">
                <label htmlFor="description">Describe your dream home</label>
                <span className={cn(
                  "text-[10px] font-medium",
                  currentDescription.length >= 30 ? "text-green-600" : "text-amber-600"
                )}>
                  {currentDescription.length}/2000 chars
                </span>
              </div>
              <textarea
                id="description"
                {...register("description")}
                placeholder="e.g. 3 bedroom house for a family of 5 with a joint kitchen, separate pooja room, covered parking for 2 cars, modern look with large windows and an open living area..."
                rows={5}
                className={cn(
                  "w-full text-xs p-3 rounded-lg border bg-[#FDF8F2]/20 focus:bg-white outline-none transition-all resize-none",
                  errors.description ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-[#E85D04]/40"
                )}
              />
              {errors.description && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.description.message}</p>
              )}
            </div>

            {/* Land Size */}
            <div className="space-y-1.5">
              <label htmlFor="landSize" className="text-xs font-semibold text-[#3D2B1F]">Plot Size (Sq Ft)</label>
              <div className="relative">
                <Input
                  id="landSize"
                  type="number"
                  placeholder="e.g. 1800"
                  {...register("landSize", { valueAsNumber: true })}
                  className={cn(
                    "bg-[#FDF8F2]/20 focus:bg-white text-xs pr-12 h-9 border-border/80 focus-visible:ring-0 focus-visible:border-[#E85D04]/40",
                    errors.landSize && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#6F5B4B]/80 pointer-events-none select-none">
                  sq ft
                </span>
              </div>
              <p className="text-[10px] text-[#6F5B4B]/70">Enter the total plot area (500 to 50,000 sq ft)</p>
              {errors.landSize && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.landSize.message}</p>
              )}
            </div>

            {/* Number of Floors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3D2B1F] block">Number of Floors</label>
              <div className="flex gap-1.5 bg-[#FDF8F2]/40 p-1 rounded-lg border border-border/40">
                {[1, 2, 3, 4, 5].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setValue("floors", fl)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200",
                      currentFloors === fl
                        ? "bg-[#E85D04] text-white shadow-2xs"
                        : "text-[#6F5B4B] hover:bg-[#FDF8F2]/80"
                    )}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            {/* Architectural Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3D2B1F] block">Architectural Style</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "Modern", name: "Modern", icon: "🏙️", desc: "Clean lines, flat roof, large windows" },
                  { id: "Traditional", name: "Traditional", icon: "🏛️", desc: "AP vernacular, sloped roof, courtyard" },
                  { id: "Fusion", name: "Fusion", icon: "🎨", desc: "Modern and traditional elements mixed" },
                  { id: "Vastu-Compliant", name: "Vastu", icon: "🧭", desc: "Rooms positioned per Vastu Shastra rules" },
                ].map((styleOption) => (
                  <button
                    key={styleOption.id}
                    type="button"
                    onClick={() => setValue("style", styleOption.id as any)}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all duration-300 flex flex-col space-y-1 hover:border-[#E85D04]/30",
                      currentStyle === styleOption.id
                        ? "border-[#E85D04] bg-[#FDF8F2]/40"
                        : "border-border/80 bg-white"
                    )}
                  >
                    <span className="text-sm font-bold flex items-center gap-1">
                      <span>{styleOption.icon}</span>
                      <span className="text-xs">{styleOption.name}</span>
                    </span>
                    <span className="text-[9px] text-[#6F5B4B]/80 leading-snug line-clamp-2">
                      {styleOption.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3D2B1F] block">Budget Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Min"
                    {...register("budgetMin", { valueAsNumber: true })}
                    className={cn(
                      "bg-[#FDF8F2]/20 focus:bg-white text-xs pl-6 h-9 border-border/80 focus-visible:ring-0 focus-visible:border-[#E85D04]/40",
                      errors.budgetMin && "border-red-500"
                    )}
                  />
                  <span className="absolute left-2 top-2.5 text-xs text-[#6F5B4B]/80 pointer-events-none select-none font-bold">₹</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Max"
                    {...register("budgetMax", { valueAsNumber: true })}
                    className={cn(
                      "bg-[#FDF8F2]/20 focus:bg-white text-xs pl-6 h-9 border-border/80 focus-visible:ring-0 focus-visible:border-[#E85D04]/40",
                      errors.budgetMax && "border-red-500"
                    )}
                  />
                  <span className="absolute left-2 top-2.5 text-xs text-[#6F5B4B]/80 pointer-events-none select-none font-bold">₹</span>
                </div>
              </div>
              
              <div className="text-[10px] font-bold text-center text-[#E85D04] py-1 bg-[#FDF8F2]/40 rounded">
                ₹{formatIndianNumber(currentBudgetMin)} — ₹{formatIndianNumber(currentBudgetMax)}
              </div>
              <p className="text-[9px] text-[#6F5B4B]/70">Including materials, labour, and contingency.</p>
              {errors.budgetMax && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.budgetMax.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isStreaming}
              className="w-full bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing AI Architect...
                </>
              ) : isStreaming ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Designing Structure...
                </>
              ) : (
                <>
                  Generate Blueprint Plan <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Progress indicators */}
            {(isLoading || isStreaming) && (
              <div className="space-y-1.5 border-t border-border/20 pt-4">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-[#6F5B4B]">{getProgressLabel(progress)}</span>
                  <span className="text-[#E85D04]">{progress}%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-border/30">
                  <div
                    className="bg-[#E85D04] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </form>

          {/* Right Column — Outputs (60% / 6 columns) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Error Message banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex flex-col gap-2">
                <p className="font-bold flex items-center gap-1.5">
                  ⚠️ Generation Failed
                </p>
                <p>{error}</p>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  variant="outline"
                  size="sm"
                  className="self-start text-red-700 border-red-300 bg-white hover:bg-red-100/50"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State before generation */}
            {!isLoading && !isStreaming && !data && (
              <div className="bg-[#FDF8F2]/30 border-2 border-dashed border-[#E85D04]/10 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FDF8F2] flex items-center justify-center border border-[#E85D04]/15">
                  <Home className="h-8 w-8 text-[#E85D04] animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-serif text-base font-bold text-[#3D2B1F]">
                    Awaiting Design Specifications
                  </h4>
                  <p className="text-xs text-[#6F5B4B]">
                    Specify your layout details, plot dimensions, floor counts, and budget targets in the parameters panel on the left, then click Generate.
                  </p>
                </div>
              </div>
            )}

            {/* Loading state skeletons */}
            {isLoading && (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* Loaded/Streaming visualizer block */}
            {(isStreaming || data) && (
              <div className="space-y-5">
                
                {/* Tab selector bar */}
                <div className="flex bg-[#FDF8F2]/50 border border-border/80 p-1 rounded-xl w-full overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                  {[
                    { id: "floorPlan", name: "Floor Plan", icon: Home },
                    { id: "cost", name: "Cost Estimate", icon: Layers },
                    { id: "materials", name: "Materials", icon: FileText },
                    { id: "timeline", name: "Timeline", icon: Clock },
                    { id: "recommendations", name: "Recommendations", icon: Compass },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={!data} // disabled during initial stream buffering
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-[#E85D04] text-white shadow-2xs"
                          : "text-[#6F5B4B] hover:bg-[#FDF8F2] disabled:opacity-50"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>

                {/* TAB 1 — FLOOR PLAN */}
                {activeTab === "floorPlan" && (data?.floorPlan || (isStreaming && !data)) && (
                  <div className="space-y-4">
                    {data?.floorPlan ? (
                      <>
                        <BlueprintSVG
                          floorPlan={data.floorPlan}
                          selectedFloor={selectedFloor}
                          onFloorChange={setSelectedFloor}
                        />

                        {/* Floor Plan Stats & Legend */}
                        <div className="bg-white border border-border/60 rounded-xl p-4 shadow-2xs space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border/40">
                            <div>
                              <span className="block text-[10px] font-bold text-[#6F5B4B] uppercase">Built Area</span>
                              <span className="text-base font-bold text-[#E85D04]">{data.floorPlan.totalArea} sq ft</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-[#6F5B4B] uppercase">Total Rooms</span>
                              <span className="text-base font-bold text-[#3D2B1F]">
                                {(data.floorPlan.rooms || []).filter(r => r.floor === selectedFloor).length}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-[#6F5B4B] uppercase">Total Floors</span>
                              <span className="text-base font-bold text-[#3D2B1F]">{data.floorPlan.floors}</span>
                            </div>
                          </div>

                          {/* Room Legend Swatches */}
                          <div className="border-t border-border/40 pt-3">
                            <span className="text-[10px] font-bold text-[#6F5B4B] uppercase block mb-2">Room Categories</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold">
                              {[
                                { name: "Bedroom", color: "bg-[#3B82F6] border-[#2563EB]" },
                                { name: "Bathroom", color: "bg-[#22C55E] border-[#16A34A]" },
                                { name: "Kitchen", color: "bg-[#E85D04] border-[#D45203]" },
                                { name: "Living Room", color: "bg-[#F59E0B] border-[#D97706]" },
                                { name: "Dining Room", color: "bg-[#8B5CF6] border-[#7C3AED]" },
                                { name: "Pooja Room", color: "bg-[#EC4899] border-[#DB2777]" },
                                { name: "Utility", color: "bg-[#6B7280] border-[#4B5563]" },
                                { name: "Garage", color: "bg-[#78716C] border-[#57534E]" },
                              ].map((leg, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className={cn("w-3 h-3 rounded-xs border", leg.color)} />
                                  <span className="text-[#3D2B1F]">{leg.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white border border-border/60 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                        <Loader2 className="h-6 w-6 text-[#E85D04] animate-spin mb-2" />
                        <span className="text-xs font-semibold text-[#6F5B4B]">Buffering rooms layout data...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2 — COST ESTIMATE */}
                {activeTab === "cost" && data?.costEstimate && (
                  <div className="bg-white border border-border/60 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-serif text-sm font-bold text-[#3D2B1F] flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-[#E85D04]" /> Estimations Ledger
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.promise(downloadBlueprintPDF(data), {
                            loading: "Compiling PDF document...",
                            success: "PDF exported successfully!",
                            error: "Failed to download PDF.",
                          })
                        }}
                        className="text-xs font-semibold text-[#E85D04] border-[#E85D04]/20 hover:bg-[#FDF8F2]"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" /> Export to PDF
                      </Button>
                    </div>

                    <div className="overflow-x-auto border rounded-lg border-border/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border text-[#6F5B4B] font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-3">Category / Item</th>
                            <th className="py-2.5 px-3">Qty</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* We dynamically group by category */}
                          {(() => {
                            const categories: Record<string, typeof data.costEstimate.items> = {}
                            data.costEstimate.items.forEach(item => {
                              if (!categories[item.category]) categories[item.category] = []
                              categories[item.category].push(item)
                            })

                            return Object.entries(categories).map(([cat, items]) => (
                              <React.Fragment key={cat}>
                                {/* Category Section Header */}
                                <tr className="bg-[#FDF8F2]/50 border-b border-border/60">
                                  <td colSpan={5} className="py-2 px-3 font-bold text-[#E85D04] uppercase text-[10px]">
                                    {cat}
                                  </td>
                                </tr>
                                {items.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border/30 hover:bg-slate-50/50">
                                    <td className="py-2 px-4 text-[#3D2B1F] font-semibold">{item.item}</td>
                                    <td className="py-2 px-3 text-[#6F5B4B]">{item.quantity.toLocaleString("en-IN")}</td>
                                    <td className="py-2 px-3 text-[#6F5B4B]">{item.unit}</td>
                                    <td className="py-2 px-3 text-right text-[#6F5B4B]">₹{formatIndianNumber(item.unitCost)}</td>
                                    <td className="py-2 px-3 text-right text-[#3D2B1F] font-bold">₹{formatIndianNumber(item.totalCost)}</td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))
                          })()}
                        </tbody>
                        
                        {/* Totals Summary */}
                        <tfoot>
                          <tr className="border-t border-border/80">
                            <td colSpan={4} className="py-2 px-3 text-right font-bold text-[#6F5B4B]">Subtotal:</td>
                            <td className="py-2 px-3 text-right font-bold text-[#3D2B1F]">₹{formatIndianNumber(data.costEstimate.subtotal)}</td>
                          </tr>
                          <tr className="border-t border-border/30">
                            <td colSpan={4} className="py-2 px-3 text-right font-bold text-amber-600">Contingency (10%):</td>
                            <td className="py-2 px-3 text-right font-bold text-amber-600">₹{formatIndianNumber(data.costEstimate.contingency)}</td>
                          </tr>
                          <tr className="border-t-2 border-border/80 bg-slate-50/50">
                            <td colSpan={4} className="py-3 px-3 text-right font-serif text-sm font-bold text-[#3D2B1F]">Grand Total:</td>
                            <td className="py-3 px-3 text-right font-serif text-base font-bold text-[#E85D04]">₹{formatIndianNumber(data.costEstimate.grandTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3 — MATERIALS */}
                {activeTab === "materials" && data?.materialsList && (
                  <div className="bg-white border border-border/60 rounded-xl p-5 shadow-2xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#3D2B1F] flex items-center gap-1.5 border-b pb-2">
                      <FileText className="h-4 w-4 text-[#E85D04]" /> Materials Quota List
                    </h4>
                    
                    <div className="overflow-x-auto border rounded-lg border-border/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border text-[#6F5B4B] font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-3">Material</th>
                            <th className="py-2.5 px-3">Quantity</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Est. Cost</th>
                            <th className="py-2.5 px-3">Sourcing Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.materialsList.map((m, idx) => (
                            <tr key={idx} className="border-b border-border/30 hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-semibold text-[#3D2B1F]">{m.material}</td>
                              <td className="py-2.5 px-3 text-[#6F5B4B]">{m.quantity.toLocaleString("en-IN")}</td>
                              <td className="py-2.5 px-3 text-[#6F5B4B]">{m.unit}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#E85D04]">₹{formatIndianNumber(m.estimatedCost)}</td>
                              <td className="py-2.5 px-3 text-[10px] text-[#6F5B4B] max-w-[200px] leading-relaxed truncate" title={m.notes}>{m.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50/50 font-bold border-t border-border">
                            <td colSpan={3} className="py-2.5 px-3 text-right text-[#6F5B4B]">Total Materials Cost:</td>
                            <td className="py-2.5 px-3 text-right text-[#E85D04] font-serif text-sm">
                              ₹{formatIndianNumber(data.materialsList.reduce((acc, m) => acc + m.estimatedCost, 0))}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4 — TIMELINE */}
                {activeTab === "timeline" && data?.timeline && (
                  <div className="space-y-4">
                    <BlueprintGantt timeline={data.timeline} />

                    {/* Sequential Phase detail cards list */}
                    <div className="space-y-3">
                      {data.timeline.phases.map((phase, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "border border-border/50 rounded-xl p-4 shadow-3xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors",
                            idx % 2 === 0 ? "bg-white" : "bg-[#FDF8F2]/20"
                          )}
                        >
                          <div className="space-y-1 max-w-lg">
                            <h5 className="text-xs font-bold text-[#3D2B1F] flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#FDF8F2] text-[#E85D04] flex items-center justify-center text-[10px] font-bold border border-[#E85D04]/25">
                                {idx + 1}
                              </span>
                              {phase.name}
                            </h5>
                            <p className="text-[10px] text-[#6F5B4B] leading-relaxed">
                              {phase.description}
                            </p>
                          </div>
                          
                          <span className="text-xs font-bold text-[#E85D04] bg-[#FDF8F2]/60 px-3 py-1.5 rounded-lg shrink-0 border border-[#E85D04]/10">
                            {phase.weeks} Weeks Duration
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5 — RECOMMENDATIONS */}
                {activeTab === "recommendations" && data?.recommendations && (
                  <div className="bg-white border border-border/60 rounded-xl p-5 shadow-2xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#3D2B1F] flex items-center gap-1.5 border-b pb-2">
                      <Compass className="h-4 w-4 text-[#E85D04]" /> Construction Guidelines for Andhra Pradesh
                    </h4>

                    <div className="space-y-3">
                      {data.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FDF8F2]/10 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#3D2B1F]">Rule / Consideration</span>
                              {idx < 3 && (
                                <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                                  Priority
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6F5B4B] leading-relaxed">
                              {rec}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Persist & Share Buttons Bar (always visible if data exists) */}
                <div className="flex justify-between items-center bg-white border border-border/60 p-4 rounded-xl shadow-2xs">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={reset}
                    className="text-xs font-semibold text-[#6F5B4B] border-border hover:bg-[#FDF8F2]"
                  >
                    ← Regenerate
                  </Button>

                  <div className="flex items-center gap-3">
                    {savedShareId && (
                      <span className="text-[10px] text-green-600 font-bold hidden sm:inline">
                        ✓ Persistence Saved
                      </span>
                    )}
                    <Button
                      type="button"
                      disabled={isSaving}
                      onClick={handleShare}
                      className="bg-[#E85D04] hover:bg-[#D45203] text-white text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" /> Share with Vendors →
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </DashboardShell>
  )
}
