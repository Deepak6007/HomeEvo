"use client"

import * as React from "react"
import { ShieldCheck, UserCheck, Scale, DollarSign, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollReveal } from "@/hooks/useScrollReveal"

interface TrustEscrowProps {
  onLearnMoreClick?: () => void
}

const CARDS = [
  {
    title: "Milestone Escrow",
    description: "Your money remains in an secure escrow. Funds are only transferred to the vendor after you sign off on completed project milestones.",
    icon: ShieldCheck,
  },
  {
    title: "Verified Vendors",
    description: "Every architect, contractor, and vendor on HomeEvo undergoes rigorous identity, license, portfolio, and credit background checks.",
    icon: UserCheck,
  },
  {
    title: "Dispute Resolution",
    description: "If issues arise regarding work quality or changes, our neutral arbitration system resolves disputes based on contract terms.",
    icon: Scale,
  },
  {
    title: "Transparent Pricing",
    description: "Get detailed, itemized bills of quantities (BOQ) with flat rates. Zero hidden markups, zero middleman commissions.",
    icon: DollarSign,
  },
]

export default function TrustEscrow({ onLearnMoreClick }: TrustEscrowProps) {
  const [sectionRef, isVisible] = useScrollReveal()

  return (
    <section
      id="trust-escrow"
      ref={sectionRef}
      className="py-24 bg-cream-warm/10 border-t border-border/40 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading and CTA */}
          <div
            className={`lg:col-span-5 space-y-6 transition-all duration-1000 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange bg-orange/10 px-3 py-1 rounded-full font-mono">
              Trust & Safety
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
              Safe construction. Safe payments.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-body">
              We stand between homeowners and vendors to ensure project milestones are delivered up to code before payments are released. Your hard-earned money stays secure throughout the build.
            </p>
            <div>
              <Button
                onClick={onLearnMoreClick}
                className="h-11 bg-orange text-white hover:bg-orange/95 px-6 font-bold text-sm tracking-wide rounded-lg flex items-center justify-center gap-2 group shadow-md shadow-orange/10 hover:shadow-lg transition-all duration-300"
              >
                Get Protected Today
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Column: 4 Trust Cards Grid */}
          <div
            className={`lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-1000 delay-300 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-orange/10 transition-all duration-300 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-orange/10 border border-orange/10 flex items-center justify-center text-orange group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-4 font-body">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed font-body">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
