"use client"

import * as React from "react"
import { CheckCircle2, TrendingUp, ShieldAlert, BarChart3, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollReveal } from "@/hooks/useScrollReveal"

interface VendorSectionProps {
  onEnrollClick?: () => void
}

const BENEFITS = [
  {
    title: "Qualified Leads",
    description: "Receive pre-vetted project leads matching your exact service categories and target locations.",
    icon: CheckCircle2,
  },
  {
    title: "Digital Bids",
    description: "Submit professional digital estimates and negotiate milestones directly inside the platform.",
    icon: TrendingUp,
  },
  {
    title: "Escrow Payments",
    description: "Work with confidence. Homeowners deposit milestones into escrow before you start physical work.",
    icon: ShieldAlert,
  },
  {
    title: "Analytics",
    description: "Track your business conversion rates, active project earnings, and performance reviews.",
    icon: BarChart3,
  },
]

const CATEGORY_PILLS = [
  "General Contracting",
  "Electrical Work",
  "Plumbing",
  "Architecture",
  "Interior Design",
  "Masonry",
  "Painting",
  "Carpentry",
  "Flooring",
  "Material Supply",
]

const EARNINGS_ROWS = [
  { category: "General Contractor", size: "₹15L - ₹50L", earnings: "₹2.2L+" },
  { category: "Architect / Designer", size: "₹2L - ₹6L", earnings: "₹95k+" },
  { category: "Interior Designer", size: "₹3L - ₹10L", earnings: "₹1.1L+" },
  { category: "Structural Masonry", size: "₹1L - ₹4L", earnings: "₹50k+" },
]

export default function VendorSection({ onEnrollClick }: VendorSectionProps) {
  const [sectionRef, isVisible] = useScrollReveal()

  return (
    <section
      id="vendors"
      ref={sectionRef}
      className="relative py-24 bg-dark text-white overflow-hidden scroll-mt-16"
    >
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2226_1px,transparent_1px),linear-gradient(to_bottom,#1E2226_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35" />
      
      {/* Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full bg-orange/5 filter blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div
          className={`max-w-3xl mb-16 transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange bg-orange/10 px-3 py-1 rounded-full font-mono mb-4">
            For Contractors & Vendors
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-industrial font-extrabold tracking-tight text-white leading-none">
            GROW YOUR BUSINESS WITH A STEADY PIPELINE.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-mono">
            Get matched with real building contracts, submit bids, and secure guaranteed milestone payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Benefit Cards */}
          <div
            className={`lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-1000 delay-300 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="p-6 bg-dark-2/90 border border-dark-4 hover:border-orange/30 rounded-2xl flex flex-col justify-start gap-4 transition-all duration-300 group shadow-md"
                >
                  <div className="h-10 w-10 rounded-xl bg-orange-light flex items-center justify-center text-orange group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono tracking-wide">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-mono">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Categories, Earnings, CTA */}
          <div
            className={`lg:col-span-6 space-y-8 transition-all duration-1000 delay-500 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            
            {/* Category Pills */}
            <div className="p-6 bg-dark-2/50 border border-dark-4/80 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Active Categories in Andhra Pradesh
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_PILLS.map((pill) => (
                  <span
                    key={pill}
                    className="inline-block text-xs bg-dark-3 border border-dark-4 hover:border-orange/20 text-muted-foreground hover:text-white px-3 py-1 rounded-full font-mono transition-all duration-300"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Earnings Calculator / Summary */}
            <div className="p-6 bg-dark-2/90 border border-dark-4 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-dark-4 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Escrow Earnings Potential
                </h3>
                <span className="text-[10px] text-orange bg-orange/15 px-2 py-0.5 rounded font-mono font-bold">
                  AP Region Rates
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-4 text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                      <th className="pb-2 font-semibold">Category</th>
                      <th className="pb-2 font-semibold text-center">Avg. Project Size</th>
                      <th className="pb-2 font-semibold text-right">Est. Monthly Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-4 text-xs font-mono">
                    {EARNINGS_ROWS.map((row) => (
                      <tr key={row.category} className="hover:bg-dark-3/50">
                        <td className="py-2.5 font-medium text-white">{row.category}</td>
                        <td className="py-2.5 text-center text-muted-foreground">{row.size}</td>
                        <td className="py-2.5 text-right text-orange font-bold">{row.earnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enroll CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={onEnrollClick}
                className="w-full sm:w-auto h-12 bg-orange text-white hover:bg-orange/95 px-8 font-bold text-sm tracking-wide rounded-lg flex items-center justify-center gap-2 group/btn shadow-lg shadow-orange/10 hover:shadow-orange/20 transition-all duration-300"
              >
                Enroll as Partner
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              <span className="text-xs text-muted-foreground font-mono text-center sm:text-left">
                * Requires GSTIN/Aadhaar verification
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
