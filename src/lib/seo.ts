import { Metadata } from "next"

interface SeoProps {
  title?: string
  description?: string
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
}

/**
 * Generate metadata object for Next.js App Router pages.
 */
export function generateMetadata({
  title = "HomeEvo | Build Your Dream Home in Andhra Pradesh",
  description = "Connect with verified local contractors, architects, and material vendors in Andhra Pradesh. Secure payments via milestone escrow.",
  ogImage = "/images/og-image.jpg",
  canonicalUrl = "https://homeevo.in",
  noIndex = false,
}: SeoProps = {}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "HomeEvo",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}

/**
 * Get LocalBusiness JSON-LD Schema.
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "HomeEvo",
    "image": "https://homeevo.in/images/og-image.jpg",
    "@id": "https://homeevo.in/#localbusiness",
    "url": "https://homeevo.in",
    "telephone": "+918665550123", // AP / Vijayawada mock service line
    "priceRange": "₹₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Benz Circle",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "520010",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 16.5062,
      "longitude": 80.6480,
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      "opens": "09:00",
      "closes": "18:00",
    },
    "sameAs": [
      "https://www.facebook.com/homeevo",
      "https://twitter.com/homeevo",
      "https://www.instagram.com/homeevo",
    ],
  }
}
