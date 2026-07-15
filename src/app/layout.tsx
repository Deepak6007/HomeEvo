import * as React from "react"
import "@/env"
import { Plus_Jakarta_Sans, Inter, Lora, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-industrial",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const adminFont = Plus_Jakarta_Sans({
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
      className={`${plusJakartaSans.variable} ${inter.variable} ${lora.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${adminFont.variable}`}
    >
      <body className="bg-cream text-foreground antialiased min-h-screen selection:bg-orange/30 selection:text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
