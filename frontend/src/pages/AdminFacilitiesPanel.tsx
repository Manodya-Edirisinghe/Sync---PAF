import { useState, useEffect } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Building2,
  Search,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

interface Facility {
  id: number
  name: string
  type: string
  capacity: number
  location: string
  availabilityWindows: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  type: string
  capacity: string
  location: string
  status: string
}

interface AvailabilityData {
  days: string[]
  startTime: string
  endTime: string
}

interface FormErrors {
  name?: string
  type?: string
  capacity?: string
  location?: string
  days?: string
  startTime?: string
  endTime?: string
}

const EMPTY_FORM: FormData = {
  name: "",
  type: "LAB",
  capacity: "",
  location: "",
  status: "ACTIVE",
}

const EMPTY_AVAILABILITY: AvailabilityData = {
  days: [],
  startTime: "",
  endTime: "",
}

const TYPE_OPTIONS = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"]
const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function typeLabel(t: string) {
  return t.replace(/_/g, " ")
}

function parseAvailabilityWindows(value: string | null): AvailabilityData {
  if (!value) return { ...EMPTY_AVAILABILITY }
  // e.g. "Mon, Wed, Fri 09:00-17:00"
  const match = value.match(/^(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/)
  if (!match) return { ...EMPTY_AVAILABILITY }
  const days = match[1].split(",").map((d) => d.trim()).filter(Boolean)
  return { days, startTime: match[2], endTime: match[3] }
}

function buildAvailabilityString(data: AvailabilityData): string {
  return `${data.days.join(", ")} ${data.startTime}-${data.endTime}`
}

export default function AdminFacilitiesPanel() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [availability, setAvailability] = useState<AvailabilityData>(EMPTY_AVAILABILITY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  // delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFacilities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/facilities`, { credentials: "include" })
      if (res.ok) {
        const data = (await res.json()) as Facility[]
        setFacilities(data)
      }
    } catch (err: unknown) {
      console.error("Fetch facilities failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setAvailability({ ...EMPTY_AVAILABILITY })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (f: Facility) => {
    setEditId(f.id)
    setForm({
      name: f.name,
      type: f.type,
      capacity: String(f.capacity),
      location: f.location ?? "",
      status: f.status,
    })
    setAvailability(parseAvailabilityWindows(f.availabilityWindows))
    setErrors({})
    setModalOpen(true)
  }

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = "Name is required"
    else if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters"
    else if (form.name.trim().length > 100) e.name = "Name must be at most 100 characters"

    if (!form.type) e.type = "Type is required"

    const cap = Number(form.capacity)
    if (!form.capacity.trim()) e.capacity = "Capacity is required"
    else if (isNaN(cap) || !Number.isInteger(cap)) e.capacity = "Must be a whole number"
    else if (cap < 1) e.capacity = "Minimum capacity is 1"
    else if (cap > 500) e.capacity = "Maximum capacity is 500"

    if (!form.location.trim()) e.location = "Location is required"
    else if (form.location.trim().length < 3) e.location = "Location must be at least 3 characters"

    if (availability.days.length === 0) e.days = "Select at least one day"
    if (!availability.startTime) e.startTime = "Start time is required"
    if (!availability.endTime) e.endTime = "End time is required"
    if (availability.startTime && availability.endTime && availability.endTime <= availability.startTime) {
      e.endTime = "End time must be after start time"
    }

    return e
  }

  const handleSave = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        capacity: Number(form.capacity),
        location: form.location.trim(),
        availabilityWindows: buildAvailabilityString(availability),
        status: form.status,
      }
      const url = editId
        ? `${API_BASE_URL}/api/v1/facilities/${editId}`
        : `${API_BASE_URL}/api/v1/facilities`
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (res.ok) {
        setModalOpen(false)
        fetchFacilities()
      }
    } catch (err: unknown) {
      console.error("Save failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (f: Facility) => {
    const newStatus = f.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE"
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/facilities/${f.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })
      if (res.ok) fetchFacilities()
    } catch (err: unknown) {
      console.error("Status toggle failed:", err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/facilities/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setDeleteId(null)
        fetchFacilities()
      }
    } catch (err: unknown) {
      console.error("Delete failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setDeleting(false)
    }
  }

  const toggleDay = (day: string) => {
    clearError("days")
    setAvailability((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  const filtered = facilities.filter((f) => {
    const q = search.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      (f.location && f.location.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Facility Registry
          </h2>
          <p className="text-white/60 font-medium max-w-md">
            Manage campus facilities, update availability, and control operational status across all
            locations.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none w-80 placeholder:text-white/40 transition-all focus:bg-white/10"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Facility
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/50 shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Facility
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Type
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Capacity
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Location
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Status
              </th>
              <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 text-right">
                Operations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-10 py-12 text-center text-white/10 font-black uppercase tracking-widest">
                    Syncing Facility Data...
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-10 py-16 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-white/10 mb-4" />
                  <p className="text-white/30 font-bold uppercase tracking-widest text-xs">
                    {search ? "No matching facilities" : "No facilities registered"}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const isActive = f.status === "ACTIVE"
                return (
                  <tr key={f.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-extrabold text-lg text-white tracking-tight uppercase leading-none">
                            {f.name}
                          </p>
                          {f.availabilityWindows && (
                            <p className="text-xs text-white/40 mt-1.5 font-medium">
                              {f.availabilityWindows}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        {typeLabel(f.type)}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-sm font-bold text-white/60">{f.capacity}</td>
                    <td className="px-10 py-8 text-sm font-bold text-white/60">{f.location || "—"}</td>
                    <td className="px-10 py-8">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`}
                        />
                        {isActive ? "Active" : "Offline"}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(f)}
                          title={isActive ? "Set out of service" : "Set active"}
                          className="p-3 rounded-xl border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        >
                          {isActive ? (
                            <ToggleRight className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(f)}
                          className="p-3 rounded-xl border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(f.id)}
                          className="p-3 rounded-xl border border-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 bg-[#0a0a0a] p-10 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight">
                {editId ? "Edit Facility" : "New Facility"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <Field label="Name" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError("name") }}
                  className={`w-full rounded-2xl border ${errors.name ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/30`}
                  placeholder="e.g. Main Laboratory"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type" error={errors.type}>
                  <select
                    value={form.type}
                    onChange={(e) => { setForm({ ...form, type: e.target.value }); clearError("type") }}
                    className={`w-full rounded-2xl border ${errors.type ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all appearance-none`}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="bg-[#0a0a0a] text-white">
                        {typeLabel(t)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Capacity" error={errors.capacity}>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={form.capacity}
                    onChange={(e) => { setForm({ ...form, capacity: e.target.value }); clearError("capacity") }}
                    className={`w-full rounded-2xl border ${errors.capacity ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all no-spinner`}
                    placeholder=""
                  />
                </Field>
              </div>

              <Field label="Location" error={errors.location}>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => { setForm({ ...form, location: e.target.value }); clearError("location") }}
                  className={`w-full rounded-2xl border ${errors.location ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/30`}
                  placeholder="e.g. Building A, Floor 2"
                />
              </Field>

              {/* Availability Windows */}
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                  Availability Windows
                </label>

                {/* Day checkboxes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {DAY_OPTIONS.map((day) => {
                    const selected = availability.days.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                          selected
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                            : "bg-white/[0.03] text-white/40 border-white/10 hover:bg-white/[0.06] hover:text-white/60"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                {errors.days && <p className="text-red-400 text-xs font-bold mb-3">{errors.days}</p>}

                {/* Time range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={availability.startTime}
                      onChange={(e) => { setAvailability({ ...availability, startTime: e.target.value }); clearError("startTime") }}
                      className={`w-full rounded-2xl border ${errors.startTime ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all`}
                    />
                    {errors.startTime && <p className="text-red-400 text-xs font-bold mt-1.5">{errors.startTime}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={availability.endTime}
                      onChange={(e) => { setAvailability({ ...availability, endTime: e.target.value }); clearError("endTime") }}
                      className={`w-full rounded-2xl border ${errors.endTime ? "border-red-500/50" : "border-white/10"} bg-white/[0.03] px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all`}
                    />
                    {errors.endTime && <p className="text-red-400 text-xs font-bold mt-1.5">{errors.endTime}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-8 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-[32px] border border-red-500/20 bg-[#0a0a0a] p-10 shadow-2xl text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Delete Facility</h3>
            <p className="text-white/50 font-medium text-sm mb-8">
              This action is permanent and cannot be reversed. All associated data will be purged.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-8 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-red-500/20"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide number input spinner arrows */}
      <style>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs font-bold mt-1.5">{error}</p>}
    </div>
  )
}
