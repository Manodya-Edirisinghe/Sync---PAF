import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createTicket, type TicketPriority } from "@/api/IncidentsApi"
import { AlertTriangle } from "lucide-react"

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
const CATEGORIES = ["Equipment", "Electrical", "Plumbing", "Structural", "IT", "Cleaning", "Safety", "Other"]
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

interface Facility {
  id: number
  name: string
  location: string
  status: string
}

export default function NewIncidentPage() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [form, setForm] = useState({
    category: "",
    incidentCategory: "",
    description: "",
    priority: "MEDIUM" as TicketPriority,
    preferredContact: "",
    attachmentUrls: ["", "", ""],
  })

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/facilities`, { credentials: "include" })
      .then(r => r.json())
      .then((data: Facility[]) => setFacilities(data.filter(f => f.status === "ACTIVE")))
      .catch(() => setFacilities([]))
  }, [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleAttachment(index: number, value: string) {
    setForm(prev => {
      const urls = [...prev.attachmentUrls]
      urls[index] = value
      return { ...prev, attachmentUrls: urls }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const attachmentUrls = form.attachmentUrls.filter(url => url.trim() !== "")
      await createTicket({
        category: `${form.incidentCategory} - ${form.category}`,
        description: form.description,
        priority: form.priority,
        preferredContact: form.preferredContact,
        attachmentUrls,
      })
      navigate("/incidents")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create ticket")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white px-8 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Report Incident</h1>
            <p className="text-white/50 text-sm font-medium">Submit a new incident or maintenance request</p>
          </div>
        </div>

        <button onClick={() => navigate("/incidents")} className="text-white/40 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
          ← Back to Incidents
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Category</label>
            <select
              required
              value={form.incidentCategory}
              onChange={e => handleChange("incidentCategory", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-all"
            >
              <option value="" disabled className="bg-[#1a1a1a]">Select a category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Location</label>
            <select
              required
              value={form.category}
              onChange={e => handleChange("category", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-all"
            >
              <option value="" disabled className="bg-[#1a1a1a]">Select a location</option>
              {facilities.map(f => (
                <option key={f.id} value={f.name} className="bg-[#1a1a1a]">
                  {f.name} — {f.location}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="Describe the issue in detail..."
              maxLength={2000}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-all resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Priority</label>
            <select
              value={form.priority}
              onChange={e => handleChange("priority", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-all"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p} className="bg-[#1a1a1a]">{p}</option>
              ))}
            </select>
          </div>

          {/* Preferred Contact */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Preferred Contact</label>
            <input
              required
              value={form.preferredContact}
              onChange={e => handleChange("preferredContact", e.target.value)}
              placeholder="e.g. your@email.com or phone number"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Image URLs (max 3)</label>
            {form.attachmentUrls.map((url, i) => (
              <input
                key={i}
                value={url}
                onChange={e => handleAttachment(i, e.target.value)}
                placeholder={`Image URL ${i + 1} (optional)`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-all mb-2"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 font-black uppercase tracking-widest text-sm px-5 py-4 rounded-xl transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Incident"}
          </button>
        </form>

      </div>
    </div>
  )
}
