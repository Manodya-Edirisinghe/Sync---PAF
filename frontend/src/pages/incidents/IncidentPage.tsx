import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyTickets, deleteTicket, type TicketResponse } from "@/api/IncidentsApi"
import { Plus, Trash2, Eye, AlertTriangle } from "lucide-react"

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

export default function IncidentPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return
    try {
      await deleteTicket(id)
      setTickets(prev => prev.filter(t => t.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete ticket")
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white px-8 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">Incident Reports</h1>
              <p className="text-white/50 text-sm font-medium">Track and manage your submitted incidents</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/incidents/new")}
            className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            New Incident
          </button>
        </div>

        {/* Back button */}
        <button onClick={() => navigate("/dashboard")} className="text-white/40 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
          ← Back to Dashboard
        </button>

        {/* Content */}
        {loading && <p className="text-white/50 text-center py-20">Loading...</p>}
        {error && <p className="text-red-400 text-center py-20">{error}</p>}
        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-20 text-white/30 font-bold uppercase tracking-widest">
            No incidents reported yet
          </div>
        )}

        <div className="space-y-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all"
            >
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
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/incidents/${ticket.id}`)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
