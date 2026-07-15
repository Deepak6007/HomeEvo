"use client"

import * as React from "react"
import { useScrollReveal } from "@/hooks/useScrollReveal"

const SERVICES = [
  {
    emoji: "🏗️",
    name: "New Construction",
    description: "End-to-end villa, house, and apartment construction customized to your blueprints.",
    tag: "Build",
  },
  {
    emoji: "🔨",
    name: "Renovation",
    description: "Breathe new life into your spaces with kitchen, bathroom, and structural remodels.",
    tag: "Remodel",
  },
  {
    emoji: "⚡",
    name: "Electrical",
    description: "Certified safety-first wiring, panel upgrades, and smart home automation setups.",
    tag: "Utility",
  },
  {
    emoji: "🎨",
    name: "Interior Design",
    description: "Custom 3D plans, modular kitchens, wardrobes, and curated lighting selections.",
    tag: "Design",
  },
  {
    emoji: "🧱",
    name: "Materials Supply",
    description: "Premium cement, steel, bricks, tiles, and fittings sourced directly from distributors.",
    tag: "Vendor",
  },
  {
    emoji: "🤖",
    name: "AI Blueprint Generator",
    description: "Generate conceptual floor plans and structural layouts instantly with our AI engine.",
    tag: "AI Tech",
  },
]

export default function ServicesGrid() {
  const [sectionRef, isVisible] = useScrollReveal()

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-24 bg-cream scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Testimonial */}
          <div
            className={`lg:col-span-4 lg:sticky lg:top-24 space-y-8 transition-all duration-1000 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange bg-orange/10 px-3 py-1 rounded-full font-mono">
                Services
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
                Every service under one roof.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-body">
                Whether you are constructing a new home in Vijayawada or renovating a kitchen in Visakhapatnam, we connect you with specialized local professionals.
              </p>
            </div>

            {/* Testimonial Pull-Quote */}
            <div className="relative p-6 sm:p-8 bg-card border-l-4 border-orange rounded-r-2xl shadow-sm overflow-hidden">
              <div className="absolute top-0 right-4 text-7xl font-serif text-orange/15 select-none font-black leading-none">
                “
              </div>
              <p className="relative z-10 text-sm font-semibold italic leading-relaxed text-foreground font-body">
                "Finding a structural architect in Guntur who could work with my budget was a nightmare. Through HomeEvo, I had 3 verified quotes within 48 hours and completed my blueprint verification seamlessly."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold text-xs">
                  KV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">K. Venkatesh</h4>
                  <p className="text-[10px] text-muted-foreground">Homeowner, Guntur</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Service Tiles */}
          <div
            className={`lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-1000 delay-300 transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className="group p-6 bg-card border border-border/60 hover:border-orange hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  {/* Emoji Icon */}
                  <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {service.emoji}
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground mt-4 font-body">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed font-body">
                    {service.description}
                  </p>
                </div>

                {/* Category Tag */}
                <div className="mt-4">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground group-hover:bg-orange/10 group-hover:text-orange px-2 py-0.5 rounded-md font-mono transition-colors duration-300">
                    {service.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
