import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Search,
  ShoppingBag,
  Wallet,
  MessageSquare,
  Settings,
  UserPlus,
  Hammer,
  Gavel,
  CreditCard,
  FolderKanban,
  Star,
  Users,
  ShieldCheck,
  Settings2,
  IndianRupee,
  BarChart3,
  AlertOctagon,
  Sliders,
} from "lucide-react"
import { NavItem } from "@/types"

export const clientNavItems: NavItem[] = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Projects", href: "/client/projects", icon: Briefcase },
  { label: "AI Blueprint", href: "/client/blueprint", icon: Sparkles },
  { label: "Find Vendors", href: "/client/vendors", icon: Search },
  { label: "Materials Store", href: "/client/materials", icon: ShoppingBag },
  { label: "Escrow Wallet", href: "/client/wallet", icon: Wallet },
  { label: "Messages", href: "/client/messages", icon: MessageSquare, badge: 3 },
  { label: "Settings", href: "/client/settings", icon: Settings },
]

export const vendorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "New Leads", href: "/vendor/leads", icon: UserPlus, badge: 5 },
  { label: "Active Projects", href: "/vendor/projects", icon: Hammer },
  { label: "My Bids", href: "/vendor/bids", icon: Gavel },
  { label: "Payments", href: "/vendor/payments", icon: CreditCard },
  { label: "Escrow Balance", href: "/vendor/escrow", icon: Wallet },
  { label: "Portfolio", href: "/vendor/portfolio", icon: FolderKanban },
  { label: "Reviews", href: "/vendor/reviews", icon: Star },
  { label: "Messages", href: "/vendor/messages", icon: MessageSquare },
  { label: "Settings", href: "/vendor/settings", icon: Settings },
]

export const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendor Verification", href: "/admin/vendors", icon: ShieldCheck, badge: 2 },
  { label: "Payments", href: "/admin/payments", icon: IndianRupee },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Complaints", href: "/admin/complaints", icon: AlertOctagon, badge: 1 },
  { label: "System", href: "/admin/system", icon: Sliders },
]
