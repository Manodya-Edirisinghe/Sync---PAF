import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  CalendarCheck,
  AlertTriangle,
  Building2,
  Users,
  LogOut,
  Bell,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react"

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ADMIN:      { label: "Administrator", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  TECHNICIAN: { label: "Technician",    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  USER:       { label: "Campus User",   color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
}

const QUICK_ACTIONS = [
  { 
    icon: CalendarCheck, 
    label: "Resource Bookings", 
    description: "Manage room & equipment reservations", 
    color: "from-blue-500/20 to-transparent", 
    border: "border-blue-500/20", 
    iconColor: "text-blue-400",
    shadow: "shadow-blue-500/10"
  },
  { 
    icon: AlertTriangle, 
    label: "Incident Reports",  
    description: "Submit and track campus incidents",    
    color: "from-orange-500/20 to-transparent", 
    border: "border-orange-500/20", 
    iconColor: "text-orange-400",
    shadow: "shadow-orange-500/10" 
  },
  { 
    icon: Building2,     
    label: "Facilities",        
    description: "Browse campus facility details",       
    color: "from-purple-500/20 to-transparent", 
    border: "border-purple-500/20", 
    iconColor: "text-purple-400",
    shadow: "shadow-purple-500/10"
  },
  { 
    icon: Users,         
    label: "Directory",         
    description: "Find staff and student contacts",      
    color: "from-teal-500/20 to-transparent", 
    border: "border-teal-500/20", 
    iconColor: "text-teal-400",
    shadow: "shadow-teal-500/10"
  },
]

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const dim = size === "sm" ? "h-9 w-9" : "h-16 w-16"
  const text = size === "sm" ? "text-[10px]" : "text-xl"
  
  if (src) {
    return (
      <div className={`${dim} rounded-full ring-1 ring-white/20 p-0.5 bg-white/5`}>
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover bg-neutral-800"
        />
      </div>
    )
  }
  return (
    <div className={`${dim} rounded-full ring-1 ring-white/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold tracking-tighter ${text}`}>
      {initials}
    </div>
  )
}

interface ProfileDropdownProps {
  user: any;
  logout: () => void;
  roleCfg: { label: string; color: string; bg: string; border: string };
  joinedDate: string;
}

function ProfileDropdown({ user, logout, roleCfg, joinedDate }: ProfileDropdownProps) {
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
        className="flex items-center gap-3 rounded-2xl p-1.5 pr-5 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all focus:ring-1 focus:ring-white/20 outline-none backdrop-blur-md group"
      >
        <Avatar src={user.avatarUrl || undefined} name={user.displayName} size="sm" />
        <div className="hidden sm:flex flex-col items-start leading-tight">
           <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.displayName}</span>
           <span className={`text-[9px] font-black tracking-[0.2em] uppercase opacity-70 ${roleCfg.color}`}>{roleCfg.label}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-2xl">
          <div className="p-6 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <p className="font-extrabold text-white truncate text-lg tracking-tight uppercase">{user.displayName}</p>
            <p className="text-xs text-white/40 truncate font-medium mt-1">{user.email}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between px-2">
               <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Access Tier</span>
               <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase ${roleCfg.bg} ${roleCfg.color} border ${roleCfg.border}`}>{roleCfg.label}</span>
            </div>
            <div className="flex items-center justify-between px-2">
               <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Member Since</span>
               <span className="text-sm font-bold text-white/80">{joinedDate}</span>
            </div>
          </div>
          <div className="p-2 bg-black/40">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-all uppercase tracking-widest"
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
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

  const [stats, setStats] = useState({
    userCount: 0,
    bookingCount: 0,
    incidentCount: 0,
    resourceCount: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats`, { credentials: "include" })
        if (res.ok) setStats(await res.json())
      } catch (err) {
        console.error("Fetch stats failed:", err)
      }
    }
    fetchStats()
  }, [API_BASE_URL])

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
    <div className="min-h-svh bg-[#030303] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-300">
        {/* Glass Header Wrap */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-b border-white/[0.05]" />
        
        <div className="relative flex items-center gap-4">
          <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <ShieldAlert className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white leading-none uppercase">Smart Campus</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1.5">Operations Hub</span>
          </div>
        </div>

        <div className="relative flex items-center gap-6">
          {user.roles.includes("ADMIN") && (
            <button
              onClick={() => navigate("/admin")}
              className="hidden sm:flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Admin Console</span>
            </button>
          )}

          <div className="h-8 w-px bg-white/10" />

          <button className="rounded-full p-2.5 text-white/30 hover:bg-white/10 hover:text-white transition-all relative group">
            <Bell className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#030303] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </button>
          
          <ProfileDropdown 
            user={user} 
            logout={logout} 
            roleCfg={roleCfg} 
            joinedDate={joinedDate} 
          />
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-8 py-12 space-y-16">
        
        {/* Welcome Section */}
        <section className="relative group overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/50 p-12 lg:p-20 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px] group-hover:bg-indigo-500/15 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-3 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Campus Status: Optimal</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                Ready for business, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">{user.displayName.split(" ")[0]}?</span>
              </h1>
              <p className="text-xl text-white/40 max-w-lg leading-relaxed font-medium">
                Monitor campus operations, manage key facilities, and handle incidents through your unified operations hub.
              </p>
            </div>
            <div className="hidden lg:block relative">
               <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
               <Avatar src={user.avatarUrl || undefined} name={user.displayName} />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Bookings",  value: stats.bookingCount.toString(), sub: "Active requests", color: "text-blue-400" },
            { label: "Incidents", value: stats.incidentCount.toString().padStart(2, '0'), sub: "Pending review", color: "text-orange-400" },
            { label: "Access",    value: roleCfg.label, sub: "Hierarchy level", color: roleCfg.color },
            { label: "Session",   value: "Secure", sub: "System status", color: "text-emerald-400" },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="group rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-4 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-black tracking-tighter ${color}`}>{value}</p>
                {label === "Bookings" && <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />}
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 whitespace-nowrap">
              Operations Control
            </h2>
            <div className="h-[1px] bg-white/[0.05] flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUICK_ACTIONS.map(({ icon: Icon, label, description, color, border, iconColor, shadow }) => (
              <button
                key={label}
                className={`group relative flex items-center gap-8 rounded-[32px] border ${border} bg-gradient-to-br ${color} p-10 text-left transition-all duration-500 hover:shadow-2xl ${shadow} hover:-translate-y-1 overflow-hidden`}
              >
                <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <Icon className={`h-10 w-10 ${iconColor}`} />
                </div>
                
                <div className="relative min-w-0 flex-1">
                  <p className="font-black text-white text-2xl mb-2 tracking-tight uppercase leading-none">{label}</p>
                  <p className="text-base text-white/30 font-medium group-hover:text-white/60 transition-colors">{description}</p>
                </div>
                
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="h-6 w-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>

      <footer className="px-8 py-20 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">Authorized Personnel Only • Smart Campus 2026</p>
      </footer>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </div>
  )
}
