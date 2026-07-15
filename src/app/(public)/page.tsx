import * as React from "react"
import { generateMetadata, getLocalBusinessSchema } from "@/lib/seo"
import LandingPageClient from "./LandingPageClient"

// 1. Export server-side SEO metadata
export const metadata = generateMetadata({
  title: "HomeEvo | Build Your Dream Home in Andhra Pradesh",
  description: "Connect with verified local contractors, architects, and material vendors in Andhra Pradesh. Secure payments via milestone escrow.",
  canonicalUrl: "https://homeevo.in",
})

export default function Page() {
  const schema = getLocalBusinessSchema()

  return (
    <>
      {/* 2. Structured JSON-LD LocalBusiness Schema markup injected at server level */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* 3. Render client interactivity container */}
      <LandingPageClient />
    </>
  )
}
