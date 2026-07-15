"use client"

import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/queryKeys"
import { vendorsApi } from "@/lib/api/vendors"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Star, UserCheck } from "lucide-react"
import Link from "next/link"

export const RecentVendorsCard: React.FC = () => {
  const { data: vendorsRes } = useSuspenseQuery({
    queryKey: queryKeys.vendors.list({ verified: true }, 1),
    queryFn: () => vendorsApi.list({ verified: true }, 1),
  })

  // Grab up to 3 vendors
  const vendors = (vendorsRes.data || []).slice(0, 3)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white border border-[#E85D04]/10 rounded-xl p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg font-bold text-[#3D2B1F] flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#E85D04]" />
            Your Booked Pros
          </h3>
          <span className="text-2xs font-semibold text-[#E85D04] bg-[#E85D04]/10 px-2 py-0.5 rounded-md">
            Recent
          </span>
        </div>

        {vendors.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="h-8 w-8 text-[#E85D04]" />}
            title="No Booked Vendors"
            description="Browse our vetted listings to find architects, masons, and project managers."
          />
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-[#FDF8F2]/20 hover:border-[#E85D04]/20 hover:bg-[#FDF8F2]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="h-10 w-10 rounded-full bg-[#E85D04]/10 text-[#E85D04] font-semibold flex items-center justify-center text-sm tracking-tight border border-[#E85D04]/20 shrink-0">
                    {getInitials(vendor.name)}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <Link href={`/client/vendors/${vendor.id}`} className="hover:underline">
                      <h4 className="text-sm font-semibold text-[#3D2B1F] truncate leading-tight">
                        {vendor.name}
                      </h4>
                    </Link>
                    <p className="text-2xs text-[#6F5B4B] font-medium leading-none">
                      {vendor.businessName} &middot; {vendor.category}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-2xs text-[#E85D04] font-semibold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{vendor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground font-normal">
                        ({vendor.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>

                <Link href={`/client/messages?vendor=${vendor.id}`} passHref legacyBehavior>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border/60 hover:bg-[#E85D04]/5 hover:text-[#E85D04] hover:border-[#E85D04]/20 transition-all font-semibold text-2xs px-3 py-1.5 h-auto active:scale-95 shrink-0"
                  >
                    Contact
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href="/client/vendors" passHref legacyBehavior>
        <Button
          variant="link"
          className="w-full text-center text-xs font-semibold text-[#E85D04] hover:text-[#D45203] mt-4 p-0 h-auto"
        >
          Browse All Directory Pros
        </Button>
      </Link>
    </div>
  )
}

export default RecentVendorsCard
