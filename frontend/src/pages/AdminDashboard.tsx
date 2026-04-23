import { useState, useEffect, type ElementType } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  Users,
  Settings,
  BarChart3,
  ShieldCheck,
  CalendarCheck,
  ChevronRight,
  Search,
  MoreVertical,
  LogOut,
  ArrowLeft,
  UserPlus,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  BellRing,
  Lock,
  Building2,
  AlertTriangle
} from "lucide-react"
import AdminFacilitiesPanel from "@/pages/AdminFacilitiesPanel"
import AdminBookingsPage from "@/pages/bookings/AdminBookingsPage"
import AdminAnalyticsPanel from "@/pages/AdminAnalyticsPanel"
import AdminSettingsPanel from "@/pages/AdminSettingsPanel"

// --- Types ---
interface User {
  id: string | number
  displayName: string
  email: string
  avatarUrl?: string
  roles: string[]
  adminProtected?: boolean
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

interface Notification {
  id: number
  message: string
  type: string
  createdAt: string
  read: boolean
}

// --- Components ---

interface NavItemProps {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

function NavItem({ icon: Icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 ${
        active 
          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "animate-pulse" : ""}`} />
      <span className="text-sm font-bold tracking-tight uppercase">{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-black bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20">
          {badge}
        </span>
      )}
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full" />}
    </button>
  )
}


function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openDropdown, setOpenDropdown] = useState<string | number | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json() as User[];
        setUsers(data);
      }
    } catch (err: unknown) {
      console.error("Fetch users failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = async (userId: number | string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes("ADMIN") ? ["USER"] : ["USER", "ADMIN"]
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoles),
        credentials: "include"
      })
      if (res.ok) fetchUsers()
    } catch (err: unknown) {
      console.error("Update role failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const deleteUser = async (userId: number | string) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchUsers();
        setOpenDropdown(null);
      } else {
        console.error("Failed to delete user");
      }
    } catch (err: unknown) {
      console.error("Delete user failed:", err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => { fetchUsers() }, [])

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Identity Governance</h2>
          <p className="text-white/60 font-medium max-w-md">Manage user access levels, audit identities, and assign administrative privileges across the campus network.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
             <input 
               type="text" 
               placeholder="Search identities..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none w-80 placeholder:text-white/40 transition-all focus:bg-white/10"
             />
           </div>
           <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
             Provision User
           </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/50 shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Principal</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Privileges</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Created At</th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-10 py-12 text-center text-white/10 font-black uppercase tracking-widest">Syncing Identity Data...</td>
                </tr>
              ))
            ) : filteredUsers.map(u => (
              <tr key={u.id} className="group hover:bg-white/[0.03] transition-colors">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="h-full w-full object-cover" /> : <Users className="h-6 w-6 text-indigo-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-lg text-white tracking-tight uppercase leading-none">{u.displayName}</p>
                        {u.adminProtected && (
                          <span title="Protected Account" className="text-amber-500">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1.5 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-wrap gap-2">
                    {u.roles.map(r => (
                      <span key={r} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        r === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-10 py-8 text-sm font-bold text-white/60 uppercase tracking-tighter">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Historical'}
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => toggleRole(u.id, u.roles)}
                      disabled={u.adminProtected}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        u.adminProtected
                          ? 'border-white/10 text-white/20 cursor-not-allowed'
                          : u.roles.includes('ADMIN')
                            ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                            : 'border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10'
                      }`}
                    >
                      {u.roles.includes('ADMIN') ? 'Revoke Admin' : 'Grant Admin'}
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                        className="p-3 rounded-xl border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openDropdown === u.id && (
                        <>
                          {/* Invisible backdrop to close dropdown when clicking outside */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdown(null)} 
                          />
                          
                          <div className="absolute right-0 top-full mt-3 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                            <div className="px-3 py-2.5 mb-1 border-b border-white/5 flex items-center justify-between">
                              <p className="text-[10px] font-black tracking-widest uppercase text-white/40">User Actions</p>
                              {u.adminProtected && <Lock className="h-3 w-3 text-white/20" />}
                            </div>
                            
                            <button 
                              onClick={() => {
                                deleteUser(u.id);
                                setOpenDropdown(null);
                              }}
                              disabled={u.adminProtected}
                              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                            >
                              <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white group-disabled:bg-white/5 group-disabled:text-white/20 flex items-center justify-center transition-all shrink-0">
                                <Trash2 className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col items-start leading-tight text-left">
                                <span>{u.adminProtected ? 'Protected User' : 'Remove Identity'}</span>
                                <span className="text-[10px] font-medium text-red-400/60 group-hover:text-red-300/80 group-disabled:text-white/30">
                                  {u.adminProtected ? 'Cannot be deleted' : 'Irreversible permanent action'}
                                </span>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json() as Notification[];
        setNotifications(data);
      }
    } catch (err: unknown) {
      console.error("Fetch notifications failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include"
      })
      if (res.ok) fetchNotifications()
    } catch (err: unknown) {
      console.error("Mark as read failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) fetchNotifications()
    } catch (err: unknown) {
      console.error("Delete notification failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/all`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) fetchNotifications()
    } catch (err: unknown) {
      console.error("Delete all notifications failed:", err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Security Audit Alerts</h2>
          <p className="text-white/60 font-medium max-w-sm">Real-time telemetry and identity lifecycle events requiring administrative oversight.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={deleteAllNotifications}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Alerts
          </button>
        )}
      </div>

      <div className="grid gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="p-20 text-center text-white/10 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">Syncing Telemetry...</div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center text-white/10 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">No active alerts detected</div>
        ) : notifications.map(n => (
          <div 
            key={n.id} 
            className={`group p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between ${
              n.read 
                ? "bg-white/[0.01] border-white/5 opacity-60" 
                : "bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                n.read ? "bg-white/5 border-white/10" : "bg-indigo-500/10 border-indigo-500/20"
              }`}>
                {n.type === "USER_REGISTRATION" ? <UserPlus className={`h-5 w-5 ${n.read ? "text-white/40" : "text-indigo-400"}`} /> : <BellRing className="h-5 w-5 text-indigo-400" />}
              </div>
              <div>
                <p className={`font-bold tracking-tight ${n.read ? "text-white/60" : "text-white"}`}>{n.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                   <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                     <Clock className="h-3 w-3" />
                     {new Date(n.createdAt).toLocaleString()}
                   </span>
                   {!n.read && <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               {!n.read && (
                 <button 
                   onClick={() => markAsRead(n.id)}
                   className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                   title="Mark as Read"
                 >
                   <CheckCircle2 className="h-4 w-4" />
                 </button>
               )}
               <button 
                 onClick={() => deleteNotification(n.id)}
                 className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                 title="Dismiss Alert"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
}

const STATUS_COLOR: Record<string, string> = {
  OPEN: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  IN_PROGRESS: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  RESOLVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  CLOSED: "text-white/40 bg-white/5 border-white/10",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
}

interface Ticket {
  id: string
  reporterName: string
  reporterEmail: string
  category: string
  description: string
  priority: string
  status: string
  assignedTechnicianName: string | null
  rejectionReason: string | null
  createdAt: string
}

interface Technician {
  id: string
  displayName: string
  email: string
  roles: string[]
}

function AdminTicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/tickets`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json() as Ticket[]
        setTickets(data)
      }
    } catch (err: unknown) {
      console.error("Fetch tickets failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json() as Technician[]
        setTechnicians(data.filter(u => u.roles.includes("TECHNICIAN")))
      }
    } catch (err: unknown) {
      console.error("Fetch technicians failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const updateStatus = async (id: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason: reason ?? null }),
      })
      if (res.ok) {
        fetchTickets()
        setRejectingId(null)
        setRejectionReason("")
      }
    } catch (err: unknown) {
      console.error("Update status failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const assignTechnician = async (ticketId: string, technicianId: string) => {
    if (!technicianId) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/tickets/${ticketId}/assign?technicianId=${technicianId}`, {
        method: "PATCH",
        credentials: "include",
      })
      if (res.ok) fetchTickets()
    } catch (err: unknown) {
      console.error("Assign technician failed:", err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => { fetchTickets(); fetchTechnicians() }, [])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Incident Tickets</h2>
        <p className="text-white/60 font-medium max-w-md">Review and manage all submitted incident reports. Update workflow status and reject with reason.</p>
      </div>

      {loading ? (
        <div className="p-20 text-center text-white/10 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="p-20 text-center text-white/10 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">No tickets found</div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:bg-white/[0.04] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-white uppercase tracking-tight">{ticket.category}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${PRIORITY_COLOR[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_COLOR[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2">{ticket.description}</p>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                    Reported by {ticket.reporterName} · {new Date(ticket.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  {ticket.assignedTechnicianName && (
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                      Assigned to {ticket.assignedTechnicianName}
                    </p>
                  )}
                  {ticket.rejectionReason && (
                    <p className="text-red-400 text-xs font-bold">Rejection: {ticket.rejectionReason}</p>
                  )}
                </div>

                {/* Status Controls */}
                <div className="flex flex-col gap-2 shrink-0">
                  <select
                    value={ticket.status}
                    onChange={e => {
                      const val = e.target.value
                      if (val === "REJECTED") {
                        setRejectingId(ticket.id)
                      } else {
                        updateStatus(ticket.id, val)
                      }
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-black uppercase focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    {TICKET_STATUSES.map(s => (
                      <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace("_", " ")}</option>
                    ))}
                    <option value="REJECTED" className="bg-[#1a1a1a]">REJECTED</option>
                  </select>

                  <select
                    defaultValue=""
                    onChange={e => assignTechnician(ticket.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-black focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    <option value="" disabled className="bg-[#1a1a1a] text-white/40">
                      {ticket.assignedTechnicianName ? `Assigned: ${ticket.assignedTechnicianName}` : "Assign Technician"}
                    </option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {rejectingId === ticket.id && (
                <div className="flex gap-3 pt-2 border-t border-white/5">
                  <input
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="flex-1 bg-white/5 border border-red-500/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder-white/20"
                  />
                  <button
                    onClick={() => updateStatus(ticket.id, "REJECTED", rejectionReason)}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-black uppercase disabled:opacity-50 hover:bg-red-500/30 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setRejectingId(null); setRejectionReason("") }}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-xs font-black uppercase hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("users")
  const [stats, setStats] = useState({
    userCount: 0,
    bookingCount: 0,
    incidentCount: 0,
    resourceCount: 0,
    pendingApprovalCount: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats/admin`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json() as typeof stats;
          setStats(data);
        }
      } catch (err: unknown) {
        console.error("Fetch admin stats failed:", err instanceof Error ? err.message : String(err))
      }
    }
    fetchStats()
  }, [])

  if (!user || !user.roles.includes("ADMIN")) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-[#030303] text-white p-12">
        <div className="h-24 w-24 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
           <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase text-center">Access Restricted</h1>
        <p className="max-w-md text-center text-white/50 font-medium text-lg leading-relaxed">Identity verification indicates missing administrative privileges for this secure zone.</p>
        <button onClick={() => navigate("/dashboard")} className="bg-white text-black font-black uppercase tracking-[.2em] px-12 py-5 rounded-full hover:scale-105 active:scale-95 transition-all text-xs">Return to User Dashboard</button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-[#030303] text-white font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 h-[80%] w-[50%] rounded-full bg-indigo-500/[0.03] blur-[150px]" />
         <div className="absolute bottom-0 left-0 h-[60%] w-[40%] rounded-full bg-red-500/[0.02] blur-[150px]" />
      </div>

      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-80 shrink-0 border-r border-white/[0.05] flex flex-col z-20 overflow-hidden bg-black/40 backdrop-blur-3xl">
        <div className="p-10 pb-12">
          <div className="py-2" />
          
          <div className="flex items-center gap-4 py-6 border-b border-white/[0.05]">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center border border-white/20 shadow-lg shadow-indigo-500/20">
               <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
               <p className="text-lg font-black tracking-tighter leading-none mb-1 text-white uppercase">Admin</p>
               <p className="text-[10px] font-black tracking-[.2em] text-indigo-400 uppercase">Secure Zone</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[.4em] px-4 mb-4">Core Governance</p>
          <NavItem icon={Users} label="User Management" active={activeTab === "users"} onClick={() => setActiveTab("users")} badge="Active" />
          <NavItem icon={CalendarCheck} label="Bookings" active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} />
          <NavItem icon={Building2} label="Facilities" active={activeTab === "facilities"} onClick={() => setActiveTab("facilities")} />
          <NavItem icon={BellRing} label="Audit Alerts" active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} badge={stats.pendingApprovalCount > 0 ? stats.pendingApprovalCount.toString() : undefined} />
          <NavItem icon={AlertTriangle} label="Tickets" active={activeTab === "tickets"} onClick={() => setActiveTab("tickets")} />
          
          <div className="py-8" />
          
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[.4em] px-4 mb-4">Telemetry</p>
          <NavItem icon={BarChart3} label="System Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <NavItem icon={Settings} label="Global Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-8 mt-auto border-t border-white/[0.05] bg-white/[0.02]">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                 <AlertCircle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Security Level</p>
                 <p className="text-xs font-bold text-orange-400 mt-1 uppercase">Elevated Access</p>
              </div>
           </div>
           <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-[10px] font-black tracking-widest uppercase text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
             <LogOut className="h-5 w-5" />
             <span>Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto custom-scrollbar">
        {/* Top Floating Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-12 py-8 bg-black/10 backdrop-blur-md">
            <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-widest">
              <span>Admin</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white">{activeTab === 'users' ? 'Identity Governance' : activeTab === 'bookings' ? 'Booking Governance' : activeTab === 'facilities' ? 'Facility Registry' : activeTab === 'notifications' ? 'Audit Alerts' : activeTab === 'tickets' ? 'Incident Tickets' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
              >
                 <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                 <span className="text-xs font-black uppercase tracking-widest">Return to User Dashboard</span>
              </button>

              <div className="h-8 w-px bg-white/5" />

              <button 
                onClick={() => setActiveTab("notifications")}
                className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all relative ${
                  activeTab === "notifications" ? "bg-indigo-500 border-indigo-400" : "border-white/5 hover:bg-white/5"
                }`}
              >
                 <BellRing className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-white' : 'text-white/50'}`} />
                 {stats.pendingApprovalCount > 0 && <span className="absolute top-3 right-3 h-2 w-2 bg-indigo-500 rounded-full border-2 border-[#030303]" />}
              </button>
            </div>
        </header>

        <div className="p-12 pb-24 space-y-12">

          {/* Dynamic Content */}
          <div className="relative">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "bookings" && <AdminBookingsPage />}
            {activeTab === "facilities" && <AdminFacilitiesPanel />}
            {activeTab === "notifications" && <NotificationsCenter />}
            {activeTab === "tickets" && <AdminTicketsPanel />}
            {activeTab === "analytics" && <AdminAnalyticsPanel />}
            {activeTab === "settings" && <AdminSettingsPanel />}
          </div>
        </div>
      </main>

      {/* Global CSS Overrides */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  )
}
