"use client"

import * as React from "react"
import { ArrowRight, ChevronRight, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PublicNav } from "@/components/layout"
import dynamic from "next/dynamic"

// Dynamically import AuthModal to defer loading until required
const AuthModal = dynamic(() => import("@/components/shared/AuthModal").then((mod) => mod.AuthModal), {
  ssr: false,
})

// Lazy loaded below-the-fold sections for optimized bundle loading
const HowItWorks = React.lazy(() => import("@/components/landing/HowItWorks"))
const ServicesGrid = React.lazy(() => import("@/components/landing/ServicesGrid"))
const VendorSection = React.lazy(() => import("@/components/landing/VendorSection"))
const TrustEscrow = React.lazy(() => import("@/components/landing/TrustEscrow"))
const FinalCta = React.lazy(() => import("@/components/landing/FinalCta"))
const Footer = React.lazy(() => import("@/components/landing/Footer"))

// Simple Loading Indicator Placeholder
function SectionLoading() {
  return (
    <div className="py-24 bg-cream-warm/10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-orange/20 border-t-orange animate-spin" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider animate-pulse">
          Loading section...
        </span>
      </div>
    </div>
  )
}

export default function LandingPageClient() {
  // Modal visibility and config state
  const [modalConfig, setModalConfig] = React.useState<{
    open: boolean
    role: "client" | "vendor"
    mode: "signin" | "signup"
  }>({
    open: false,
    role: "client",
    mode: "signin",
  })

  const openAuth = (role: "client" | "vendor", mode: "signin" | "signup") => {
    setModalConfig({ open: true, role, mode })
  }

  const closeAuth = () => {
    setModalConfig((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-orange/30 selection:text-foreground">
      
      {/* 1. NAVBAR */}
      <PublicNav
        onSignIn={() => openAuth("client", "signin")}
        onGetStarted={() => openAuth("client", "signup")}
      />

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        
        {/* Geometric Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(234,227,220,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(234,227,220,0.45)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Radial Orange Glow at bottom */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[90%] h-[50%] bg-[radial-gradient(circle_at_bottom,rgba(232,93,4,0.14)_0%,transparent_70%)] pointer-events-none" />

        {/* Decorative Top Glows */}
        <div className="absolute top-[10%] left-[-10%] w-80 h-80 rounded-full bg-orange/5 filter blur-3xl" />
        <div className="absolute top-[20%] right-[-10%] w-80 h-80 rounded-full bg-orange/5 filter blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Eyebrow */}
          <div className="animate-fade-in">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange bg-orange/10 border border-orange/15 px-4 py-1.5 rounded-full font-mono">
              Andhra Pradesh's #1 Construction Marketplace
            </span>
          </div>

          {/* Headline H1 */}
          <h1 className="max-w-4xl mx-auto text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-foreground leading-[1.05] animate-slide-up">
            Build your dream <br className="hidden sm:inline" />
            <span className="font-serif italic text-orange font-normal">home</span> without the chaos.
          </h1>

          {/* Subtext description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-body">
            Connect directly with licensed local builders, structural architects, and material suppliers in AP. Hire with confidence, manage visual milestones, and safeguard payments via escrow.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <Button
              onClick={() => openAuth("client", "signup")}
              className="w-full sm:w-auto h-12 bg-orange text-white hover:bg-orange/95 px-8 font-bold text-sm tracking-wide rounded-lg flex items-center justify-center gap-2 group shadow-lg shadow-orange/10 hover:scale-[1.01] transition-all duration-300"
            >
              I'm a Homeowner
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openAuth("vendor", "signup")}
              className="w-full sm:w-auto h-12 border-border/80 hover:bg-muted bg-white/50 text-foreground px-8 font-bold text-sm tracking-wide rounded-lg hover:scale-[1.01] transition-all duration-300"
            >
              I'm a Contractor
            </Button>
          </div>

          {/* Floating Stats Bar */}
          <div className="pt-10 max-w-5xl mx-auto animate-fade-in delay-500">
            <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y-0 divide-x-0 md:divide-x divide-border/60">
              
              {/* Stat 1 */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                  2,400+
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Verified Partners
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center justify-center space-y-1 pt-0">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                  ₹12Cr+
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Escrow Managed
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center justify-center space-y-1 pt-0">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                  840+
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Projects Completed
                </span>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col items-center justify-center space-y-1 pt-0">
                <span className="flex items-center gap-1 text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                  4.8
                  <Star className="h-5 w-5 fill-orange text-orange shrink-0 mt-[-4px]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Customer Rating
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* BELOW THE FOLD SECTIONS (LAZY LOADED) */}
      <React.Suspense fallback={<SectionLoading />}>
        
        {/* 3. HOW IT WORKS */}
        <HowItWorks />

        {/* 4. SERVICES GRID */}
        <ServicesGrid />

        {/* 5. VENDOR SECTION */}
        <VendorSection onEnrollClick={() => openAuth("vendor", "signup")} />

        {/* 6. TRUST & ESCROW */}
        <TrustEscrow onLearnMoreClick={() => openAuth("client", "signup")} />

        {/* 7. FINAL CTA BAND */}
        <FinalCta
          onHomeownerClick={() => openAuth("client", "signup")}
          onContractorClick={() => openAuth("vendor", "signup")}
        />

        {/* 8. FOOTER */}
        <Footer />
        
      </React.Suspense>

      {/* AUTH MODAL DIALOG */}
      {modalConfig.open && (
        <AuthModal
          open={modalConfig.open}
          defaultRole={modalConfig.role}
          defaultMode={modalConfig.mode}
          onClose={closeAuth}
        />
      )}

    </div>
  )
}
