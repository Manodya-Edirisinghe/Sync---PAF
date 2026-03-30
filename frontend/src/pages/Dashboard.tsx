import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Users,
  LogOut,
  Bell,
  ChevronRight
} from "lucide-react"

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:      { label: "Admin",      color: "text-red-400",    bg: "bg-red-500/10 border border-red-500/20" },
  TECHNICIAN: { label: "Technician", color: "text-amber-400",  bg: "bg-amber-500/10 border border-amber-500/20" },
  USER:       { label: "User",       color: "text-emerald-400",bg: "bg-emerald-500/10 border border-emerald-500/20" },
}

const QUICK_ACTIONS = [
  { icon: CalendarCheck, label: "Resource Bookings", description: "Manage room & equipment reservations", color: "from-blue-600/20 to-blue-600/5", border: "border-blue-500/30", iconColor: "text-blue-400" },
  { icon: AlertTriangle, label: "Incident Reports",  description: "Submit and track campus incidents",    color: "from-orange-600/20 to-orange-600/5", border: "border-orange-500/30", iconColor: "text-orange-400" },
  { icon: Building2,     label: "Facilities",        description: "Browse campus facility details",       color: "from-purple-600/20 to-purple-600/5", border: "border-purple-500/30", iconColor: "text-purple-400" },
  { icon: Users,         label: "Directory",         description: "Find staff and student contacts",      color: "from-teal-600/20 to-teal-600/5", border: "border-teal-500/30", iconColor: "text-teal-400" },
]

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const dim = size === "sm" ? "h-8 w-8" : "h-14 w-14"
  const text = size === "sm" ? "text-xs" : "text-lg"
  
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full ring-2 ring-white/10 object-cover bg-neutral-800`}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full ring-2 ring-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold ${text}`}>
      {initials}
    </div>
  )
}

function ProfileDropdown({ user, logout, roleCfg, joinedDate }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 pr-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/20 outline-none"
      >
        <Avatar src={user.avatarUrl || undefined} name={user.displayName} size="sm" />
        <div className="hidden sm:flex flex-col items-start px-1 leading-tight">
           <span className="text-sm font-semibold text-white">{user.displayName}</span>
           <span className={`text-[10px] font-bold tracking-wider uppercase ${roleCfg.color}`}>{roleCfg.label}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="font-semibold text-white truncate text-base">{user.displayName}</p>
            <p className="text-sm text-white/60 truncate mt-0.5">{user.email}</p>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
               <span className="text-sm text-zinc-400">Primary Role</span>
               <span className={`text-xs px-2 py-0.5 rounded font-semibold ${roleCfg.bg} ${roleCfg.color}`}>{roleCfg.label}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-sm text-zinc-400">All Roles</span>
               <span className="text-sm font-medium text-white/90">{user.roles.join(", ")}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-sm text-zinc-400">Joined</span>
               <span className="text-sm font-medium text-white/90">{joinedDate}</span>
            </div>
          </div>
          <div className="p-2 border-t border-white/10 bg-black/20">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()

  if (!user) return null

  const primaryRole = user.roles.includes("ADMIN")
    ? "ADMIN"
    : user.roles.includes("TECHNICIAN")
    ? "TECHNICIAN"
    : "USER"
  const roleCfg = ROLE_CONFIG[primaryRole] ?? ROLE_CONFIG.USER

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Unknown"

  return (
    <div className="min-h-svh bg-[#080808] text-white font-sans selection:bg-indigo-500/30">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
            <LayoutDashboard className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-base font-bold tracking-wide text-white">Smart Campus</span>
          <span className="text-white/20 px-1">/</span>
          <span className="text-sm font-medium text-white/50">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-black" />
          </button>
          
          <ProfileDropdown 
            user={user} 
            logout={logout} 
            roleCfg={roleCfg} 
            joinedDate={joinedDate} 
          />
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        
        {/* Welcome hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-white/[0.03] to-transparent p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.displayName.split(" ")[0]}</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Here is what's happening on campus today. Manage your resources and stay updated with the latest alerts.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Bookings",  value: "—", sub: "this month" },
            { label: "Incidents", value: "—", sub: "reported" },
            { label: "Role",      value: roleCfg.label, sub: "access level" },
            { label: "Status",    value: "Active", sub: "account state" },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 space-y-2 hover:bg-white/[0.07] transition-colors"
            >
              <p className="text-sm font-medium text-white/60">{label}</p>
              <p className="text-2xl font-bold text-white truncate">{value}</p>
              <p className="text-xs font-medium text-white/40">{sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Quick Actions
            </h2>
            <div className="h-px bg-white/10 flex-1 ml-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map(({ icon: Icon, label, description, color, border, iconColor }) => (
              <button
                key={label}
                className={`group relative flex items-center gap-5 rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 text-left hover:border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-base mb-1">{label}</p>
                  <p className="text-sm text-white/60 truncate group-hover:text-white/80 transition-colors">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </section>

      </main>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    </div>
  )
}
