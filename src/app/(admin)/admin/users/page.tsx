"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { User } from "@/types"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { adminNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert as SuspendIcon
} from "lucide-react"

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  // State controls
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [viewingUser, setViewingUser] = React.useState<User | null>(null)

  // Query hook
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["admin", "users", { page, roleFilter, statusFilter, search }],
    queryFn: () => adminApi.users.list({ 
      page, 
      pageSize, 
      role: roleFilter || undefined, 
      status: statusFilter || undefined, 
      search: search || undefined 
    }),
  })

  // Mutations
  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.users.suspend(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success(`User suspended successfully`)
    },
    onError: () => toast.error("Failed to suspend user")
  })

  const reinstateMutation = useMutation({
    mutationFn: (id: string) => adminApi.users.reinstate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success(`User reinstated successfully`)
    },
    onError: () => toast.error("Failed to reinstate user")
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success(`User deleted successfully`)
      setSelectedIds([])
    },
    onError: () => toast.error("Failed to delete user")
  })

  // Mock list for offline support
  const mockUsersList: User[] = [
    { id: "u_1", name: "Suresh Kondeti", email: "suresh@apbuild.com", role: "vendor", phone: "+91 98480 22338" },
    { id: "u_2", name: "Ananya Reddi", email: "ananya.r@outlook.com", role: "client", phone: "+91 89780 11223" },
    { id: "u_3", name: "Naidu Electricals", email: "naidu.elec@gmail.com", role: "vendor", phone: "+91 76540 98765" },
    { id: "u_4", name: "P. Srinivasa Rao", email: "psr.guntur@yahoo.com", role: "client", phone: "+91 99887 76655" },
    { id: "u_5", name: "Gopal Raju", email: "gopal.raju@construction.in", role: "vendor", phone: "+91 81223 34455" },
    { id: "u_6", name: "Chaitanya V.", email: "chaitanya@vizagdesign.com", role: "client", phone: "+91 90001 20002" },
    { id: "u_7", name: "AP Masonry Group", email: "contact@apmasonry.in", role: "vendor", phone: "+91 94405 61122" },
    { id: "u_8", name: "B. Lakshmi", email: "lakshmi.b@gmail.com", role: "client", phone: "+91 80081 23456" },
    { id: "u_9", name: "Kalyan Kumar", email: "kalyan.plumbing@gmail.com", role: "vendor", phone: "+91 73380 44556" },
    { id: "u_10", name: "M. Subba Reddy", email: "subbareddy@ap.gov.in", role: "client", phone: "+91 98660 77889" },
    { id: "u_11", name: "Vijayawada Tile Mart", email: "tiles.vja@gmail.com", role: "vendor", phone: "+91 90102 03040" },
    { id: "u_12", name: "K. Ranga Rao", email: "rangarao@nellore.com", role: "client", phone: "+91 91234 56789" },
  ]

  // Integrate mock statuses
  const rawUsers = (response?.data && response.data.length > 0) ? response.data.map((usr: any, i: number) => ({
    ...usr,
    status: usr.status || (i === 5 ? "suspended" : "active"),
    joined: usr.joined || new Date(Date.now() - (i + 1) * 2 * 24 * 3600 * 1000).toISOString(),
    lastActive: usr.lastActive || new Date(Date.now() - i * 4 * 3600 * 1000).toISOString()
  })) : mockUsersList.map((usr, i) => ({
    ...usr,
    status: i === 5 ? "suspended" : "active",
    joined: new Date(Date.now() - (i + 1) * 2 * 24 * 3600 * 1000).toISOString(),
    lastActive: new Date(Date.now() - i * 4 * 3600 * 1000).toISOString()
  }))

  // Local filtering logic in case API yields empty list (offline mode)
  const processedUsers = React.useMemo(() => {
    let result = [...rawUsers]
    if (search) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter)
    }
    if (statusFilter) {
      result = result.filter(u => u.status === statusFilter)
    }
    return result
  }, [rawUsers, search, roleFilter, statusFilter])

  const paginatedUsers = React.useMemo(() => {
    const startIdx = (page - 1) * pageSize
    return processedUsers.slice(startIdx, startIdx + pageSize)
  }, [processedUsers, page])

  const totalPages = Math.max(Math.ceil(processedUsers.length / pageSize), 1)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedUsers.map(u => u.id)
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])))
    } else {
      const pageIds = paginatedUsers.map(u => u.id)
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)))
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id))
    }
  }

  // Bulk actions
  const handleBulkSuspend = () => {
    if (selectedIds.length === 0) return
    selectedIds.forEach(id => suspendMutation.mutate(id))
    toast.success(`Suspended ${selectedIds.length} users`)
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} users permanently?`)) return
    selectedIds.forEach(id => deleteMutation.mutate(id))
    toast.success(`Deleted ${selectedIds.length} users`)
    setSelectedIds([])
  }

  const toggleUserSuspension = (usr: any) => {
    if (usr.status === "suspended") {
      reinstateMutation.mutate(usr.id)
    } else {
      suspendMutation.mutate(usr.id)
    }
  }

  const handleDeleteUser = (id: string) => {
    if (!confirm("Are you sure you want to delete this user permanently?")) return
    deleteMutation.mutate(id)
  }

  const shellUser = React.useMemo(() => {
    return {
      name: currentUser?.name || "Admin Ops",
      email: currentUser?.email || "admin@homeevo.in",
      avatarInitials: currentUser?.name
        ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "AD",
    }
  }, [currentUser])

  return (
    <DashboardShell
      role="admin"
      navItems={adminNavItems}
      user={shellUser}
    >
      <div className="space-y-6 text-slate-100 font-admin">
        
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">User Administration</h1>
            <p className="text-xs text-slate-400">Suspend, reinstate, or terminate homeowner and contractor accounts.</p>
          </div>
        </div>

        {/* Filters and controls */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <Input
                placeholder="Search signups by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 bg-slate-950 border-slate-800 focus:border-blue-500 text-slate-200 text-xs h-10 w-full"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Role filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-bold text-[10px] tracking-wider uppercase text-slate-500">ROLE:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500 font-sans"
                >
                  <option value="">All Roles</option>
                  <option value="client">Client</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-bold text-[10px] tracking-wider uppercase text-slate-500">STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500 font-sans"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <Button
                variant="ghost"
                onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); setPage(1); }}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            </div>

          </div>
        </Card>

        {/* Data Table */}
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 pl-2.5 w-8">
                    <input 
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 accent-blue-500 cursor-pointer h-3.5 w-3.5"
                    />
                  </th>
                  <th className="pb-3 pl-1.5">User</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3">Last Active</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 animate-pulse">
                      Loading users data ledger...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No accounts matched the selection criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((usr: any) => {
                    const isSelected = selectedIds.includes(usr.id)
                    const joinDate = new Date(usr.joined).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                    const activeDate = new Date(usr.lastActive).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit"
                    })

                    return (
                      <tr key={usr.id} className={`hover:bg-slate-850/40 transition-colors ${isSelected ? 'bg-blue-600/5' : ''}`}>
                        <td className="py-3 pl-2.5">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(usr.id, e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 accent-blue-500 cursor-pointer h-3.5 w-3.5"
                          />
                        </td>
                        <td className="py-3 pl-1.5 font-medium text-white">{usr.name}</td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">{usr.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            usr.role === 'vendor' ? 'bg-orange/10 text-orange' : 'bg-blue-600/10 text-blue-400'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            usr.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[10px]">{joinDate}</td>
                        <td className="py-3 text-slate-400 font-mono text-[10px]">{activeDate}</td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View details */}
                            <button
                              onClick={() => setViewingUser(usr)}
                              title="View details"
                              className="p-1 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded transition-all cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Suspend/Reinstate */}
                            <button
                              onClick={() => toggleUserSuspension(usr)}
                              title={usr.status === 'suspended' ? 'Reinstate account' : 'Suspend account'}
                              className={`p-1 border rounded transition-all cursor-pointer ${
                                usr.status === 'suspended'
                                  ? 'text-green-400 border-green-500/20 bg-green-500/5 hover:bg-green-500/15'
                                  : 'text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15'
                              }`}
                            >
                              {usr.status === 'suspended' ? <UserCheck className="h-3.5 w-3.5" /> : <SuspendIcon className="h-3.5 w-3.5" />}
                            </button>

                            {/* Delete user */}
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              title="Permanently delete user"
                              className="p-1 text-red-500 hover:text-red-400 bg-red-500/5 border border-red-500/10 hover:border-red-500/35 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
            <span>Showing {paginatedUsers.length} of {processedUsers.length} records</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border border-slate-800 hover:bg-slate-800 hover:text-white h-8 text-xs px-2.5 font-bold uppercase"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-slate-300">Page {page} of {totalPages}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="border border-slate-800 hover:bg-slate-800 hover:text-white h-8 text-xs px-2.5 font-bold uppercase"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

        </Card>

        {/* Selected Items Floating Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-blue-500/40 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-5 z-50 animate-in slide-in-from-bottom duration-300 font-admin">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
              {selectedIds.length} users selected
            </span>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkSuspend}
                className="bg-amber-600 hover:bg-amber-700 text-white text-3xs uppercase font-bold tracking-widest h-8 px-3.5"
              >
                <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Suspend All
              </Button>
              <Button
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-3xs uppercase font-bold tracking-widest h-8 px-3.5"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete All
              </Button>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* View Details Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="bg-slate-900 border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in scale-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Account Profile</h3>
                <button
                  onClick={() => setViewingUser(null)}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Name */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Account Name</span>
                  <span className="text-sm font-bold text-white">{viewingUser.name}</span>
                </div>

                {/* Email */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Email Address</span>
                  <span className="text-slate-300 font-mono text-[11px]">{viewingUser.email}</span>
                </div>

                {/* Phone */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Phone Number</span>
                  <span className="text-slate-300 font-mono text-[11px]">{viewingUser.phone || "Not provided"}</span>
                </div>

                {/* Role */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Role Assignment</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-block mt-0.5 ${
                    viewingUser.role === 'vendor' ? 'bg-orange/10 text-orange' : 'bg-blue-600/10 text-blue-400'
                  }`}>
                    {viewingUser.role}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Access Status</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase inline-block mt-0.5 ${
                    (viewingUser as any).status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {(viewingUser as any).status}
                  </span>
                </div>

                {/* Database ID */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Database ID</span>
                  <span className="text-slate-500 font-mono text-[10px]">{viewingUser.id}</span>
                </div>

              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <Button
                  size="sm"
                  onClick={() => { toggleUserSuspension(viewingUser); setViewingUser(null); }}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-3xs font-bold uppercase tracking-widest h-8"
                >
                  {(viewingUser as any).status === "suspended" ? "Reinstate" : "Suspend"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => { handleDeleteUser(viewingUser.id); setViewingUser(null); }}
                  className="bg-red-600 hover:bg-red-700 text-white text-3xs font-bold uppercase tracking-widest h-8"
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </DashboardShell>
  )
}
