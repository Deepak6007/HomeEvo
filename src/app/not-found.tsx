import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "404 - Page Not Found | HomeEvo",
  description: "The page you are looking for does not exist on HomeEvo.",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8F2] flex flex-col items-center justify-center space-y-6 font-body p-6 text-center text-[#3D2B1F]">
      <div className="text-6xl font-display font-black text-[#E85D04] tracking-tight">404</div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-serif text-lg md:text-xl font-bold">Lost on the Build Site?</h1>
        <p className="text-xs text-[#6F5B4B] leading-relaxed">
          The blueprint for this page doesn't exist or the construction path has changed. Let's get you back to safety.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/">
          <Button className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 px-6 rounded-lg active:scale-95 shadow-xs">
            Back to Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="border-border text-xs font-semibold py-2 px-6 rounded-lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
