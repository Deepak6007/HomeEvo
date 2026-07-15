"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { useVendors } from "@/hooks/useVendors"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShieldCheck, MapPin, Search, Filter, X, SlidersHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"

function BrowseVendorsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Collapsible sidebar state on mobile
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  // URL State values
  const currentCategory = searchParams.get("category") || ""
  const currentLocation = searchParams.get("location") || ""
  const minRating = Number(searchParams.get("rating")) || 0
  const verifiedOnly = searchParams.get("verified") === "true"
  const searchQuery = searchParams.get("search") || ""

  // Local inputs
  const [searchInput, setSearchInput] = React.useState(searchQuery)

  // React Query call
  const { data: vendorsRes, isLoading } = useVendors(
    {
      category: currentCategory || undefined,
      location: currentLocation || undefined,
      rating: minRating || undefined,
      verified: verifiedOnly || undefined,
    },
    1 // page 1
  )

  const vendors = vendorsRes?.data || []

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Client User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [user])

  // Sync search input
  React.useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  // URL query helper
  const updateFilters = (newFilters: Record<string, string | number | boolean | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === "" || value === false || value === 0) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleCategoryToggle = (category: string) => {
    updateFilters({ category: currentCategory === category ? null : category })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchInput })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const categories = [
    "Civil",
    "Electrical",
    "Plumbing",
    "Architecture",
    "Masonry",
    "Painting",
    "Carpentry",
  ]
  const locations = [
    "Vijayawada",
    "Guntur",
    "Amaravati",
    "Visakhapatnam",
    "Tirupati",
    "Nellore",
  ]

  const FilterSidebarContent = () => (
    <div className="space-y-6">
      {/* Category Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#3D2B1F] tracking-wide uppercase">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => {
            const active = currentCategory === cat
            return (
              <label key={cat} className="flex items-center gap-2.5 text-xs text-[#6F5B4B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleCategoryToggle(cat)}
                  className="rounded border-border/80 text-[#E85D04] focus:ring-[#E85D04]/30"
                />
                <span>{cat} Contractor</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Location Selector */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#3D2B1F] tracking-wide uppercase">Location in AP</h4>
        <Select
          value={currentLocation}
          onValueChange={(val) => updateFilters({ location: val === "all" ? null : val })}
        >
          <SelectTrigger className="bg-card/40 border-border/80 text-xs text-[#3D2B1F]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent className="bg-white border text-[#3D2B1F]">
            <SelectItem value="all">All Cities</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Rating Selector */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#3D2B1F] tracking-wide uppercase">Minimum Rating</h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.0].map((rate) => {
            const active = minRating === rate
            return (
              <button
                key={rate}
                onClick={() => updateFilters({ rating: active ? null : rate })}
                className={`flex items-center gap-1.5 text-xs w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                  active ? "bg-[#E85D04]/10 text-[#E85D04]" : "text-[#6F5B4B] hover:bg-[#FDF8F2]"
                }`}
              >
                <Star className="h-4 w-4 fill-current text-amber-500" />
                <span className="font-semibold">{rate}+ Stars</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Verification Checkbox */}
      <div className="pt-2 border-t border-border/40">
        <label className="flex items-center gap-2.5 text-xs text-[#3D2B1F] font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => updateFilters({ verified: e.target.checked })}
            className="rounded border-border/80 text-[#E85D04] focus:ring-[#E85D04]/30"
          />
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Verified Pros Only
          </span>
        </label>
      </div>

      {/* Clear Filters Link */}
      {(currentCategory || currentLocation || minRating || verifiedOnly) && (
        <Button
          onClick={() =>
            updateFilters({ category: null, location: null, rating: null, verified: null })
          }
          variant="ghost"
          className="w-full text-3xs font-bold text-[#E85D04] hover:bg-[#E85D04]/5 p-0 h-auto"
        >
          Reset All Filters
        </Button>
      )}
    </div>
  )

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">Browse Local Service Pros</h2>
          <p className="text-xs text-[#6F5B4B] font-medium tracking-wide">
            Find and connect with verified local contractors, architects, and carpenters in Andhra Pradesh.
          </p>
        </div>

        {/* Search Bar & Mobile Filters trigger */}
        <div className="flex items-center gap-2 bg-white border border-[#E85D04]/10 p-3 rounded-xl shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search vendor name, specialty..."
              className="pl-9 h-9 text-xs bg-card/40 border-border/80 text-[#3D2B1F]"
            />
          </form>
          <Button
            onClick={() => setMobileFiltersOpen(true)}
            variant="outline"
            className="md:hidden border-border/60 text-[#3D2B1F] px-3 h-9"
          >
            <Filter className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Desktop Layout grid split */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Filters Sidebar Column (Desktop) */}
          <div className="hidden md:block bg-white border border-[#E85D04]/10 rounded-xl p-5 shadow-2xs col-span-1">
            <h3 className="font-serif text-sm font-bold text-[#3D2B1F] border-b border-border/40 pb-2 mb-4 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h3>
            <FilterSidebarContent />
          </div>

          {/* Vendors Card List Grid */}
          <div className="col-span-1 md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="h-[260px] rounded-xl border border-border bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E85D04]/10 p-12 shadow-2xs">
                <EmptyState
                  icon={<Star className="h-8 w-8 text-[#E85D04]" />}
                  title="No Service Pros Found"
                  description="Try broadening your filters or looking in neighboring locations."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-white border border-[#E85D04]/10 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[280px] group hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Avatar Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-11 w-11 rounded-full bg-[#E85D04]/10 text-[#E85D04] font-semibold flex items-center justify-center text-sm border border-[#E85D04]/20 shadow-2xs shrink-0">
                          {getInitials(vendor.name)}
                        </div>

                        {vendor.isVerified && (
                          <span className="inline-flex items-center gap-0.5 text-3xs font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>

                      {/* Info fields */}
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-[#3D2B1F] group-hover:text-[#E85D04] transition-colors truncate">
                          {vendor.name}
                        </h4>
                        <p className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider">
                          {vendor.businessName}
                        </p>
                        <Badge className="bg-[#E85D04]/5 text-[#E85D04] border-0 text-3xs font-semibold px-2 py-0">
                          {vendor.category}
                        </Badge>
                      </div>

                      {/* Ratings & Price */}
                      <div className="mt-4 flex items-center justify-between text-2xs text-[#6F5B4B] font-medium border-t border-border/40 pt-3">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{vendor.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground font-normal">
                            ({vendor.reviewCount})
                          </span>
                        </div>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 shrink-0" /> {vendor.location}
                        </span>
                      </div>
                    </div>

                    <Link href={`/client/vendors/${vendor.id}`}>
                      <Button className="w-full bg-[#3D2B1F] text-white hover:bg-[#2C1F16] text-xs font-semibold py-1.5 mt-4 active:scale-95 transition-all">
                        View Full Profile
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Slide Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 md:hidden animate-in fade-in-20 duration-200">
            <div className="bg-white w-[280px] h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-sm font-bold text-[#3D2B1F]">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebarContent />
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

export default function BrowseVendorsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-[#E85D04] animate-spin" />
        </div>
      }
    >
      <BrowseVendorsContent />
    </React.Suspense>
  )
}
