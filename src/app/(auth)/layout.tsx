import * as React from "react"
import { Syne, DM_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "../globals.css"

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

export const metadata = {
  title: "HomeEvo Authentication",
  description: "Secure login, signup, and vendor onboarding for the HomeEvo construction marketplace.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${syne.variable} ${dmSans.variable} font-body min-h-screen bg-cream dark:bg-dark text-foreground antialiased flex flex-col justify-between`}>
      <main className="flex-1 flex flex-col justify-center">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}
