"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CreateProjectModal } from "@/components/client/CreateProjectModal"
import { formatCurrency } from "@/lib/utils/format"
import { Briefcase, IndianRupee, MapPin, Plus, Search, User } from "lucide-react"
import Link from "next/link"

export const ProjectsListClient: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [modalOpen, setModalOpen] = React.useState(false)

  // Sync state with URL params
  const statusFilter = searchParams.get("status") || "all"
  const searchQuery = searchParams.get("search") || ""
  const currentPage = Number(searchParams.get("page")) || 1

  const [searchInput, setSearchInput] = React.useState(searchQuery)

  // Sync search input with URL query when it changes (back/forward nav)
  React.useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  // React Query fetch
  const { data: projectsRes, isLoading } = useProjects({
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    pageSize: 6, // 6 projects per page
    search: searchQuery || undefined,
  })

  const projects = projectsRes?.data || []
  const pagination = projectsRes?.pagination

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

  // Navigation update helper
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    // Reset to page 1 on filter changes unless page is explicitly updated
    if (!newParams.hasOwnProperty("page")) {
      params.delete("page")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle Tab Click
  const handleTabChange = (status: string) => {
    updateParams({ status: status === "all" ? null : status })
  }

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput })
  }

  // Handle Page Click
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      updateParams({ page })
    }
  }

  const tabs = [
    { id: "all", label: "All Projects" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "on_hold", label: "On Hold" },
  ]

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6">
        {/* Header Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">My Construction Projects</h2>
            <p className="text-xs text-[#6F5B4B] font-medium tracking-wide">
              Track milestones, view escrow balances, and upload blueprints.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 px-4 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-4.5 w-4.5" /> + New Project
          </Button>
        </div>

        {/* Filter Bar Grid */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#E85D04]/10 p-3 rounded-xl shadow-2xs">
          {/* Tabs Container */}
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const active = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-2xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    active
                      ? "bg-[#E85D04] text-white shadow-xs"
                      : "text-[#6F5B4B] hover:bg-[#FDF8F2] hover:text-[#3D2B1F]"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects..."
                className="pl-9 h-9 text-xs bg-card/40 border-border/80 text-[#3D2B1F]"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#3D2B1F] text-white hover:bg-[#2C1F16] text-xs h-9 px-4"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="h-[240px] rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-[#E85D04]/10 shadow-2xs">
            <EmptyState
              icon={<Briefcase className="h-8 w-8 text-[#E85D04]" />}
              title="No Projects Found"
              description={
                searchQuery
                  ? "We couldn't find any projects matching your search filter."
                  : "No projects yet — describe your dream home or renovation idea to get started!"
              }
              action={
                searchQuery
                  ? undefined
                  : {
                      label: "Start New Project",
                      onClick: () => setModalOpen(true),
                    }
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const total = project.milestones?.length || 0
                const completed =
                  project.milestones?.filter((m) => m.status === "released").length || 0
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                const contractor = project.vendorId ? "Sri Sai Builders" : "Awaiting Contractor"

                // Theme color bindings for badges
                let badgeColor = "bg-blue-500/10 text-blue-500 border-0"
                if (project.status === "active") {
                  badgeColor = "bg-green-500/10 text-green-600 border-0"
                } else if (project.status === "completed") {
                  badgeColor = "bg-[#E85D04]/10 text-[#E85D04] border-0"
                } else if (project.status === "on_hold") {
                  badgeColor = "bg-amber-500/10 text-amber-600 border-0"
                }

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-[#E85D04]/10 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[250px] group hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Badge and Title */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <Badge className={`text-3xs px-2 py-0 font-semibold ${badgeColor}`}>
                          {project.status}
                        </Badge>
                        <span className="text-3xs text-muted-foreground font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {project.location}
                        </span>
                      </div>

                      <Link href={`/client/projects/${project.id}`} className="hover:underline">
                        <h3 className="font-serif text-base font-bold text-[#3D2B1F] group-hover:text-[#E85D04] transition-colors truncate">
                          {project.title}
                        </h3>
                      </Link>

                      {/* Detail row */}
                      <div className="mt-4 space-y-2.5 text-xs text-[#6F5B4B]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {contractor}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#3D2B1F]">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {formatCurrency(project.budget)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar and Action */}
                    <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-3xs font-semibold text-[#6F5B4B]">
                          <span>Completion Progress</span>
                          <span>
                            {completed}/{total} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden flex">
                          <div
                            style={{ width: `${percent}%` }}
                            className="bg-[#E85D04] h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <Link href={`/client/projects/${project.id}`}>
                        <span className="text-3xs font-bold text-[#E85D04] hover:text-[#D45203] flex items-center justify-end gap-1 cursor-pointer">
                          Manage Project &rarr;
                        </span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination className="pt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}

        {/* Creation Dialog Modal */}
        <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </DashboardShell>
  )
}

export default ProjectsListClient
