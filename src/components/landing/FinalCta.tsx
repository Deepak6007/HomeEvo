"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useScrollReveal } from "@/hooks/useScrollReveal"

interface FinalCtaProps {
  onHomeownerClick?: () => void
  onContractorClick?: () => void
}

export default function FinalCta({ onHomeownerClick, onContractorClick }: FinalCtaProps) {
  const [sectionRef, isVisible] = useScrollReveal()

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-orange relative overflow-hidden"
    >
      {/* Repeating Diagonal Stripe Texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] bg-[size:1.5rem_1.5rem]" />

      {/* Decorative Glows */}
      <div className="absolute top-[-30%] left-[-10%] w-96 h-96 rounded-full bg-white/10 filter blur-3xl" />
      <div className="absolute bottom-[-30%] right-[-10%] w-96 h-96 rounded-full bg-black/10 filter blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
        
        <div
          className={`space-y-4 transition-all duration-1000 transform ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/15 px-3.5 py-1 rounded-full font-mono">
            Get Started
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight">
            Ready to build? Join HomeEvo today.
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-cream/90 font-body">
            Join thousands of homeowners and local contractors in Andhra Pradesh building projects with absolute transparency and milestone escrow protection.
          </p>
        </div>

        <div
          className={`flex flex-col sm:flex-row justify-center items-center gap-4 transition-all duration-1000 delay-300 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Button
            onClick={onHomeownerClick}
            className="w-full sm:w-auto h-12 bg-white text-orange hover:bg-cream px-8 font-bold text-sm tracking-wide rounded-lg shadow-lg shadow-black/10 hover:scale-[1.02] transition-all duration-300"
          >
            I'm a Homeowner
          </Button>
          
          <Button
            onClick={onContractorClick}
            className="w-full sm:w-auto h-12 border-2 border-white/90 bg-transparent text-white hover:bg-white/10 px-8 font-bold text-sm tracking-wide rounded-lg hover:scale-[1.02] transition-all duration-300"
          >
            I'm a Contractor
          </Button>
        </div>

      </div>
    </section>
  )
}
