"use client"

import * as React from "react"
import { FileText, Users, ShieldCheck, Milestone } from "lucide-react"
import { useScrollReveal } from "@/hooks/useScrollReveal"

const STEPS = [
  {
    number: "01",
    title: "Describe your project",
    description: "Post your construction or renovation needs. Specify budget, location, and requirements.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Browse verified vendors",
    description: "Compare bids, portfolios, and reviews from local contractors, architects, and designers.",
    icon: Users,
  },
  {
    number: "03",
    title: "Pay via escrow",
    description: "Funds are held securely. You release them incrementally as agreed milestones are completed.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Track every milestone",
    description: "Receive real-time progress reports, photo updates, and sign-offs directly in your dashboard.",
    icon: Milestone,
  },
]

export default function HowItWorks() {
  const [sectionRef, isVisible] = useScrollReveal()

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 bg-cream-warm/30 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div
          className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange bg-orange/10 px-3 py-1 rounded-full font-mono mb-4">
            For Homeowners
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground">
            A seamless build, from start to finish.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-body">
            No more chasing contractors, budget surprises, or endless delays. Here is how HomeEvo makes construction stress-free.
          </p>
        </div>

        {/* 4-Step Cards Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 delay-300 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative group p-6 sm:p-8 bg-card border border-border/60 hover:border-orange/20 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Background Watermark Number */}
                <div className="absolute -right-3 -bottom-5 text-8xl font-display font-black text-muted/10 group-hover:text-orange/5 select-none transition-colors duration-300">
                  {step.number}
                </div>

                {/* Step Connector Arrow (Desktop only, except for the last item) */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 translate-x-1.5 z-10 text-muted/30">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                {/* Icon Container */}
                <div className="relative z-10 h-12 w-12 rounded-xl bg-orange/10 border border-orange/10 flex items-center justify-center text-orange group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Text Content */}
                <div className="relative z-10 mt-6">
                  <h3 className="text-lg font-bold tracking-tight text-foreground font-body">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-body">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
