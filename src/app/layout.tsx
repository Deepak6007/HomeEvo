import * as React from "react"
import "@/env"
import { Syne, DM_Sans, Fraunces, Barlow_Condensed, JetBrains_Mono, Outfit } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-industrial",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
})

export const metadata = {
  title: "HomeEvo — Andhra Pradesh's #1 Construction Marketplace",
  description: "Connect with verified local contractors, architects, and material vendors in Andhra Pradesh. Secure payments via milestone escrow.",
}

import Providers from "./providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${fraunces.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} ${outfit.variable}`}
    >
      <body className="bg-cream text-foreground antialiased min-h-screen selection:bg-orange/30 selection:text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
