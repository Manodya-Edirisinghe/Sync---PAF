import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getTicketById,
  getComments,
  addComment,
  editComment,
  deleteComment,
  updateTicketStatus,
  type TicketResponse,
  type CommentResponse,
  type TicketStatus,
} from "@/api/IncidentsApi"
import { useAuth } from "@/context/AuthContext"
import { AlertTriangle, Send, Pencil, Trash2 } from "lucide-react"

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

const TECHNICIAN_STATUSES: TicketStatus[] = ["IN_PROGRESS", "RESOLVED", "CLOSED"]

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Technician controls
  const [techStatus, setTechStatus] = useState<TicketStatus>("IN_PROGRESS")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getTicketById(id), getComments(id)])
      .then(([t, c]) => {
        setTicket(t)
        setComments(c)
        setTechStatus(t.status as TicketStatus)
        setResolutionNotes(t.resolutionNotes ?? "")
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const isTechnician = user?.roles?.includes("TECHNICIAN")
  const isAssignedTechnician = isTechnician && ticket?.assignedTechnicianEmail === user?.email

  async function handleSaveTechnicianUpdate() {
    if (!id) return
    setSavingStatus(true)
    try {
      const updated = await updateTicketStatus(id, techStatus, undefined, resolutionNotes)
      setTicket(updated)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update ticket")
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleAddComment() {
    if (!id || !newComment.trim()) return
    setSubmitting(true)
    try {
      const comment = await addComment(id, newComment.trim())
      setComments(prev => [...prev, comment])
      setNewComment("")
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditComment(commentId: string) {
    if (!id || !editContent.trim()) return
    try {
      const updated = await editComment(id, commentId, editContent.trim())
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      setEditingId(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to edit comment")
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!id || !confirm("Delete this comment?")) return
    try {
      await deleteComment(id, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete comment")
    }
  }

  if (loading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white/50">Loading...</div>
  if (error || !ticket) return <div className="min-h-screen bg-[#030303] flex items-center justify-center text-red-400">{error ?? "Ticket not found"}</div>

  return (
    <div className="min-h-screen bg-[#030303] text-white px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Incident Detail</h1>
            <p className="text-white/30 text-xs font-mono mt-1">{ticket.id}</p>
          </div>
        </div>

        <button onClick={() => navigate("/incidents")} className="text-white/40 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
          ← Back to Incidents
        </button>

        {/* Ticket Info */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${PRIORITY_COLOR[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_COLOR[ticket.status]}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Location</p>
            <p className="text-white font-bold">{ticket.category}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Description</p>
            <p className="text-white/70 leading-relaxed">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Preferred Contact</p>
              <p className="text-white/70 text-sm">{ticket.preferredContact}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Assigned To</p>
              <p className="text-white/70 text-sm">{ticket.assignedTechnicianName ?? "Unassigned"}</p>
            </div>
          </div>

          {ticket.resolutionNotes && (
            <div className="space-y-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Resolution Notes</p>
              <p className="text-white/70 text-sm">{ticket.resolutionNotes}</p>
            </div>
          )}

          {ticket.rejectionReason && (
            <div className="space-y-1 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Rejection Reason</p>
              <p className="text-white/70 text-sm">{ticket.rejectionReason}</p>
            </div>
          )}

          {ticket.attachmentUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Attachments</p>
              <div className="flex flex-wrap gap-3">
                {ticket.attachmentUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-400 underline hover:text-blue-300">
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
            Submitted {new Date(ticket.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Technician Controls */}
        {isAssignedTechnician && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Technician Controls</p>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Update Status</label>
              <select
                value={techStatus}
                onChange={e => setTechStatus(e.target.value as TicketStatus)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              >
                {TECHNICIAN_STATUSES.map(s => (
                  <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Resolution Notes</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Describe what was done to resolve this issue..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSaveTechnicianUpdate}
              disabled={savingStatus}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {savingStatus ? "Saving..." : "Save Update"}
            </button>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Comments</h2>

          {comments.length === 0 && (
            <p className="text-white/20 text-sm font-bold uppercase tracking-widest text-center py-8">No comments yet</p>
          )}

          {comments.map(comment => (
            <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm">{comment.authorName}</span>
                  <span className="text-white/30 text-xs ml-3">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                {user?.email === comment.authorEmail && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="flex gap-2">
                  <input
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
                  />
                  <button onClick={() => handleEditComment(comment.id)}
                    className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-black uppercase">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-xs font-black uppercase">
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-white/70 text-sm">{comment.content}</p>
              )}
            </div>
          ))}

          {/* Add Comment */}
          <div className="flex gap-3">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-all"
              onKeyDown={e => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="p-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
