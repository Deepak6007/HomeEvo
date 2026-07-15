"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export default function DashboardRedirect() {
  const router = useRouter()
  const role = useAuthStore((state) => state.role)

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin/dashboard")
    } else if (role === "vendor") {
      router.replace("/vendor/dashboard")
    } else if (role === "client") {
      router.replace("/client/dashboard")
    } else {
      router.replace("/signin")
    }
  }, [role, router])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans text-xs space-y-3">
      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span>Loading operations workspace...</span>
    </div>
  )
}
